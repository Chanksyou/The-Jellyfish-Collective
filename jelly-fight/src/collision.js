import * as THREE from 'three';

// Raycast-based collision against the apartment meshes. Simple and good enough
// for a static world of boxes; swap for a physics engine (Rapier) later if we
// need pushable objects.
export class World {
  constructor(root) {
    this.colliders = [];
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (o.isMesh && !o.userData.noCollide) this.colliders.push(o);
    });
    this.raycaster = new THREE.Raycaster();
    this._normal = new THREE.Vector3();
  }

  // Nearest hit along a ray, or null. Returned normal is in world space.
  cast(origin, dir, far) {
    this.raycaster.set(origin, dir);
    this.raycaster.near = 0;
    this.raycaster.far = far;
    const hits = this.raycaster.intersectObjects(this.colliders, false);
    if (!hits.length) return null;
    const h = hits[0];
    const normal = h.face
      ? this._normal.copy(h.face.normal).transformDirection(h.object.matrixWorld).clone()
      : dir.clone().negate();
    return { distance: h.distance, point: h.point, normal };
  }
}
