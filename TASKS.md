# MIMIC FLOORS - TASKS

## Çalışma kuralı (Codex için)
1. Read AGENTS.md first, then this file.
2. Do ONLY the first task whose status is `[ ]`. Never start the next one.
3. When finished: run `npm run build` (must pass), commit with the given message, change that task's status to `[x]`, then STOP and report: files changed, how to test, anything uncertain.
4. Wait for the user's approval before the next task. If the user reports a bug, fix only that bug, do not touch other code.
5. Do not do anything listed under BACKLOG.
6. Transitions between floors use tween onComplete chains, not setTimeout/setInterval.

---

## [X] GÖREV 1: Skeleton
Scaffold Vite vanilla JS in the current folder, `npm i phaser@3.60.0`, remove Vite demo files, create the folder structure from AGENTS.md (unused files = empty placeholder with a one-line comment).
- src/main.js + src/config/gameConfig.js: 720x1280, Scale.FIT, CENTER_BOTH, background 0x111111, no physics, scenes Boot, Menu, Game.
- BootScene starts MenuScene immediately.
- MenuScene: "MIMIC FLOORS" title, rectangle button "Başla" -> starts GameScene.
- GameScene: only the text "Floor 1".
- index.html: viewport meta (no user scaling), body margin 0, background #111, overflow hidden.
- package.json script: "host": "vite --host 0.0.0.0 --port 5173".
Do NOT add corridor, lives, streak, anomalies, sound.
Done when: build passes, Menu -> Game works.
Commit: `task 1: skeleton`

---

## [x] GÖREV 2: Statik koridor (mantık yok)
Draw the corridor in GameScene with shapes only, all at fixed coordinates defined as constants in `src/config/layout.js`.
- Elements: floor (dark gray rect), back wall, carpet (rect with 3 stripes), ceiling light (white circle), painting (yellow square) with two eyes (black circles), wall clock (circle + one hand line), main door (brown rect), extra door (second brown rect, hidden by default), elevator frame around the view.
- Build them in one function `buildRoom(scene)` that returns an object:
  `{ light, painting, eyes: [eyeL, eyeR], carpet, clock, clockHand, extraDoor, mainDoor }`
  Keep references; Task 4 will use them.
- Two buttons at the bottom: "ÇIK" (green) and "KAPAT" (red). For now they only show a small text "ÇIK basıldı" / "KAPAT basıldı".
- Text "Floor 1" at the top.
- Add a `GameScene.shutdown` cleanup that destroys everything built.
Do NOT add lives, streak, anomalies, logic, sound.
Done when: corridor is visible and readable on a 720x1280 portrait screen, buttons respond, restarting the scene does not duplicate anything.
Commit: `task 2: static corridor`

---

## [x] GÖREV 3: Oyun mantığı, can, streak
- `floorConfigs.js`: export `getFloorConfig(floorNumber)` returning `{ floor, isMimic, anomalyId, tutorialText }`.
  - Floor 1: always NORMAL, tutorialText: "Bu NORMAL koridor. Her şey düzgün. ÇIK'a bas."
  - Floor 2: always MIMIC, tutorialText: "Bu MIMIC. Bir şey yanlış, fark ettin mi? KAPAT'a bas." (anomalyId: "eyes" placeholder, effect comes in Task 4)
  - Floor 3+: isMimic with 20% chance.
- `FloorManager`: holds current floor, asks floorConfigs for the config, advances floors. Win at floor 100.
- `LivesManager`: 3 lives, `loseLife()`, `isDead()`.
- `Hud`: top shows "Floor N", 3 hearts (text "♥" or red circles; filled/empty state, NO break animation), and "STREAK xN" (hidden if streak < 2).
- Answer rules: ÇIK on NORMAL = correct. KAPAT on MIMIC = correct. Anything else = wrong.
  - Correct: streak +1, show green "DOĞRU" text, go to next floor.
  - Wrong: streak = 0, lose a life, show red "YANLIŞ" text, then ALSO go to next floor.
  - Both with a short tween feedback; use onComplete to load the next floor.
