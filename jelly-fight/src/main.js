import * as THREE from 'three';
import { CONFIG } from './config.js';
import { buildApartment } from './apartment.js';
import { World } from './collision.js';
import { Player } from './player.js';
import { ThirdPersonCamera } from './camera.js';
import { Input } from './input.js';

// --- Renderer ---------------------------------------------------------------
// logarithmicDepthBuffer: with a 2 mm near plane and a 60 m far plane, a normal
// depth buffer makes surfaces flicker (z-fighting). This fixes it.
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d2230);

const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, innerWidth / innerHeight, CONFIG.camera.near, CONFIG.camera.far);

// --- Lighting ---------------------------------------------------------------
scene.add(new THREE.HemisphereLight(0xfff4e0, 0x5a4a3a, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 2.0);
sun.position.set(-1.5, 2.4, 2.5);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 0.1, far: 12 });
sun.shadow.bias = -0.0002;
scene.add(sun);

// --- World ------------------------------------------------------------------
const apartment = buildApartment();
scene.add(apartment.root);
const world = new World(apartment.root);

const input = new Input(renderer.domElement);
const player = new Player(world, CONFIG.player);
scene.add(player.mesh);
player.spawn(apartment.spawn);

const tpc = new ThirdPersonCamera(camera, world, CONFIG.camera);
tpc.snapTo(player.position);

// --- UI -----------------------------------------------------------------------
const overlay = document.getElementById('overlay');
const hud = document.getElementById('hud');
document.addEventListener('pointerlockchange', () => {
  overlay.hidden = document.pointerLockElement === renderer.domElement;
});
overlay.addEventListener('click', () => renderer.domElement.requestPointerLock());

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --- Loop -------------------------------------------------------------------
const clock = new THREE.Clock();
let fpsFrames = 0, fpsTime = 0, fps = 0;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 1 / 20);

  if (input.consumeReset() || player.position.y < -1) {
    player.spawn(apartment.spawn);
    tpc.snapTo(player.position);
  }

  player.update(dt, input, tpc.yaw);
  tpc.update(dt, input.consumeMouse(), player.position);
  renderer.render(scene, camera);

  fpsFrames++; fpsTime += dt;
  if (fpsTime > 0.5) { fps = Math.round(fpsFrames / fpsTime); fpsFrames = 0; fpsTime = 0; }
  const p = player.position;
  hud.textContent =
    `${fps} fps  |  x ${p.x.toFixed(2)}  y ${(p.y * 100).toFixed(1)} cm  z ${p.z.toFixed(2)}  |  ${player.grounded ? 'grounded' : 'airborne'}`;
});

// Handy for poking at things from the browser console
Object.assign(window, { THREE, scene, player, world, tpc });
