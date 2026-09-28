// three.js r128 is loaded as a global by the apartment page
const THREE = window.THREE;

// Orbit camera that follows the player and pulls in when something is
// between it and the player (so it never ends up inside a couch).
export class ThirdPersonCamera {
  constructor(camera, world, cfg) {
    this.camera = camera;
    this.world = world;
    this.cfg = cfg;
    this.yaw = 0;
    this.pitch = 0.35;
    this.distance = cfg.distance;
    this.currentDistance = cfg.distance;
    this.focus = new THREE.Vector3();
    this._dir = new THREE.Vector3();
  }

  update(dt, mouse, target) {
    const c = this.cfg;
    this.yaw -= mouse.x * c.sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch + mouse.y * c.sensitivity, c.minPitch, c.maxPitch);
    this.distance = THREE.MathUtils.clamp(this.distance * (1 + mouse.wheel * 0.1), c.minDistance, c.maxDistance);

    // Smooth follow on the focus point
    const goal = new THREE.Vector3(target.x, target.y + c.height, target.z);
    this.focus.lerp(goal, 1 - Math.exp(-20 * dt));

    const cp = Math.cos(this.pitch);
    this._dir.set(Math.sin(this.yaw) * cp, Math.sin(this.pitch), Math.cos(this.yaw) * cp);

    // Pull the camera in if something blocks the view
    let want = this.distance;
    const hit = this.world.cast(this.focus, this._dir, this.distance);
    if (hit) want = Math.max(c.near * 2, hit.distance - 0.008);

    // Snap in instantly, ease back out
    this.currentDistance = want < this.currentDistance
      ? want
      : this.currentDistance + (want - this.currentDistance) * (1 - Math.exp(-6 * dt));

    this.camera.position.copy(this.focus).addScaledVector(this._dir, this.currentDistance);
    this.camera.lookAt(this.focus);
  }

  snapTo(target) {
    this.focus.set(target.x, target.y + this.cfg.height, target.z);
  }
}
