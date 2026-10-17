import { DEPTH, LAYOUT } from '../config/layout.js';

export class Hud {
  constructor(scene) {
    this.scene = scene;
    const addText = (x, y, value, style) => scene.track(
      scene.add.text(x, y, value, style).setOrigin(0.5).setDepth(DEPTH.HUD).setStroke('#000000', 4),
    );
    this.floor = addText(LAYOUT.hud.floorX, LAYOUT.hud.floorY, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '38px', color: '#ffffff',
    });
    this.hearts = LAYOUT.hud.heartXs.map((x) => addText(x, LAYOUT.hud.heartY, '♥', {
      fontFamily: 'Arial, sans-serif', fontSize: '36px', color: '#e74c3c',
    }));
    this.streak = addText(LAYOUT.hud.streakX, LAYOUT.hud.streakY, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '28px', color: '#f1c40f',
    });
  }

  updateFloor(floor) {
    this.floor.setText(`Floor ${floor}`);
  }

  updateLives(lives) {
    this.hearts.forEach((heart, index) => {
      heart.setColor(index < lives ? '#e74c3c' : '#555555');
    });
  }

  updateStreak(streak) {
    this.streak.setText(streak >= 2 ? `STREAK x${streak}` : '');
  }

  popStreak(tweens) {
    this.streak.setScale(1);
    tweens.add({ targets: this.streak, scale: 1.3, duration: 180, yoyo: true, ease: 'Back.Out' });
  }
}
