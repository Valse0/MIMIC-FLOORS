import Phaser from 'phaser';
import { createAtmosphereTextures } from '../ui/Atmosphere.js';

const IMAGE_PATH = import.meta.env.BASE_URL + 'assets/corridor_normal.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.add.text(360, 640, 'Yükleniyor...', {
      fontFamily: 'Arial, sans-serif', fontSize: '32px', color: '#ffffff',
    }).setOrigin(0.5);
    this.load.image('corridor_normal', IMAGE_PATH);
  }

  create() {
    if (!this.textures.exists('corridor_normal')) {
      this.add.text(360, 640, `Görsel yüklenemedi:\n${IMAGE_PATH}`, {
        fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#ff3333',
        align: 'center', wordWrap: { width: 660 },
      }).setOrigin(0.5);
      return;
    }
    createAtmosphereTextures(this);
    this.scene.start('MenuScene');
  }
}
