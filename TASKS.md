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
