// three.js r128 is loaded as a global by the apartment page
const THREE = window.THREE;

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

// position = the player's feet. The mesh is built so its origin is at the feet too.
export class Player {
  constructor(world, cfg) {
    this.world = world;
    this.cfg = cfg;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.grounded = false;
    this.facing = 0;
    this.time = 0;

    this.mesh = buildJelly(cfg);
    this.body = this.mesh.getObjectByName('body');

    // Ray origins for horizontal collision: just above step height, middle, near top
    this.probeHeights = [cfg.stepHeight + 0.002, cfg.height * 0.5, cfg.height * 0.9];
    // Ground probes: center plus 4 points around the footprint so we don't slip into gaps
    const r = cfg.radius * 0.7;
    this.groundOffsets = [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]];
    this.pushDirs = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    });

    this._o = new THREE.Vector3();
    this._d = new THREE.Vector3();
  }

  spawn(p) {
    this.position.copy(p);
    this.velocity.set(0, 0, 0);
    this.grounded = false;
    this.syncMesh();
  }

  update(dt, input, cameraYaw) {
    const c = this.cfg;
    this.time += dt;

    // --- Desired horizontal velocity, relative to the camera --------------
    const axes = input.moveAxes();
    const fwd = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
    const wish = fwd.multiplyScalar(axes.y).add(right.multiplyScalar(axes.x));
    if (wish.lengthSq() > 1) wish.normalize();
    const speed = input.sprint ? c.sprintSpeed : c.walkSpeed;
    wish.multiplyScalar(speed);

    const accel = this.grounded ? c.groundAccel : c.airAccel;
    const t = 1 - Math.exp(-accel * dt);
    this.velocity.x += (wish.x - this.velocity.x) * t;
    this.velocity.z += (wish.z - this.velocity.z) * t;

    // --- Jump + gravity ---------------------------------------------------
    if (input.consumeJump() && this.grounded) {
      this.velocity.y = Math.sqrt(2 * c.gravity * c.jumpHeight);
      this.grounded = false;
    }
    this.velocity.y -= c.gravity * dt;

    // --- Move -------------------------------------------------------------
    this.moveHorizontal(this.velocity.x * dt, this.velocity.z * dt);
    this.depenetrate();
    this.moveVertical(dt);

    // --- Face movement direction -----------------------------------------
    const hv = Math.hypot(this.velocity.x, this.velocity.z);
    if (hv > 0.02) {
      const target = Math.atan2(this.velocity.x, this.velocity.z);
      let diff = target - this.facing;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.facing += diff * (1 - Math.exp(-c.turnSpeed * dt));
    }

    this.animate(hv);
    this.syncMesh();
  }

  moveHorizontal(dx, dz) {
    const len = Math.hypot(dx, dz);
    if (len < 1e-8) return;
    // Sub-step so we never move more than half a radius per step (no tunneling)
    const steps = Math.max(1, Math.ceil(len / (this.cfg.radius * 0.5)));
    const step = new THREE.Vector3(dx / steps, 0, dz / steps);
    for (let i = 0; i < steps; i++) this.tryMove(step.clone());
  }

  // Move by v, sliding along whatever we hit.
  tryMove(v) {
    const r = this.cfg.radius;
    for (let iter = 0; iter < 3; iter++) {
      const len = v.length();
      if (len < 1e-8) return;
      const dir = this._d.copy(v).divideScalar(len);

      let nearest = null;
      for (const h of this.probeHeights) {
        this._o.set(this.position.x, this.position.y + h, this.position.z);
        const hit = this.world.cast(this._o, dir, r + len);
        if (hit && (!nearest || hit.distance < nearest.distance)) nearest = hit;
      }

      if (!nearest) { this.position.add(v); return; }

      const allowed = Math.max(0, nearest.distance - r);
      this.position.addScaledVector(dir, allowed);

      const n = nearest.normal;
      n.y = 0;
      if (n.lengthSq() < 1e-8) return;
      n.normalize();
      v.multiplyScalar(1 - allowed / len);
      v.addScaledVector(n, -v.dot(n));
    }
  }

  // Push out of walls we've ended up too close to (corners, diagonal slides).
  depenetrate() {
    const r = this.cfg.radius;
    this._o.set(this.position.x, this.position.y + this.cfg.height * 0.5, this.position.z);
    for (const d of this.pushDirs) {
      const hit = this.world.cast(this._o, d, r);
      if (hit) this.position.addScaledVector(d, -(r - hit.distance));
    }
  }

  moveVertical(dt) {
    const c = this.cfg;
    const vy = this.velocity.y;
    const half = c.height * 0.5;

    if (vy > 0) {
      // Ceiling check
      this._o.set(this.position.x, this.position.y + half, this.position.z);
      const hit = this.world.cast(this._o, UP, half + vy * dt);
      if (hit) {
        this.position.y += Math.max(0, hit.distance - half);
        this.velocity.y = 0;
      } else {
        this.position.y += vy * dt;
      }
      this.grounded = false;
      return;
    }

    // Falling or standing: find the highest ground under our footprint
    const snap = this.grounded ? c.stepHeight : 0;
    const far = half + Math.max(0, -vy * dt) + snap;
    let groundY = -Infinity;
    for (const [ox, oz] of this.groundOffsets) {
      this._o.set(this.position.x + ox, this.position.y + half, this.position.z + oz);
      const hit = this.world.cast(this._o, DOWN, far);
      if (hit) groundY = Math.max(groundY, this._o.y - hit.distance);
    }

    if (groundY > -Infinity) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.grounded = true;
    } else {
      this.position.y += vy * dt;
      this.grounded = false;
    }
  }

  // Squash & stretch so it feels like jelly
  animate(hv) {
    let sy = 1;
    if (this.grounded) {
      sy = 1 + Math.sin(this.time * 22) * 0.08 * Math.min(1, hv / this.cfg.walkSpeed);
    } else {
      sy = 1 + THREE.MathUtils.clamp(this.velocity.y * 0.25, -0.15, 0.2);
    }
    const sxz = 1 / Math.sqrt(sy);
    this.body.scale.set(sxz, sy, sxz);
  }

  syncMesh() {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing;
  }
}

function buildJelly(cfg) {
  const group = new THREE.Group();
  group.name = 'Player';

  // "body" is scaled for squash/stretch; its origin sits at the feet.
  const body = new THREE.Group();
  body.name = 'body';
  group.add(body);

  const R = cfg.radius * 1.15;
  const blob = new THREE.Mesh(
    new THREE.SphereGeometry(R, 32, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xff6fb5, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1,
      emissive: 0x551133, emissiveIntensity: 0.4,
    }),
  );
  blob.scale.set(1, cfg.height / (2 * R), 1);
  blob.position.y = cfg.height / 2;
  blob.castShadow = true;
  body.add(blob);

  const eyeGeo = new THREE.SphereGeometry(cfg.radius * 0.18, 12, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(side * R * 0.35, cfg.height * 0.62, R * 0.9);
    body.add(eye);
  }
  return group;
}
