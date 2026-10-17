import { DARKNESS_BASE, DEPTH, GAME_H, GAME_W } from '../config/layout.js';

export function createAtmosphereTextures(scene) {
  createVignette(scene);
  createGrain(scene);
}

function createVignette(scene) {
  if (scene.textures.exists('vignette')) return;
  const texture = scene.textures.createCanvas('vignette', GAME_W, GAME_H);
  const context = texture.getContext();
  const gradient = context.createRadialGradient(360, 620, 180, 360, 620, 760);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.55, 'rgba(0,0,0,0.22)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.78)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, GAME_W, GAME_H);
  texture.refresh();
}

function createGrain(scene) {
  if (scene.textures.exists('grain')) return;
  const texture = scene.textures.createCanvas('grain', 128, 128);
  const context = texture.getContext();
  const pixels = context.createImageData(128, 128);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const shade = Math.floor(Math.random() * 256);
    pixels.data[index] = shade;
    pixels.data[index + 1] = shade;
    pixels.data[index + 2] = shade;
    pixels.data[index + 3] = Math.floor(Math.random() * 100);
  }
  context.putImageData(pixels, 0, 0);
  texture.refresh();
}

export function buildRoom(scene) {
  const background = scene.add.image(360, 640, 'corridor_normal').setDepth(DEPTH.BG);
  const baseScale = Math.max(GAME_W / background.width, GAME_H / background.height);
  background.setScale(baseScale);
  const darkness = scene.add.rectangle(360, 640, GAME_W, GAME_H, 0x000000, DARKNESS_BASE)
    .setDepth(DEPTH.DARKNESS);
  const grain = scene.add.tileSprite(360, 640, GAME_W, GAME_H, 'grain')
    .setAlpha(0.08).setDepth(DEPTH.GRAIN);
  const vignette = scene.add.image(360, 640, 'vignette').setDepth(DEPTH.VIGNETTE);
  const offsets = [{ x: 0, y: 0 }, { x: 17, y: 29 }, { x: 41, y: 7 },
    { x: 63, y: 52 }, { x: 89, y: 31 }, { x: 109, y: 77 }];
  let offsetIndex = 0;
  const grainEvent = scene.time.addEvent({ delay: 90, loop: true, callback: () => {
    offsetIndex = (offsetIndex + 1 + Math.floor(Math.random() * 5)) % offsets.length;
    grain.setTilePosition(offsets[offsetIndex].x, offsets[offsetIndex].y);
  } });
  return { background, baseScale, darkness, grain, vignette, grainEvent, tweens: [] };
}

export function resetRoom(room) {
  room.tweens.forEach((tween) => tween.stop());
  room.tweens = [];
  room.background.setScale(room.baseScale);
  room.darkness.setAlpha(DARKNESS_BASE);
}
