// Keyboard + mouse state. Mouse movement is accumulated and consumed each frame.
export class Input {
  constructor(element) {
    this.keys = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
    this.jumpQueued = false;
    this.resetQueued = false;
    this.locked = false;

    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'Space') this.jumpQueued = true;
      if (e.code === 'KeyR') this.resetQueued = true;
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    element.addEventListener('click', () => element.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === element;
    });
    addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
    addEventListener('wheel', (e) => { this.wheel += Math.sign(e.deltaY); }, { passive: true });
  }

  // -1..1 on each axis
  moveAxes() {
    const k = this.keys;
    const x = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    const y = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    return { x, y };
  }

  get sprint() { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'); }

  consumeMouse() {
    const d = { x: this.mouseDX, y: this.mouseDY, wheel: this.wheel };
    this.mouseDX = this.mouseDY = this.wheel = 0;
    return d;
  }

  consumeJump() { const j = this.jumpQueued; this.jumpQueued = false; return j; }
  consumeReset() { const r = this.resetQueued; this.resetQueued = false; return r; }
}
