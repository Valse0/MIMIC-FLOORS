import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.add.text(360, 640, 'Floor 1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}