- INPUT LOCK: after an answer, ignore all button presses until the next floor is ready (single boolean `inputLocked`). This prevents double taps.
- Game over (0 lives): overlay with "OYUN BİTTİ", reached floor, best streak, and a "Tekrar" button that restarts GameScene cleanly.
- Win at floor 100: overlay "KAZANDIN" with "Tekrar".
- Show tutorialText on screen when present (Floors 1-2), hidden otherwise.
Do NOT add anomaly visuals, sound, camera effects, timer.
Done when: a full run works: correct/wrong, lives drop, game over, restart gives a clean game with no duplicated HUD or buttons.
Commit: `task 3: game logic`

---

## [x] GÖREV 4: 5 anomali
In `src/config/anomalies.js` export `ANOMALIES`, each entry `{ weight, apply(scene, room) }`. Each apply must register its tweens/objects so they are cleaned up on floor change.
1. `flicker`: ceiling light alpha tween 0.3 <-> 1, yoyo, repeat -1, fast (120ms).
2. `eyes`: painting eyes move left-right with tween (yoyo, repeat -1), slowly, creepy.
3. `carpetReversed`: carpet stripes order/color inverted (set fixed alternate colors).
4. `extraDoor`: `room.extraDoor` becomes visible.
5. `clockReverse`: clock hand rotates counter-clockwise continuously.
- Also create `resetRoom(room)` that returns every element to its normal state and kills tweens, called at the start of every floor.
- GameScene: if config.isMimic, pick an anomaly by weight (avoid the same one twice in a row) and apply it. Floor 2 must use `eyes`.
- Anomaly selection may be random, but positions never are.
Do NOT add sound or camera effects.
Done when: all 5 anomalies visible on mimic floors, normal floors always fully clean (no leftover tweens from the previous floor).
Commit: `task 4: anomalies`

---

## [x] GÖREV 5: Ses ve juice
- `AudioManager` with WebAudio oscillators, created/resumed in MenuScene on "Başla" tap:
  - `ding()`: short high sine beep.
  - `buzz()`: low sawtooth ~250ms.
- Correct: ding + `cameras.main.shake(100, 0.003)`.
- Wrong: buzz + `cameras.main.flash(150, 255, 0, 0)` + `if (navigator.vibrate) navigator.vibrate(100)`. The game must work fully without vibration support.
- Streak 3, 5, 10: brief yellow flash on screen + "STREAK xN" scale-pop tween.
- Elevator door open/close feel: at each new floor, two door rects slide apart with tweens (about 400ms), input stays locked until they finish.
Do NOT add music, files, timers.
Done when: sounds play after first tap, nothing breaks if audio is unavailable (wrap in try/catch).
Commit: `task 5: audio and juice`

---

## [x] GÖREV 6: Temizlik ve hata taraması
Do not add features. Only verify and fix:
- Restart the scene 5 times in a row: no duplicated HUD, buttons, tweens, or sounds.
- Rapidly tap ÇIK/KAPAT: only one answer is processed per floor.
- Every file under ~200 lines; no unused imports; no console errors.
- Confirm no physics, no image/audio files, no setInterval/setTimeout in the codebase (grep).
- Update AGENTS.md "Structure" section if the real structure differs (e.g. layout.js).
Report findings as a list before changing anything, then fix.
Commit: `task 6: cleanup`

---

## BACKLOG (do NOT start without explicit user instruction)
- Süre baskısı: tek bir `time.addEvent` ile geri sayım
- Scraps (para birimi) ve ödül toplama
- Skin mağazası
- Kalp kırılma animasyonu
- Daha fazla anomali (10+)
- AI görselleri ile şekilleri değiştirme
- Kat sayısına göre zorluk artışı

- 
## [x] GÖREV 7: Görsel temel (AI koridor görseli + atmosfer)
Goal: replace the flat shape room with the real corridor image and add a code-only horror atmosphere. Layout/visual task. Game logic (lives, streak, floors, input lock) must NOT change behavior.

