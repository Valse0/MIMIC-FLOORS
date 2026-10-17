import Phaser from 'phaser';
import { LAYOUT } from '../config/layout.js';
import { FloorManager } from '../managers/FloorManager.js';
import { LivesManager } from '../managers/LivesManager.js';
import { Hud } from '../ui/Hud.js';
import { createRoom } from '../ui/RoomBuilder.js';
import { ANOMALIES, resetRoom } from '../config/anomalies.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.builtObjects = [];
    this.floorManager = new FloorManager();
    this.livesManager = new LivesManager();
    this.streak = 0;
    this.bestStreak = 0;
    this.lastAnomalyId = null;
    this.audioManager = this.registry.get('audioManager');
    this.inputLocked = true;
    this.room = buildRoom(this);
    this.hud = new Hud(this);
    this.tutorialLabel = this.track(this.add.text(LAYOUT.tutorial.x, LAYOUT.tutorial.y, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#ffffff',
      align: 'center', wordWrap: { width: LAYOUT.tutorial.width },
    }).setOrigin(0.5));
    this.feedbackLabel = this.track(this.add.text(LAYOUT.feedback.x, LAYOUT.feedback.y, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));
    this.createButton('ÇIK', LAYOUT.buttons.leftX, 0x279b56, 'exit');
    this.createButton('KAPAT', LAYOUT.buttons.rightX, 0xb33a35, 'close');
    this.events.once('shutdown', this.cleanup, this);
    this.showFloor();
  }

  track(object) {
    this.builtObjects.push(object);
    return object;
  }

  createButton(label, x, color, answer) {
    const { y, width, height } = LAYOUT.buttons;
    const button = this.track(this.add.rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true }));
    this.track(this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));
    button.on('pointerdown', () => this.answer(answer));
  }

  showFloor() {
    const config = this.floorManager.currentConfig;
    resetRoom(this.room);
    this.inputLocked = true;
    if (config.isMimic) {
      const anomalyId = config.anomalyId || pickAnomaly(this.lastAnomalyId);
      ANOMALIES[anomalyId].apply(this, this.room);
      this.lastAnomalyId = anomalyId;
    }
    this.hud.updateFloor(config.floor);
    this.hud.updateLives(this.livesManager.lives);
    this.hud.updateStreak(this.streak);
    this.tutorialLabel.setText(config.tutorialText);
    this.feedbackLabel.setText('').setScale(1);
    this.openDoors();
  }

  openDoors() {
    let openedPanels = 0;
    const onOpened = () => {
      openedPanels += 1;
      if (openedPanels === 2) this.inputLocked = false;
    };
    const { duration } = LAYOUT.doorMotion;
    this.tweens.add({ targets: this.room.mainDoor, x: this.room.doorOpenPositions.left.x,
      duration, ease: 'Sine.easeOut', onComplete: onOpened });
    this.tweens.add({ targets: this.room.doorRight, x: this.room.doorOpenPositions.right.x,
      duration, ease: 'Sine.easeOut', onComplete: onOpened });
  }

  closeDoors(onClosed) {
    let closedPanels = 0;
    const onClosedPanel = () => {
      closedPanels += 1;
      if (closedPanels === 2) onClosed();
    };
    const { duration } = LAYOUT.doorMotion;
    this.tweens.add({ targets: this.room.mainDoor, x: this.room.doorClosedPositions.left.x,
      duration, ease: 'Sine.easeIn', onComplete: onClosedPanel });
    this.tweens.add({ targets: this.room.doorRight, x: this.room.doorClosedPositions.right.x,
      duration, ease: 'Sine.easeIn', onComplete: onClosedPanel });
  }

  answer(choice) {
    if (this.inputLocked) return;
    this.inputLocked = true;
    const config = this.floorManager.currentConfig;
    const correct = (choice === 'exit' && !config.isMimic)
      || (choice === 'close' && config.isMimic);
    if (correct) {
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      this.feedbackLabel.setText('DOĞRU').setColor('#42d66b');
      this.audioManager?.ding();
      this.cameras.main.shake(100, 0.003);
      if ([3, 5, 10].includes(this.streak)) {
        this.cameras.main.flash(130, 255, 225, 80);
        this.hud.popStreak(this.tweens);
      }
    } else {
      this.streak = 0;
      this.livesManager.loseLife();
      this.hud.updateLives(this.livesManager.lives);
      this.feedbackLabel.setText('YANLIŞ').setColor('#f04c4c');
      this.audioManager?.buzz();
      this.cameras.main.flash(150, 255, 0, 0);
      try {
        if (navigator.vibrate) navigator.vibrate(100);
      } catch {
        // Vibration is optional and must not interrupt gameplay.
      }
    }
    this.hud.updateStreak(this.streak);
    this.tweens.add({
      targets: this.feedbackLabel, scale: 1.15, duration: 160, yoyo: true,
      onComplete: () => this.closeDoors(() => this.finishFloor(config.floor)),
    });
  }

  finishFloor(answeredFloor) {
    if (this.livesManager.isDead()) {
      this.showEndScreen('OYUN BİTTİ', `Ulaşılan kat: ${answeredFloor}   En iyi seri: ${this.bestStreak}`);
      return;
    }
    if (answeredFloor >= 100) {
      this.showEndScreen('KAZANDIN', `En iyi seri: ${this.bestStreak}`);
      return;
    }
    this.floorManager.advance();
    this.showFloor();
  }

  showEndScreen(title, detail) {
    this.inputLocked = true;
    const { centerX, centerY, width, height, titleY, detailY, buttonY, buttonWidth, buttonHeight } = LAYOUT.overlay;
    this.track(this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.82));
    this.track(this.add.text(centerX, titleY, title, {
      fontFamily: 'Arial, sans-serif', fontSize: '58px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));
    this.track(this.add.text(centerX, detailY, detail, {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#ffffff', align: 'center',
      wordWrap: { width: 620 },
    }).setOrigin(0.5));
    const button = this.track(this.add.rectangle(centerX, buttonY, buttonWidth, buttonHeight, 0xeeeeee)
      .setInteractive({ useHandCursor: true }));
    this.track(this.add.text(centerX, buttonY, 'Tekrar', {
      fontFamily: 'Arial, sans-serif', fontSize: '36px', color: '#111111',
    }).setOrigin(0.5));
    button.on('pointerdown', () => this.scene.restart());
  }

  cleanup() {
    this.tweens.killAll();
    this.builtObjects.forEach((object) => object.destroy());
    this.builtObjects = [];
  }
}

function buildRoom(scene) {
  return createRoom(scene);
}

function pickAnomaly(previousId) {
  let candidates = Object.entries(ANOMALIES).filter(([id]) => id !== previousId);
  if (!candidates.length) candidates = Object.entries(ANOMALIES);
  const totalWeight = candidates.reduce((sum, [, anomaly]) => sum + anomaly.weight, 0);
  let choice = Math.random() * totalWeight;
  for (const [id, anomaly] of candidates) {
    choice -= anomaly.weight;
    if (choice < 0) return id;
  }
  return candidates[candidates.length - 1][0];
}
