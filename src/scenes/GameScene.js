import Phaser from 'phaser';
import { LAYOUT } from '../config/layout.js';
import { FloorManager } from '../managers/FloorManager.js';
import { LivesManager } from '../managers/LivesManager.js';
import { Hud } from '../ui/Hud.js';
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
    this.inputLocked = false;
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
    } else {
      this.streak = 0;
      this.livesManager.loseLife();
      this.hud.updateLives(this.livesManager.lives);
      this.feedbackLabel.setText('YANLIŞ').setColor('#f04c4c');
    }
    this.hud.updateStreak(this.streak);
    this.tweens.add({
      targets: this.feedbackLabel, scale: 1.15, duration: 160, yoyo: true,
      onComplete: () => this.finishFloor(config.floor),
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
  const room = { tweens: [], carpetStripes: [], normalStripeColors: [] };
  const add = (object) => scene.track(object);
  const { corridor, floor, backWall, carpet, light, painting, clock, mainDoor, extraDoor, frame } = LAYOUT;
  add(scene.add.rectangle(floor.x + floor.width / 2, floor.y + floor.height / 2,
    floor.width, floor.height, 0x333333));
  add(scene.add.rectangle(backWall.x + backWall.width / 2, backWall.y + backWall.height / 2,
    backWall.width, backWall.height, 0x77716a));
  room.carpet = add(scene.add.rectangle(carpet.x + carpet.width / 2, carpet.y + carpet.height / 2,
    carpet.width, carpet.height, 0x7c2525));
  [0, 1, 2].forEach((index) => {
    const color = index % 2 ? LAYOUT.carpetStripeColors.light : LAYOUT.carpetStripeColors.dark;
    const stripe = add(scene.add.rectangle(
      carpet.x + carpet.width / 2, carpet.y + LAYOUT.carpetStripe.firstY + index * LAYOUT.carpetStripe.spacing,
      carpet.width - LAYOUT.carpetStripe.inset * 2, LAYOUT.carpetStripe.height, color,
    ));
    room.carpetStripes.push(stripe);
    room.normalStripeColors.push(color);
  });
  room.light = add(scene.add.circle(light.x, light.y, light.radius, 0xfff6c7));
  add(scene.add.rectangle(painting.x + painting.size / 2, painting.y + painting.size / 2,
    painting.size, painting.size, 0xe0bd36));
  room.painting = add(scene.add.rectangle(painting.x + painting.size / 2, painting.y + painting.size / 2,
    painting.size - 18, painting.size - 18, 0x987a26));
  room.eyes = [
    add(scene.add.circle(painting.x + LAYOUT.paintingEyes.leftX, painting.y + LAYOUT.paintingEyes.y,
      LAYOUT.paintingEyes.radius, 0x111111)),
    add(scene.add.circle(painting.x + LAYOUT.paintingEyes.rightX, painting.y + LAYOUT.paintingEyes.y,
      LAYOUT.paintingEyes.radius, 0x111111)),
  ];
  room.normalEyePositions = room.eyes.map(({ x, y }) => ({ x, y }));
  room.clock = add(scene.add.circle(clock.x, clock.y, clock.radius, 0xe9e1ce));
  room.clockHand = add(scene.add.line(clock.x, clock.y, 0, 0, 0, -LAYOUT.clockHand.length,
    0x222222, LAYOUT.clockHand.width));
  room.extraDoor = add(scene.add.rectangle(extraDoor.x + extraDoor.width / 2,
    extraDoor.y + extraDoor.height / 2, extraDoor.width, extraDoor.height, 0x704326).setVisible(false));
  room.mainDoor = add(scene.add.rectangle(mainDoor.x + mainDoor.width / 2,
    mainDoor.y + mainDoor.height / 2, mainDoor.width, mainDoor.height, 0x81512e));
  add(scene.add.rectangle(frame.x + frame.width / 2, frame.y + frame.height / 2,
    frame.width, frame.height, 0x111111, 0).setStrokeStyle(14, 0x202020));
  add(scene.add.rectangle(corridor.left, LAYOUT.corridorSides.y,
    LAYOUT.corridorSides.width, LAYOUT.corridorSides.height, 0x202020));
  add(scene.add.rectangle(corridor.right, LAYOUT.corridorSides.y,
    LAYOUT.corridorSides.width, LAYOUT.corridorSides.height, 0x202020));
  return room;
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
