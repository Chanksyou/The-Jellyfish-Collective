// Jelly Fight game layer. The apartment page (index.html) builds the scene and
// runs the render loop; while GAME.active is true it calls GAME.step(dt) instead
// of driving its own camera. Press G to flip between the game and the original viewer.
import { CONFIG } from './config.js';
import { World } from './collision.js';
import { Player } from './player.js';
import { ThirdPersonCamera } from './camera.js';
import { Input } from './input.js';

const THREE = window.THREE;
const APT = window.APT;
if (!APT) throw new Error('Apartment did not load (window.APT missing)');
const { scene, renderer, camera } = APT;

// Living room floor, between the sofa and the coffee table
const SPAWN = new THREE.Vector3(2.4, 0.05, 3.3);

// --- UI -----------------------------------------------------------------------
const ui = document.createElement('div');
ui.id = 'game-ui';
ui.innerHTML = `
<style>
  #game-ui { display: none; }
  body.game #game-ui { display: block; }
  #g-hud { position: fixed; left: 12px; bottom: 10px; color: #fff; font: 12px/1.4 ui-monospace, monospace; text-shadow: 0 1px 2px #000; pointer-events: none; }
  #g-over { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(10,12,20,.55); color: #fff; cursor: pointer; text-align: center; font-family: system-ui, sans-serif; }
  #g-over[hidden] { display: none; }
  #g-over h1 { margin: 0 0 8px; font-size: 42px; }
  #g-over p { margin: 4px 0; opacity: .85; }
  #g-over kbd { background: #fff2; border: 1px solid #fff4; border-radius: 4px; padding: 1px 6px; font-size: 13px; }
</style>
<div id="g-hud"></div>
<div id="g-over"><div>
  <h1>Jelly Fight</h1>
  <p>Click to play</p>
  <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move &nbsp; <kbd>Mouse</kbd> look &nbsp; <kbd>Space</kbd> jump &nbsp; <kbd>Shift</kbd> sprint</p>
  <p><kbd>Wheel</kbd> zoom &nbsp; <kbd>R</kbd> respawn &nbsp; <kbd>Esc</kbd> pause &nbsp; <kbd>G</kbd> apartment viewer</p>
</div></div>`;
document.body.appendChild(ui);
const hud = ui.querySelector('#g-hud');
const overlay = ui.querySelector('#g-over');

// --- World + player -------------------------------------------------------------
const world = new World(scene, { exclude: [APT.OUT] }); // the neighbourhood outside isn't walkable
const input = new Input(renderer.domElement);
const player = new Player(world, CONFIG.player);
scene.add(player.mesh);
const tpc = new ThirdPersonCamera(camera, world, CONFIG.camera);

// Soft blob shadow under the jelly. The apartment only re-renders its shadow map
// when furniture moves, so the player can't rely on a real cast shadow.
const blob = new THREE.Mesh(
  new THREE.CircleGeometry(CONFIG.player.radius * 1.1, 24).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
);
blob.renderOrder = 1;
scene.add(blob);
const DOWN = new THREE.Vector3(0, -1, 0);
function updateBlob() {
  const o = player.position.clone();
  o.y += CONFIG.player.height * 0.5;
  const hit = world.cast(o, DOWN, 3);
  blob.visible = !!hit;
  if (!hit) return;
  const h = player.position.y - hit.point.y;
  blob.position.set(player.position.x, hit.point.y + 0.0008, player.position.z);
  blob.scale.setScalar(1 + h * 4);
  blob.material.opacity = 0.35 / (1 + h * 20);
}

function respawn() {
  world.focus(SPAWN, 1);
  player.spawn(SPAWN);
  tpc.snapTo(player.position);
}

// --- Game mode on/off -----------------------------------------------------------
const saved = { near: camera.near };
const GAME = {
  active: false,
  start() {
    this.active = true;
    APT.enterGame();
    document.body.classList.add('game');
    player.mesh.visible = blob.visible = true;
    camera.near = CONFIG.camera.near;
    camera.updateProjectionMatrix();
    overlay.hidden = document.pointerLockElement === renderer.domElement;
  },
  stop() {
    this.active = false;
    document.body.classList.remove('game');
    player.mesh.visible = blob.visible = false;
    if (document.pointerLockElement) document.exitPointerLock();
    camera.near = saved.near;
    camera.updateProjectionMatrix();
    APT.exitGame();
  },
  step(dt) {
    if (input.consumeReset() || player.position.y < -1) respawn();
    world.focus(player.position, dt);
    player.update(dt, input, tpc.yaw);
    tpc.update(dt, input.consumeMouse(), player.position);
    updateBlob();
    const p = player.position;
    hud.textContent = `x ${p.x.toFixed(2)}  y ${(p.y * 100).toFixed(1)} cm  z ${p.z.toFixed(2)}  |  ${player.grounded ? 'grounded' : 'airborne'}`;
  },
};
window.GAME = GAME;

document.addEventListener('pointerlockchange', () => {
  if (GAME.active) overlay.hidden = document.pointerLockElement === renderer.domElement;
});
overlay.addEventListener('click', () => renderer.domElement.requestPointerLock());
addEventListener('keydown', (e) => {
  if (e.code !== 'KeyG' || e.repeat || e.target.closest?.('input, textarea')) return;
  GAME.active ? GAME.stop() : GAME.start();
});

respawn();
GAME.start();

// Handy for poking at things from the browser console
Object.assign(window, { player, world, tpc, input });
