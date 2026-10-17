import { DEPTH, LAYOUT } from '../config/layout.js';

const FONT = 'Georgia, serif';
const BRASS = '#c9b27a';

export class Hud {
  constructor(scene) {
    this.scene = scene;
    const addText = (x, y, value, style) => scene.track(
      scene.add.text(x, y, value, style).setOrigin(0.5).setDepth(DEPTH.HUD)
        .setScrollFactor(0).setStroke('#17130d', 4),
    );
    this.floor = addText(LAYOUT.hud.floorX, LAYOUT.hud.floorY, '', {
      fontFamily: FONT, fontSize: '38px', color: '#d8c9a0', letterSpacing: 4,
    });
    this.hearts = LAYOUT.hud.heartXs.map((x) => scene.track(
      scene.add.circle(x, LAYOUT.hud.heartY, 12).setDepth(DEPTH.HUD).setScrollFactor(0),
    ));
    this.streak = addText(LAYOUT.hud.streakX, LAYOUT.hud.streakY, '', {
      fontFamily: FONT, fontSize: '28px', color: BRASS,
    });
  }

  updateFloor(floor) { this.floor.setText(`Floor ${floor}`); }

  updateLives(lives) {
    this.hearts.forEach((bulb, index) => {
      if (index < lives) bulb.setFillStyle(0xffd27a, 1).setStrokeStyle(0, 0x5a4a30);
      else bulb.setFillStyle(0x000000, 0).setStrokeStyle(2, 0x5a4a30, 1);
    });
  }

  updateStreak(streak) { this.streak.setText(streak >= 2 ? `STREAK x${streak}` : ''); }

  popStreak(tweens) {
    this.streak.setScale(1);
    tweens.add({ targets: this.streak, scale: 1.15, duration: 180, yoyo: true, ease: 'Sine.easeOut' });
  }

  showEndScreen(title, detail) {
    const scene = this.scene;
    scene.inputLocked = true;
    scene.audioManager?.stopAmbience();
    const { centerX, centerY, width, height, titleY, detailY, buttonY, buttonWidth, buttonHeight } = LAYOUT.overlay;
    scene.track(scene.add.rectangle(centerX, centerY, width, height, 0x000000, 0.82)
      .setDepth(DEPTH.OVERLAY).setScrollFactor(0));
    scene.track(scene.add.text(centerX, titleY, title, {
      fontFamily: FONT, fontSize: '58px', color: '#d8c9a0', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH.OVERLAY).setScrollFactor(0).setStroke('#17130d', 4));
    scene.track(scene.add.text(centerX, detailY, detail, {
      fontFamily: FONT, fontSize: '24px', color: BRASS, align: 'center', wordWrap: { width: 620 },
    }).setOrigin(0.5).setDepth(DEPTH.OVERLAY).setScrollFactor(0).setStroke('#17130d', 4));
    const button = scene.track(scene.add.rectangle(centerX, buttonY, buttonWidth, buttonHeight, 0x000000, 0.6)
      .setStrokeStyle(2, 0x8a7440).setDepth(DEPTH.OVERLAY).setScrollFactor(0)
      .setInteractive({ useHandCursor: true }));
    scene.track(scene.add.text(centerX, buttonY, 'Tekrar', {
      fontFamily: FONT, fontSize: '36px', color: BRASS,
    }).setOrigin(0.5).setDepth(DEPTH.OVERLAY).setScrollFactor(0));
    button.on('pointerdown', () => {
      scene.audioManager?.stopAmbience();
      scene.scene.restart();
    });
  }
}