### Step 0: Housekeeping
1. `git pull`.
2. Make sure `.gitignore` contains `node_modules` and `dist`. If they are tracked: `git rm -r --cached node_modules dist`.
3. Update AGENTS.md:
   - Rule 3 becomes: "Image files are allowed ONLY under public/assets/ and must be loaded in BootScene preload. Audio stays WebAudio-only. Everything else is still drawn with code."
   - Rule 4 becomes: "No setInterval/setTimeout. `scene.time.addEvent` and tween `onComplete` are allowed for transitions and the grain effect only."
   - Rule 5 add: "Full-screen overlay tweens (alpha) are allowed."
4. Commit: `task 7a: housekeeping`

### Step 1: Find and prepare the image
1. List `public/assets/`. The image is the file there that is not `.gitkeep` (png/jpg/jpeg/webp). Do not guess a name.
2. Report its pixel size and file size. Do NOT add new dependencies to resize it.
3. Rename it with `git mv` to `corridor_normal.<same extension>` (lowercase, no spaces).
4. If the file is larger than 1.5 MB, do NOT modify it; just mention it in the report.

### Step 2: Load and display it
1. BootScene: `this.load.image('corridor_normal', import.meta.env.BASE_URL + 'assets/corridor_normal.<ext>')`. Show a simple "Yükleniyor..." text during load; start MenuScene on complete. If loading fails, show a visible red error text with the path (never fail silently).
2. In `src/config/layout.js`, define fixed constants: GAME_W=720, GAME_H=1280, depths:
   BG=0, DARKNESS=10, GRAIN=11, VIGNETTE=12, HUD=20, BUTTONS=20, FEEDBACK=30, OVERLAY=40.
3. GameScene: the image is full-screen background centered at (360, 640). Use "cover" scaling: `scale = Math.max(720 / tex.width, 1280 / tex.height)`. Never distort the aspect ratio. Store `baseScale`.
4. Delete ALL old shape-drawing code (floor, wall, carpet, painting, eyes, clock, doors, elevator frame, buildRoom shapes). Keep `buildRoom(scene)` but it now returns:
   `{ background, darkness, grain, vignette }`
5. No element may overlap the HUD incorrectly: HUD sits ON TOP of the image (depth 20), so each HUD text needs readability (see Step 4).

### Step 3: Atmosphere (all code, created once per scene start)
1. **Darkness overlay:** full-screen black rectangle, base alpha 0.15, depth DARKNESS. Store base alpha constant `DARKNESS_BASE = 0.15`.
2. **Vignette:** generate ONCE a canvas texture `vignette` (720x1280) with a radial gradient: transparent center, black alpha ~0.75 at edges. Use `this.textures.createCanvas` in BootScene only if the key does not exist yet (restart must not recreate it). Display it full-screen at depth VIGNETTE.
3. **Film grain:** generate ONCE a 128x128 noise canvas texture `grain` in BootScene (random gray pixels with random alpha, guarded by the same exists-check). Show it as a full-screen `tileSprite`, alpha 0.08, depth GRAIN. Every 90 ms (`scene.time.addEvent`, loop, bound to the scene so it dies on shutdown) set its tilePosition to a random pair from a fixed array of 6 offsets. Positions must come from the fixed array, not Math.random.
4. **Slow zoom:** at the start of every floor, tween the background scale from `baseScale` to `baseScale * 1.04` over 2500 ms (Sine.easeOut). Reset to `baseScale` in `resetRoom`.
5. **Flicker anomaly (the only anomaly working this task):** tween `room.darkness.alpha` between `DARKNESS_BASE` and 0.7, duration 120, yoyo, repeat -1. `resetRoom` must kill this tween and restore alpha to `DARKNESS_BASE`.

### Step 4: HUD and buttons readability on top of the image
1. Top: "Floor N" and hearts stay at the same fixed coordinates, but add a dark gradient strip behind them (rectangle 720x220 at top, black alpha 0.55, depth HUD-1). Hearts clearly below "Floor N". Add a text stroke (black, 4px) to all HUD texts.
2. Tutorial text: put it on a dark semi-transparent strip (black alpha 0.6) at a fixed y around 1000-1060, centered, never over the main scene center.
3. Buttons ÇIK / KAPAT at y ~1160: keep size about 220x80, gap between them. Style: dark fill (0x000000 alpha 0.55), 3px border (green 0x2ea35a for ÇIK, red 0xb53a35 for KAPAT), white bold text. Pressed state: brief alpha tween 0.55 -> 0.9 -> 0.55.
4. Feedback texts "DOĞRU"/"YANLIŞ" and the game over / win overlays must appear above everything (depth FEEDBACK / OVERLAY) with stroke for readability.

