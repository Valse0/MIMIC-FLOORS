# MIMIC FLOORS - Agent Rules

## Game
Portrait mobile game (720x1280). Player rides an elevator through floors. Each floor shows a corridor: NORMAL (80%) or MIMIC (20%, has one anomaly). Player must press "Çık" on NORMAL, "Kapat" on MIMIC. Correct = streak +1, wrong = lose a life. 3 lives. Game over at 0.

## Stack
- Vite (vanilla JS, ES modules) + Phaser 3.60.0 (pinned, do not upgrade)
- No other dependencies without asking.

## Hard rules
1. NO physics. Do not enable Arcade/Matter. No gravity, no collisions.
2. NO random positions. Every visual element has a fixed coordinate defined in code constants.
3. Image files are allowed ONLY under public/assets/ and must be loaded in BootScene preload. Audio stays WebAudio-only. Everything else is still drawn with code.
4. No setInterval/setTimeout. `scene.time.addEvent` and tween `onComplete` are allowed for transitions and the grain effect only.
5. Animations only via scene.tweens (alpha, scale, x/y, angle), full-screen overlay alpha tweens, and camera shake/flash. No spritesheets, no skeletons.
6. Game data lives in config files, never hardcoded in scenes:
   - src/config/floorConfigs.js : floor rules, mimic chance, tutorialText
   - src/config/anomalies.js : each anomaly is { weight, apply(scene, room) }
7. Adding an anomaly = adding one object to anomalies.js. Never edit the engine for it.
8. Scene lifecycle: create() builds UI exactly once per scene start. On restart/shutdown, destroy old objects and tweens (use this.events.once('shutdown', ...)). Never render the same UI twice.
9. Touch/pointer input only, via setInteractive + 'pointerdown'. No keyboard-only features.
10. Audio starts only after the first user tap (MenuScene "Başla" button).

## Structure
src/main.js, src/config/{gameConfig,floorConfigs,anomalies,layout}.js,
src/scenes/{BootScene,MenuScene,GameScene}.js,
src/managers/{FloorManager,LivesManager,AudioManager}.js,
src/ui/{Hud,RoomBuilder}.js
Do not create files outside this structure without asking.

## Phaser config
scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 720, height: 1280 }

## Workflow
- Work on ONE task at a time. Do only what the task says.
- Keep functions small. No file over ~200 lines.
- After each task: run `npm run build`. It must pass with zero errors.
- Report: files changed, how to test, anything uncertain.
- UI text is Turkish. Code, comments, identifiers are English.
- Do not refactor or "improve" code outside the current task.
