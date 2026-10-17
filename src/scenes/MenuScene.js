import Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.text(360, 520, 'MIMIC FLOORS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const button = this.add.rectangle(360, 680, 280, 96, 0xeeeeee)
      .setInteractive({ useHandCursor: true });
    this.add.text(360, 680, 'Başla', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '40px',
      color: '#111111',
    }).setOrigin(0.5);

    button.on('pointerdown', () => {
      const audioManager = new AudioManager();
      audioManager.resume();
      this.registry.set('audioManager', audioManager);
      this.scene.start('GameScene');
    });
  }
}
