import * as THREE from 'three';

// ---------------------------------------------------------------------------
// PLACEHOLDER APARTMENT
//
// Replace the body of buildApartment() with the mesh-building code from your
// own apartment index.html. The contract is:
//   - add every mesh to `root` (not to a scene)
//   - units are meters, floor at y = 0
//   - return { root, spawn }  (spawn = where the player starts, on the floor)
// Don't bring over your old renderer / camera / OrbitControls / animate loop —
// main.js owns those now.
//
// Every mesh in `root` is solid to the player. Set mesh.userData.noCollide = true
// on anything the player should pass through (light fixtures, curtains, etc).
// ---------------------------------------------------------------------------

const W = 7;      // apartment width  (x)
const D = 5.5;    // apartment depth  (z)
const H = 2.6;    // ceiling height
const WALL = 0.12;

export function buildApartment() {
  const root = new THREE.Group();
  root.name = 'Apartment';

  const mats = {
    floor: new THREE.MeshStandardMaterial({ color: 0xb48a60, roughness: 0.7 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: 0.9 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 1 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x4f6d8f, roughness: 1 }),
    couch: new THREE.MeshStandardMaterial({ color: 0x6a7f5a, roughness: 0.95 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x7a5234, roughness: 0.6 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 0.6 }),
    counter: new THREE.MeshStandardMaterial({ color: 0xd9d9d9, roughness: 0.3 }),
    cabinet: new THREE.MeshStandardMaterial({ color: 0x3f4a55, roughness: 0.6 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc9c9c9, metalness: 0.9, roughness: 0.3 }),
    window: new THREE.MeshStandardMaterial({ color: 0xbfe3ff, emissive: 0xbfe3ff, emissiveIntensity: 0.8 }),
  };

  // Box helper: (x, z) is the footprint center, y is the BOTTOM of the box.
  function box(w, h, d, mat, x, y, z, { shadow = true } = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    root.add(m);
    return m;
  }

  // --- Shell ---------------------------------------------------------------
  box(W, 0.1, D, mats.floor, 0, -0.1, 0, { shadow: false });
  box(W, 0.1, D, mats.ceiling, 0, H, 0, { shadow: false });
  box(W + WALL * 2, H, WALL, mats.wall, 0, 0, -D / 2 - WALL / 2, { shadow: false });
  box(W + WALL * 2, H, WALL, mats.wall, 0, 0, D / 2 + WALL / 2, { shadow: false });
  box(WALL, H, D, mats.wall, -W / 2 - WALL / 2, 0, 0, { shadow: false });
  box(WALL, H, D, mats.wall, W / 2 + WALL / 2, 0, 0, { shadow: false });

  const win = box(1.6, 1.1, 0.02, mats.window, -0.8, 1.0, D / 2 - 0.01, { shadow: false });
  win.userData.noCollide = true;

  // --- Living room ---------------------------------------------------------
  box(2.4, 0.006, 1.6, mats.rug, 0, 0, -0.9, { shadow: false });

  // Couch against the back wall
  const couchZ = -D / 2 + 0.45;
  box(2.0, 0.42, 0.9, mats.couch, 0, 0, couchZ);           // seat
  box(2.0, 0.45, 0.2, mats.couch, 0, 0.42, couchZ - 0.35); // back
  box(0.2, 0.2, 0.9, mats.couch, -1.1, 0.42, couchZ);      // arms
  box(0.2, 0.2, 0.9, mats.couch, 1.1, 0.42, couchZ);

  // Coffee table
  const tableZ = -0.9;
  box(1.1, 0.04, 0.6, mats.wood, 0, 0.38, tableZ);
  for (const [lx, lz] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]) {
    box(0.04, 0.38, 0.04, mats.wood, lx, 0, tableZ + lz);
  }

  // A staircase of books leading up to the coffee table
  const bookColors = [0xa8322d, 0x2d5aa8, 0xd1a02b, 0x2f8a57, 0x7b3fa0, 0xc4652b];
  const steps = 11;
  for (let i = 0; i < steps; i++) {
    const h = 0.035 * (i + 1);
    const mat = new THREE.MeshStandardMaterial({ color: bookColors[i % bookColors.length], roughness: 0.8 });
    box(0.12, h, 0.2, mat, -0.62 - (steps - 1 - i) * 0.12, 0, tableZ);
  }

  // A big hardcover book bridging the coffee table to the couch seat
  box(0.16, 0.02, 0.8, new THREE.MeshStandardMaterial({ color: 0x223344 }), 0, 0.42, -1.45);

  // --- Bookshelf on the left wall (hollow, so you can walk inside the shelves)
  const shelfX = -W / 2 + 0.18;
  const shelfZ = 0.8;
  box(0.35, 1.9, 0.03, mats.darkWood, shelfX, 0, shelfZ - 0.5);
  box(0.35, 1.9, 0.03, mats.darkWood, shelfX, 0, shelfZ + 0.5);
  box(0.02, 1.9, 1.0, mats.darkWood, shelfX - 0.165, 0, shelfZ);
  for (const y of [0.05, 0.45, 0.85, 1.25, 1.65, 1.88]) {
    box(0.35, 0.025, 0.97, mats.darkWood, shelfX, y, shelfZ);
  }

  // --- Kitchen counter on the right wall ----------------------------------
  const counterX = W / 2 - 0.3;
  box(0.6, 0.86, 2.5, mats.cabinet, counterX, 0, 0.8);
  box(0.64, 0.04, 2.54, mats.counter, counterX - 0.02, 0.86, 0.8);

  // --- Floor lamp ---------------------------------------------------------
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24), mats.metal);
  lampBase.position.set(1.6, 0.015, -2.2);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 12), mats.metal);
  lampPole.position.set(1.6, 0.78, -2.2);
  for (const m of [lampBase, lampPole]) { m.castShadow = true; m.receiveShadow = true; root.add(m); }

  // --- Small props that sell the scale -----------------------------------
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.002, 24), new THREE.MeshStandardMaterial({ color: 0xc08a3e, metalness: 1, roughness: 0.35 }));
  coin.position.set(0.25, 0.001, 0.35);
  coin.receiveShadow = true;
  root.add(coin);

  box(0.032, 0.0115, 0.016, new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.4 }), -0.3, 0, 0.45); // lego brick
  box(0.22, 0.015, 0.09, new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1 }), 0.6, 0, 0.9);          // sock
  const pencil = box(0.19, 0.008, 0.008, new THREE.MeshStandardMaterial({ color: 0xf2c230 }), -0.7, 0, 0.1);
  pencil.rotation.y = 0.6;

  return { root, spawn: new THREE.Vector3(0, 0, 0.5) };
}
