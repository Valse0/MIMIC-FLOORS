import Phaser from 'phaser';
import { ANOMALY_SLOTS, DARKNESS_BASE } from './layout.js';

function track(scene, room, object) {
  room.world.add(object);
  room.anomalyObjects.push(object);
  return object;
}

function tween(scene, room, config) {
  const effect = scene.tweens.add(config);
  room.tweens.push(effect);
  return effect;
}

function flicker(scene, room) {
  room.darkness.setAlpha(DARKNESS_BASE);
  tween(scene, room, { targets: room.darkness, alpha: 0.7, duration: 120, yoyo: true, repeat: -1 });
}

function eyes(scene, room) {
  const position = room.toWorld(ANOMALY_SLOTS.PAINTING);
  const pair = track(scene, room, scene.add.container(position.x, position.y));
  [-12, 12].forEach((x) => pair.add(scene.add.circle(x, 0, 5, 0xe8e0c0, 0)));
  tween(scene, room, { targets: pair.list, alpha: 0.9, duration: 800 });
  tween(scene, room, { targets: pair, x: position.x + 12, duration: 1800, yoyo: true,
    repeat: -1, ease: 'Sine.easeInOut' });
}

function clockGlow(scene, room) {
  const { x, y } = room.toWorld(ANOMALY_SLOTS.CLOCK);
  const glow = track(scene, room, scene.add.circle(x, y, 40, 0xaa1111, 0).setBlendMode(Phaser.BlendModes.ADD));
  tween(scene, room, { targets: glow, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });
}

function doorAjar(scene, room) {
  const { x, y } = room.toWorld(ANOMALY_SLOTS.DOOR_RIGHT);
  const light = track(scene, room, scene.add.rectangle(x + 26, y, 3, 220, 0xffc870, 0.8).setOrigin(0.5));
  tween(scene, room, { targets: light, width: 14, duration: 1200 });
}

function figure(scene, room) {
  const { x, y } = room.toWorld(ANOMALY_SLOTS.FAR_END);
  const silhouette = track(scene, room, scene.add.image(x, y, 'figure').setAlpha(0));
  tween(scene, room, { targets: silhouette, alpha: 0.85, duration: 1500 });
}

export const ANOMALIES = {
  flicker: { enabled: true, weight: 1, apply: flicker, sound: 'buzz' },
  eyes: { enabled: true, weight: 1, apply: eyes, sound: null },
  clockGlow: { enabled: true, weight: 1, apply: clockGlow, sound: null },
  doorAjar: { enabled: true, weight: 1, apply: doorAjar, sound: 'doorSlide' },
  figure: { enabled: true, weight: 1, apply: figure, sound: 'heartbeat' },
};

export function pickAnomaly(previousId, forcedId = null) {
  const candidates = Object.entries(ANOMALIES).filter(([, entry]) => entry.enabled);
  if (forcedId && ANOMALIES[forcedId]?.enabled) return forcedId;
  const different = candidates.filter(([id]) => id !== previousId);
  const options = different.length ? different : candidates;
  const totalWeight = options.reduce((sum, [, entry]) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const [id, entry] of options) {
    roll -= entry.weight;
    if (roll < 0) return id;
  }
  return options[options.length - 1][0];
}

export function resetRoom(room) {
  room.tweens.forEach((effect) => effect.stop());
  room.tweens = [];
  room.anomalyObjects.forEach((object) => object.destroy());
  room.anomalyObjects = [];
  room.world.setScale(room.baseScale);
  room.darkness.setAlpha(DARKNESS_BASE);
}
