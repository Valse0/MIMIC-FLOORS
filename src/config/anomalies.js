import { DARKNESS_BASE } from './layout.js';

function flicker(scene, room) {
  room.tweens.push(scene.tweens.add({
    targets: room.darkness,
    alpha: 0.7,
    duration: 120,
    yoyo: true,
    repeat: -1,
  }));
}

export const ANOMALIES = {
  flicker: { weight: 1, enabled: true, apply: flicker },
  // These anomalies need image variants, see Task 8.
  eyes: { weight: 1, enabled: false, apply() {} },
  carpetReversed: { weight: 1, enabled: false, apply() {} },
  extraDoor: { weight: 1, enabled: false, apply() {} },
  clockReverse: { weight: 1, enabled: false, apply() {} },
};

export function resetRoom(room) {
  room.tweens.forEach((tween) => tween.stop());
  room.tweens = [];
  room.background.setScale(room.baseScale);
  room.darkness.setAlpha(DARKNESS_BASE);
}
