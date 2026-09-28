import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

// three.js r128 is loaded as a global by the apartment page
const THREE = window.THREE;

// Raycast-based collision against the apartment meshes. Rays use each mesh's
// current transform, so things that move (doors, the cat) still collide.
// Each collider gets a BVH so a ray only tests the few triangles near it.
export class World {
  constructor(scene, { exclude = [] } = {}) {
    this.colliders = [];
    scene.updateMatrixWorld(true);
    const skip = new Set(exclude);
    const walk = (o) => {
      if (skip.has(o) || !o.visible) return;
      if (isSolid(o)) this.colliders.push(o);
      for (const c of o.children) walk(c);
    };
    walk(scene);
    for (const m of this.colliders) {
      if (!m.geometry.boundsTree) m.geometry.boundsTree = new MeshBVH(m.geometry);
      m.raycast = acceleratedRaycast;
    }
    this.raycaster = new THREE.Raycaster();
    this.raycaster.firstHitOnly = true;
    this._normal = new THREE.Vector3();
    this._sphere = new THREE.Sphere();
    this.spheres = this.colliders.map((m) => {
      if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
      return new THREE.Sphere();
    });
    this.nearby = this.colliders;
    this.nearbySpheres = this.spheres;
    this._focus = new THREE.Vector3(Infinity, 0, 0);
    this._focusAge = 0;
  }

  // Keep a short list of colliders around the player so each ray only checks those.
  // Rebuilt when the player moves or every quarter second (doors swing, the cat walks).
  focus(center, dt, radius = 1.2) {
    this._focusAge += dt;
    if (this._focus.distanceToSquared(center) < 0.04 && this._focusAge < 0.25) return;
    this._focus.copy(center);
    this._focusAge = 0;
    this.nearby = [];
    this.nearbySpheres = [];
    this.colliders.forEach((m, i) => {
      const s = this.spheres[i].copy(m.geometry.boundingSphere).applyMatrix4(m.matrixWorld);
      if (s.center.distanceTo(center) - s.radius < radius) {
        this.nearby.push(m);
        this.nearbySpheres.push(s);
      }
    });
  }

  // Nearest hit along a ray, or null. Returned normal is in world space.
  cast(origin, dir, far) {
    this.raycaster.set(origin, dir);
    this.raycaster.near = 0;
    this.raycaster.far = far;
    const ray = this.raycaster.ray;
    const list = [];
    this.nearby.forEach((m, i) => {
      const sp = this.nearbySpheres[i];
      const r2 = sp.radius * sp.radius;
      if (ray.distanceSqToPoint(sp.center) > r2) return;
      // skip spheres entirely beyond `far`
      if (sp.center.distanceTo(origin) - sp.radius > far) return;
      list.push(m);
    });
    const hits = this.raycaster.intersectObjects(list, false);
    for (const h of hits) {
      if (!visibleChain(h.object)) continue; // hidden since we collected it
      const normal = h.face
        ? this._normal.copy(h.face.normal).transformDirection(h.object.matrixWorld).clone()
        : dir.clone().negate();
      return { distance: h.distance, point: h.point, normal };
    }
    return null;
  }
}

function isSolid(o) {
  if (!o.isMesh || o.isInstancedMesh || o.userData.noCollide) return false; // foliage is instanced: walk through leaves
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  return mats.some((m) => m && m.visible !== false && m.colorWrite !== false && !(m.transparent && m.opacity < 0.05));
}

function visibleChain(o) {
  for (; o; o = o.parent) if (!o.visible) return false;
  return true;
}
