import Phaser from 'phaser';

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

    button.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
