export const GAME_W = 720;
export const GAME_H = 1280;
export const DARKNESS_BASE = 0.15;
export const ANOMALY_SLOTS = {
  PAINTING: { nx: 0.08, ny: 0.33 },
  CLOCK: { nx: 0.96, ny: 0.31 },
  DOOR_RIGHT: { nx: 0.82, ny: 0.54 },
  FAR_END: { nx: 0.5, ny: 0.47 },
};
export const DUST_POINTS = [
  [32, 260, 6000], [84, 510, 7200], [128, 900, 8100], [176, 340, 9200],
  [214, 740, 6800], [260, 1120, 10400], [302, 430, 7600], [348, 830, 9800],
  [394, 280, 8500], [432, 1030, 11000], [476, 590, 6400], [514, 930, 8900],
  [552, 380, 7300], [588, 1150, 10000], [624, 670, 9400], [658, 450, 8200],
  [684, 860, 7000], [704, 550, 10600],
];

export const DEPTH = {
  BG: 0,
  DARKNESS: 10,
  GRAIN: 11,
  VIGNETTE: 12,
  HUD: 20,
  BUTTONS: 20,
  FEEDBACK: 30,
  OVERLAY: 40,
  DOOR: 35,
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