### Step 5: Anomaly system adjustments (temporary, because shapes are gone)
1. In `anomalies.js` add an `enabled` boolean to each entry. Set `flicker: enabled true`; `eyes, carpetReversed, extraDoor, clockReverse: enabled false` with a comment: "needs image variants, see Task 8".
2. Anomaly selection must only pick entries with `enabled: true`. The "no same anomaly twice in a row" rule must not crash when only one anomaly is enabled (allow repeating in that case).
3. `floorConfigs.js` Floor 2: anomalyId = "flicker", tutorialText = "Bu MIMIC. Işık titriyor, fark ettin mi? KAPAT'a bas."
4. `resetRoom(room)` must restore EVERYTHING (darkness alpha, background scale, tweens) at the start of every floor.

### Step 6: Cleanup rules
- Scene shutdown must destroy the objects and stop the grain timer and all tweens. Textures `vignette`, `grain`, `corridor_normal` stay in the texture manager (do not remove them).
- Restart the scene 5 times: no duplicated overlay, no double grain timer, no stacked tweens.
- No file over ~200 lines. If GameScene gets long, move atmosphere code to `src/ui/Atmosphere.js` (allowed, add to the Structure section in AGENTS.md).
- Do NOT add sound changes, new anomalies, timers, or any logic change.

### Done when
- Game boots, Menu -> Game shows the corridor photo full-screen with vignette, grain, and slow zoom.
- HUD, tutorial text, and buttons are clearly readable over the image on a phone.
- Floor 1 is clean. Floor 2 flickers. A full run (correct/wrong/lives/game over/restart) still works exactly as before.
- `npm run build` passes.

### Report (required)
List: image filename, pixel size, file size in MB, the final y/height of HUD strip, tutorial strip and buttons, any warning (large file, aspect mismatch), and what was left disabled.
Commit: `task 7: image background and atmosphere`

## [x] GÖREV 8: His katmanı (ses, asansör kapıları, arayüz uyumu, canlılık)
Feel pass only. Do NOT change game logic (lives, streak, floors, input lock, scoring).

### Step 1: AudioManager (WebAudio only, all in try/catch)
- Created/resumed on the "Başla" tap. If audio is unavailable the game must still work.
- `startAmbience()`: two low detuned oscillators (about 50 Hz and 53 Hz, sine) with a very low gain (0.04) and a slow LFO on gain. Start once, never twice (guard with a flag). Stop on game over, restart on new run.
- `startLightHum()`: 100 Hz sawtooth, gain 0.01 through a lowpass filter at 400 Hz.
- `ding()`: elevator chime, two sine notes (880 Hz then 660 Hz), 300 ms total.
- `doorSlide()`: filtered noise burst (noise buffer + lowpass), about 450 ms, gain 0.08.
- `correct()` = soft high blip, `wrong()` = low sawtooth buzz 250 ms. Keep the existing ones if they exist, just route them through here.
- `heartbeat()`: two short low thumps (60 Hz sine, 80 ms each, 150 ms apart), called when lives become 1, then every time a new floor starts while lives == 1. No loops or timers: trigger it from the floor start only.

### Step 2: Elevator door transition (the main feel change)
- Two full-height black rectangles (left and right halves, depth OVERLAY-5) cover the screen at floor start.
- Sequence at every floor start: black screen -> `ding()` -> `doorSlide()` -> halves slide outward over 700 ms (Cubic.easeInOut) -> input unlocks only after they finish.
- When an answer is given: halves slide closed over 500 ms with `doorSlide()`, then the next floor loads (use tween onComplete chain).
- Door rectangles get a thin lighter vertical line on the inner edge (brushed metal feel). Fixed coordinates, no random.
- First floor of a run uses the same opening. Game over / win overlays appear after doors are closed.
- `resetRoom` must also reset door positions.

