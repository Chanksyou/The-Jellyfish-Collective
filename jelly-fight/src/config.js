// All distances are in METERS. The apartment is built at real-world scale,
// and the player is a ~3.5 cm tall critter living inside it.
export const CONFIG = {
  player: {
    radius: 0.012,       // collision radius (1.2 cm)
    height: 0.035,       // collision height (3.5 cm)
    walkSpeed: 0.35,     // m/s — faster than a real bug would be, so the room is crossable
    sprintSpeed: 0.8,
    jumpHeight: 0.08,    // 8 cm — a bit more than 2x body height
    gravity: 3.5,        // lower than real (9.8) so jumps feel floaty at this scale
    stepHeight: 0.008,   // ledges lower than this are walked up automatically
    groundAccel: 15,
    airAccel: 3,
    turnSpeed: 12,
  },
  camera: {
    distance: 0.16,      // how far behind the player the camera sits
    minDistance: 0.05,
    maxDistance: 0.8,
    height: 0.025,       // look-at point above the player's feet
    minPitch: -0.6,
    maxPitch: 1.3,
    sensitivity: 0.0025,
    fov: 60,
    near: 0.002,         // tiny near plane so walls don't vanish when the camera is close
    far: 60,
  },
};
