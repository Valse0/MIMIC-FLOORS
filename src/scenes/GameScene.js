import Phaser from 'phaser';
import { ANOMALY_SLOTS, DEPTH, LAYOUT } from '../config/layout.js';
import { FloorManager } from '../managers/FloorManager.js';
import { LivesManager } from '../managers/LivesManager.js';
import { Hud } from '../ui/Hud.js';
import { createRoom } from '../ui/RoomBuilder.js';
import { ANOMALIES, pickAnomaly, resetRoom } from '../config/anomalies.js';
import { Elevator } from '../ui/Elevator.js';
import { FloorControls } from '../ui/FloorControls.js';
export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.testParams = this.readTestParams();
    this.builtObjects = [];
    this.floorManager = new FloorManager(this.testParams.floor);
    this.livesManager = new LivesManager();
    this.streak = 0;
    this.bestStreak = 0;
    this.lastAnomalyId = null;
    this.audioManager = this.registry.get('audioManager');
    this.audioManager?.startAmbience();
    this.inputLocked = true;
    this.room = createRoom(this);
    [this.room.world, this.room.darkness, this.room.grain, this.room.vignette]
      .forEach((object) => this.track(object));
    this.track(this.room.gradient);
    this.track(this.room.colorGrade);
    this.room.dust.forEach(({ particle }) => this.track(particle));
    this.room.grain.setScrollFactor(0);
    this.room.darkness.setScrollFactor(0);
    this.room.vignette.setScrollFactor(0);
    this.createDebugSlots();
    this.elevator = new Elevator(this, (object) => this.track(object));
    this.hud = new Hud(this);
    this.tutorialLabel = this.track(this.add.text(LAYOUT.tutorial.x, LAYOUT.tutorial.y, '', {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#d8c9a0',
      align: 'center', wordWrap: { width: LAYOUT.tutorial.width },
    }).setOrigin(0.5).setDepth(DEPTH.HUD).setScrollFactor(0).setStroke('#17130d', 4).setAlpha(0));
    this.feedbackLabel = this.track(this.add.text(LAYOUT.feedback.x, LAYOUT.feedback.y, '', {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#c9b27a',
    }).setOrigin(0.5).setDepth(DEPTH.FEEDBACK).setScrollFactor(0).setStroke('#17130d', 4));
    this.mimicFlash = this.track(this.add.rectangle(360, 640, 720, 1280, 0xa60000, 0)
      .setDepth(DEPTH.FEEDBACK - 1).setScrollFactor(0));
    this.controls = new FloorControls(this, (choice) => this.answer(choice));
    this.events.once('shutdown', this.cleanup, this);
    this.showFloor();
  }

  track(object) {
    this.builtObjects.push(object);
    return object;
  }

  readTestParams() {
    const query = new URLSearchParams(window.location.search);
    const parsedFloor = Number.parseInt(query.get('floor') || '1', 10);
    const floor = Number.isFinite(parsedFloor) ? Math.max(1, parsedFloor) : 1;
    return { floor, anomaly: query.get('anomaly'), debug: query.get('debug') === '1' };
  }

  createDebugSlots() {
    if (!this.testParams.debug) return;
    Object.values(ANOMALY_SLOTS).forEach((slot) => {
      const { x, y } = this.room.toWorld(slot);
      const cross = this.add.graphics().lineStyle(3, 0xff00ff, 1);
      cross.beginPath();
      cross.moveTo(x - 10, y);
      cross.lineTo(x + 10, y);
      cross.moveTo(x, y - 10);
      cross.lineTo(x, y + 10);
      cross.strokePath();
      this.room.world.add(cross);
    });
  }

  showFloor() {
    const config = this.floorManager.currentConfig;
    this.audioManager?.stopLightHum();
    resetRoom(this.room);
    this.controls.hide();
    this.elevator.reset();
    this.inputLocked = true;
    this.addBreathing();
    if (config.isMimic) {
      const forced = ANOMALIES[this.testParams.anomaly]?.enabled ? this.testParams.anomaly : null;
      const anomalyId = forced || config.anomalyId || pickAnomaly(this.lastAnomalyId);
      ANOMALIES[anomalyId].apply(this, this.room);
      this.playAnomalySound(ANOMALIES[anomalyId].sound);
      this.lastAnomalyId = anomalyId;
    }
    this.audioManager?.startAmbience();
    if (this.livesManager.lives === 1) this.audioManager?.heartbeat();
    this.hud.updateFloor(config.floor);
    this.hud.updateLives(this.livesManager.lives);
    this.hud.updateStreak(this.streak);
    this.tutorialLabel.setText(config.tutorialText).setAlpha(0);
    if (config.tutorialText) this.tweens.add({ targets: this.tutorialLabel, alpha: 1, duration: 300 });
    this.feedbackLabel.setText('').setScale(1).setAlpha(0);
    this.room.tweens.push(this.tweens.add({ targets: this.room.world,
      scale: this.room.baseScale * 1.04, duration: 2500, yoyo: true,
      repeat: -1, ease: 'Sine.easeOut' }));
    this.openDoors();
  }

  openDoors() {
    this.elevator.open(() => {
      if (this.floorManager.currentConfig.isMimic) {
        this.mimicFlash.setAlpha(0.42);
        this.tweens.add({ targets: this.mimicFlash, alpha: 0, duration: 200 });
      }
      this.controls.reveal(this.floorManager.currentConfig.timeLimitMs, () => {
        this.inputLocked = false;
      }, () => this.answer('timeout'));
    });
  }

  playAnomalySound(sound) {
    if (sound === 'buzz') this.audioManager?.buzz();
    if (sound === 'doorSlide') this.audioManager?.doorSlide(0.025);
    if (sound === 'heartbeat') this.audioManager?.heartbeat(0.035);
  }

  addBreathing() {
    const camera = this.cameras.main;
    camera.setScroll(-4, -3);
    this.room.tweens.push(this.tweens.add({ targets: camera, scrollX: 4,
      duration: 3200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
    this.room.tweens.push(this.tweens.add({ targets: camera, scrollY: 3,
      duration: 4100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
  }

  answer(choice) {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.controls.stopTimer();
    const config = this.floorManager.currentConfig;
    const correct = (choice === 'exit' && !config.isMimic)
      || (choice === 'close' && config.isMimic);
    if (correct) {
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      this.feedbackLabel.setText('DOĞRU').setColor('#c9b27a').setAlpha(0);
      this.audioManager?.correct();
      this.cameras.main.shake(100, 0.003);
      if ([3, 5, 10].includes(this.streak)) {
        this.cameras.main.flash(130, 255, 225, 80);
        this.hud.popStreak(this.tweens);
      }
    } else {
      this.streak = 0;
      this.livesManager.loseLife();
      this.hud.updateLives(this.livesManager.lives);
      if (this.livesManager.lives === 1) this.audioManager?.heartbeat();
      this.feedbackLabel.setText('YANLIŞ').setColor('#c9b27a').setAlpha(0);
      this.audioManager?.wrong();
      this.cameras.main.flash(150, 255, 0, 0);
      try {
        if (navigator.vibrate) navigator.vibrate(100);
      } catch {
        // Vibration is optional and must not interrupt gameplay.
      }
    }
    this.hud.updateStreak(this.streak);
    if (this.tutorialLabel.alpha > 0) {
      this.tweens.add({ targets: this.tutorialLabel, alpha: 0, duration: 300 });
    }
    this.tweens.add({
      targets: this.feedbackLabel, alpha: 1, duration: 100,
      onComplete: () => this.tweens.add({
        targets: this.feedbackLabel, alpha: 0, scale: 1.04, duration: 200,
        onComplete: () => this.elevator.close(() => this.finishFloor(config.floor)),
      }),
    });
  }

  finishFloor(answeredFloor) {
    if (this.livesManager.isDead()) {
      this.hud.showEndScreen('OYUN BİTTİ', `Ulaşılan kat: ${answeredFloor}   En iyi seri: ${this.bestStreak}`);
      return;
    }
    if (answeredFloor >= 100) {
      this.hud.showEndScreen('KAZANDIN', `En iyi seri: ${this.bestStreak}`);
      return;
    }
    this.floorManager.advance();
    this.showFloor();
  }

  cleanup() {
    this.tweens.killAll();
    this.audioManager?.stopAmbience();
    this.cameras.main.setScroll(0, 0);
    this.room?.grainEvent.remove();
    this.builtObjects.forEach((object) => object.destroy());
    this.builtObjects = [];
  }
}