### Step 3: UI style match
- Remove green/red color coding. Both buttons: fill 0x000000 alpha 0.6, 2px border 0x8a7440 (aged brass), text color 0xc9b27a, serif font ("Georgia, serif"), bold. Slight text shadow. Pressed: alpha tween only.
- Hearts: replace "♥" text with small drawn bulbs: circle radius 12, filled warm 0xffd27a when alive, outline-only 0x5a4a30 when lost. Spaced with fixed x coordinates, placed clearly under "Floor N".
- All texts use the serif font. "Floor N" gets letterSpacing 4 and color 0xd8c9a0.
- STREAK text: same brass color, no bright yellow.
- Remove the visible dark strips behind HUD and tutorial text. Replace the top strip with a soft gradient texture (generated once, black alpha 0.7 at top fading to 0 at y=260). Tutorial text sits without a strip, with a 4px dark stroke, and fades in/out with a tween (alpha, 300 ms).
- "DOĞRU"/"YANLIŞ" feedback: smaller, serif, fade in/out. Do not tint the whole screen except the existing red flash on wrong.
- Add a warm color grade: full-screen rectangle color 0x3a2410, alpha 0.12, blendMode MULTIPLY, depth just above background (BG+1).

### Step 4: Life
- Breathing camera: tween camera scrollX between -4 and +4 and scrollY between -3 and +3, durations 3200 and 4100 ms, yoyo, repeat -1, Sine.easeInOut. Two separate tweens, killed in resetRoom and shutdown.
- Dust: 18 small circles (radius 1-2, alpha 0.25), each at a FIXED start position from a constants array in layout.js, each drifting slowly upward with its own fixed duration (6000-11000 ms from the array), yoyo, repeat -1. Created once per scene start, destroyed on shutdown. No Math.random for positions.
- Zoom from Task 7 stays.

### Rules
- All tweens/timers/sounds cleaned on scene shutdown. Restart 5 times: no stacked ambience, no duplicated doors/dust/hearts.
- No new dependencies, no new files outside the structure (AudioManager, Atmosphere, Hud exist; add src/ui/Elevator.js for the doors and list it in AGENTS.md Structure).
- Files under ~200 lines.
- `npm run build` must pass.

### Done when
Menu -> Game: drone starts after "Başla", doors open with ding at each floor, doors close on answer, UI looks like one style (brass, serif, no green/red), screen gently breathes, dust floats. A full run still works exactly as before.

### Report
List files changed, how to test, anything uncertain.
Commit: `task 8: feel pass`

## [ ] GÖREV 9: Anomali avı (görünür anomaliler, süre baskısı, buton gecikmesi)
Gameplay pass. Keep lives/streak/floor/input-lock logic intact, only extend it. Do Task 8b first if it is still `[ ]`.

### Step 1: World container (so overlays follow the photo)
- Put the background image and all anomaly overlays inside ONE Phaser Container `world` at (360, 640). The Task 7 slow zoom tween now scales `world` (from baseScale to baseScale*1.04), not the image alone. Reset in `resetRoom`.
- Overlay positions are defined in `layout.js` as fractions of the image: `{ nx, ny }` where nx, ny in 0..1 (0,0 = top-left of the image). Convert with a helper `toWorld(nx, ny)` using the texture size so they stay attached to the photo at any scale. No Math.random for positions.
- Initial slots (adjust after looking at the image; Codex must open the image and verify each slot visually, then report the final values):
  - `PAINTING`: left wall painting, about nx 0.06, ny 0.34
  - `CLOCK`: right wall clock, about nx 0.96, ny 0.33
  - `DOOR_RIGHT`: nearest right door, about nx 0.82, ny 0.55
  - `FAR_END`: vanishing point at the corridor end, about nx 0.5, ny 0.47
- Add a debug helper: if the URL has `?debug=1`, draw a small magenta cross at each slot so positions can be checked on the phone. Off by default.

