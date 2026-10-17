import Phaser from 'phaser';
import { LAYOUT } from '../config/layout.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.builtObjects = [];
    this.floorLabel = this.track(this.add.text(LAYOUT.centerX, LAYOUT.floorLabelY, 'Floor 1', {
      fontFamily: 'Arial, sans-serif', fontSize: '48px', color: '#ffffff',
    }).setOrigin(0.5));
    this.room = buildRoom(this);
    this.statusLabel = this.track(this.add.text(LAYOUT.centerX, LAYOUT.statusY, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5));
    this.createButton('ÇIK', LAYOUT.buttons.leftX, 0x279b56, 'ÇIK basıldı');
    this.createButton('KAPAT', LAYOUT.buttons.rightX, 0xb33a35, 'KAPAT basıldı');
    this.events.once('shutdown', this.cleanup, this);
  }

  track(object) {
    this.builtObjects.push(object);
    return object;
  }

  createButton(label, x, color, message) {
    const { y, width, height } = LAYOUT.buttons;
    const button = this.track(this.add.rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true }));
    const text = this.track(this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '32px', color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5));
    button.on('pointerdown', () => { this.statusLabel.setText(message); });
    text.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.statusLabel.setText(message);
    });
  }

  cleanup() {
    this.tweens.killAll();
    this.builtObjects.forEach((object) => object.destroy());
    this.builtObjects = [];
  }
}

function buildRoom(scene) {
  const room = {};
  const add = (object) => scene.track(object);
  const { corridor, floor, backWall, carpet, light, painting, clock, mainDoor, extraDoor, frame } = LAYOUT;
  add(scene.add.rectangle(floor.x + floor.width / 2, floor.y + floor.height / 2,
    floor.width, floor.height, 0x333333));
  add(scene.add.rectangle(backWall.x + backWall.width / 2, backWall.y + backWall.height / 2,
    backWall.width, backWall.height, 0x77716a));
  room.carpet = add(scene.add.rectangle(carpet.x + carpet.width / 2, carpet.y + carpet.height / 2,
    carpet.width, carpet.height, 0x7c2525));
  [0, 1, 2].forEach((index) => add(scene.add.rectangle(
    carpet.x + carpet.width / 2, carpet.y + LAYOUT.carpetStripe.firstY + index * LAYOUT.carpetStripe.spacing,
    carpet.width - LAYOUT.carpetStripe.inset * 2, LAYOUT.carpetStripe.height,
    index % 2 ? 0xd6aa58 : 0x512020,
  )));
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
