# Jelly Fight

A third-person game where you play a ~3.5 cm jelly critter inside a real-scale 3D model of the apartment.

## Run it

ES modules won't load over `file://`, so serve the folder:

```
cd jelly-fight
npx http-server -c-1        # or: python -m http.server
```

Open the printed localhost URL. The VS Code "Live Server" extension also works.

## Controls

WASD move · mouse look · Space jump · Shift sprint · wheel zoom · R respawn · Esc pause · **G** switch between the game and the original apartment viewer

## How it fits together

`index.html` is the apartment app (three.js r128, loaded as a global) with four small hooks, each marked `JELLY`:

1. `logarithmicDepthBuffer: true` on the renderer, so a 2 mm camera near plane doesn't make surfaces flicker.
2. The render loop calls `GAME.step(dt)` instead of its own camera controls while the game is active.
3. `window.APT` exposes the scene, renderer and camera, plus `enterGame()` / `exitGame()`.
4. A style rule that hides the apartment's UI in game mode, plus the importmap and `src/main.js` module.

`apartment-original.html` is the untouched original, kept for reference and diffing.

| File | What it does |
| --- | --- |
| `src/config.js` | Tuning numbers: player size, speed, jump, gravity, camera. Units are meters. |
| `src/main.js` | Game mode on/off, spawn point, HUD, blob shadow. |
| `src/player.js` | Movement, jumping, wall sliding, stepping up tiny ledges, squash and stretch. |
| `src/camera.js` | Orbit camera that follows the player and pulls in when furniture is in the way. |
| `src/collision.js` | Raycast collision against every visible apartment mesh (the neighborhood outside is excluded). Uses a BVH per mesh plus a nearby-object filter. |
| `src/input.js` | Keyboard and pointer-lock mouse. |
| `src/three-global.js` | Lets ES modules `import from 'three'` and get the page's r128 global. |
| `vendor/three-mesh-bvh.module.js` | three-mesh-bvh 0.5.23, the last version that supports r128. |

## Next up

- Strip the apartment features the game doesn't need (arrange mode, tour, quests, rhythm game, layout saving) out of `index.html`.
- Tune movement and camera feel in the real rooms.
- Decide what the "fight" is: enemies, goals, collectibles.