### Step 2: Five anomalies in `anomalies.js`
Each entry: `{ enabled: true, weight, apply(scene, room), sound }`. Everything an anomaly creates must be tracked in `room.anomalyObjects` and destroyed by `resetRoom` (with its tweens). Re-enable all five.
1. `flicker` (exists): darkness alpha tween as in Task 7, plus `audio.buzz()` once when it starts.
2. `eyes`: two small pale circles (radius ~5, color 0xe8e0c0, alpha 0 -> 0.9 fade in over 800 ms) inside the PAINTING slot, 24 px apart, slowly sliding left-right together (yoyo, repeat -1, 1800 ms). No sound.
3. `clockGlow`: a red circle (color 0xaa1111, radius ~40, alpha 0.0 -> 0.35, yoyo, repeat -1, 900 ms) behind/over the CLOCK slot, blendMode ADD. No sound.
4. `doorAjar`: a thin vertical warm-light rectangle (color 0xffc870, width 3, height ~220, alpha 0.8) at the DOOR_RIGHT edge whose width tweens 3 -> 14 over 1200 ms, then stays. Call `audio.doorSlide()` once at a low level.
5. `figure`: a dark silhouette at FAR_END: generate ONCE a canvas texture `figure` (guard with exists-check): a vertical soft-edged dark shape, 36x110 px, head circle + body, black, soft alpha edges. Show it at FAR_END with alpha 0 -> 0.85 over 1500 ms. No tween loop. Call `audio.heartbeat()` once when it appears.
- Selection: random by weight, never the same twice in a row (allow repeat only if one enabled).
- Add `MIMIC_CHANCE = 0.35` constant in floorConfigs (temporary, for testing; the design target is 0.20, tune later).
- Floor 1: NORMAL. Floor 2: MIMIC with `figure`.

### Step 3: Button delay and labels
- Rename button labels: "NORMAL" (was ÇIK) and "ANOMALİ" (was KAPAT). Answer rules unchanged: NORMAL on normal floor = correct, ANOMALİ on mimic floor = correct.
- At each floor start the buttons are hidden (alpha 0, not interactive). After the elevator doors finish opening, wait 1000 ms (tween delay, not setTimeout), then fade buttons in over 300 ms and only then set interactive and unlock input.
- Update tutorial texts in floorConfigs:
  - Floor 1: "Bu koridor NORMAL. Dikkatle bak, sonra NORMAL'e bas."
  - Floor 2: "Bir şey var. Koridorun sonuna bak. ANOMALİ'ye bas."
- Update all other UI strings that mention ÇIK/KAPAT.

### Step 4: Timer (single mechanism)
- `timeLimitMs: 7000` in floorConfigs (Floor 1 and 2 tutorial floors: no timer, `timeLimitMs: 0`).
- A thin bar (height 6, brass color 0x8a7440, width 560, centered at y 1100) that shrinks with ONE tween (scaleX 1 -> 0, linear, duration = timeLimitMs). Starts exactly when the buttons become interactive.
- Tween onComplete = timeout: counts as a wrong answer through the SAME answer function (no duplicated logic), guarded by `inputLocked`.
- When the player answers: stop the tween immediately, hide the bar.
- When the last 2 seconds remain, the bar color becomes dim red 0x8a3030 (tween `tint`-free: set fillColor in an onUpdate check with a boolean so it runs once).
- Timer must never run during the door transitions, game over or win overlays. Kill it in `resetRoom` and shutdown.

### Step 5: Test helper
- URL param `?anomaly=<id>` forces that anomaly on every mimic floor. `?floor=<n>` starts the run at that floor. Parsed once in GameScene.create. Never active without the param.

### Rules
- No physics, no timers other than the tween described, no new dependencies.
- Restart 5 times: no stacked anomaly objects, bar, or tweens.
- Files under ~200 lines. Put anomaly overlay helpers in `src/ui/AnomalyFx.js` if needed, and list it in AGENTS.md Structure.
- `npm run build` passes.

### Done when
Floor 2 shows a dark figure at the corridor end and the player must press ANOMALİ. Mimic floors show one of the five anomalies clearly; normal floors are fully clean. Buttons appear 1 s after the doors open. Floors 3+ have a 7 s bar and timeout counts as wrong. A full run (correct/wrong/timeout/game over/restart) works.

### Report
List files changed, the final nx/ny of each slot, how to test with `?anomaly=figure` and `?debug=1`, anything uncertain.
Commit: `task 9: anomaly hunt`
