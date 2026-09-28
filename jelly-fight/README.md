# Jelly Fight

A third-person game where you play a ~3.5 cm jelly critter inside a real-scale apartment. Built with three.js, no build step.

## Run it

ES modules won't load over `file://`, so serve the folder:

```
cd jelly-fight
npx http-server -c-1        # or: python -m http.server
```

Then open http://localhost:8080 (or :8000 for Python). In VS Code, the "Live Server" extension also works.

## Controls

WASD move · mouse look · Space jump · Shift sprint · wheel zoom · R respawn · Esc pause

## Layout

| File | What it does |
| --- | --- |
| `src/config.js` | All tuning numbers: player size, speed, jump, gravity, camera. Units are meters. |
| `src/apartment.js` | Builds the level. **Placeholder, to be replaced with the real apartment.** |
| `src/collision.js` | Raycast collision against every apartment mesh. |
| `src/player.js` | Movement, jumping, sliding along walls, stepping up tiny ledges, squash-and-stretch. |
| `src/camera.js` | Orbit camera that follows the player and pulls in when furniture is in the way. |
| `src/input.js` | Keyboard and pointer-lock mouse. |
| `src/main.js` | Renderer, lights, game loop. |

## Bringing in the real apartment

Paste the mesh-building code from the original apartment `index.html` into `buildApartment()` in `src/apartment.js`:

1. Add meshes to `root` instead of `scene`.
2. Leave out the old renderer, camera, controls, lights and animation loop.
3. Make sure it's in meters with the floor at `y = 0` (a couch seat should be about 0.4–0.45 high).
4. Set `mesh.userData.noCollide = true` on anything the player should pass through.
5. Return `{ root, spawn }` with a spawn point on the floor.
