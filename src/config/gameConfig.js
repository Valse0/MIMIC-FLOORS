import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { GameScene } from '../scenes/GameScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: 0x111111,
  physics: { default: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene],
};
