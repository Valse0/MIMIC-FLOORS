export const GAME_W = 720;
export const GAME_H = 1280;
export const DARKNESS_BASE = 0.15;

export const DEPTH = {
  BG: 0,
  DARKNESS: 10,
  GRAIN: 11,
  VIGNETTE: 12,
  HUD: 20,
  BUTTONS: 20,
  FEEDBACK: 30,
  OVERLAY: 40,
};

export const LAYOUT = {
  width: GAME_W,
  height: GAME_H,
  centerX: GAME_W / 2,
  centerY: GAME_H / 2,
  tutorial: { x: 360, y: 1030, width: 660, height: 100 },
  feedback: { x: 360, y: 900 },
  hud: { floorX: 360, floorY: 42, heartXs: [270, 315, 360], heartY: 125, streakX: 550, streakY: 125 },
  buttons: { y: 1160, width: 220, height: 80, leftX: 235, rightX: 485 },
  overlay: {
    centerX: 360, centerY: 640, width: 720, height: 1280,
    titleY: 470, detailY: 570, buttonY: 700, buttonWidth: 240, buttonHeight: 84,
  },
};
