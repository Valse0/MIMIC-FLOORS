import { DEPTH, GAME_H, GAME_W } from '../config/layout.js';

export class Elevator {
  constructor(scene, track) {
    this.scene = scene;
    this.left = track(scene.add.rectangle(180, 640, 360, GAME_H, 0x080808)
      .setDepth(DEPTH.DOOR).setScrollFactor(0));
    this.right = track(scene.add.rectangle(540, 640, 360, GAME_H, 0x080808)
      .setDepth(DEPTH.DOOR).setScrollFactor(0));
    this.leftEdge = track(scene.add.rectangle(358, 640, 3, GAME_H, 0x766b55)
      .setDepth(DEPTH.DOOR + 1).setScrollFactor(0));
    this.rightEdge = track(scene.add.rectangle(362, 640, 3, GAME_H, 0x766b55)
      .setDepth(DEPTH.DOOR + 1).setScrollFactor(0));
    this.closed = true;
  }

  open(onComplete) {
    this.scene.audioManager?.ding();
    this.scene.audioManager?.doorSlide();
    this.slide(-180, GAME_W + 180, 700, onComplete);
    this.closed = false;
  }

  close(onComplete) {
    this.scene.audioManager?.doorSlide();
    this.slide(180, 540, 500, onComplete);
    this.closed = true;
  }

  slide(leftX, rightX, duration, onComplete) {
    this.scene.tweens.add({ targets: this.left, x: leftX, duration, ease: 'Cubic.easeInOut' });
    this.scene.tweens.add({ targets: this.right, x: rightX, duration, ease: 'Cubic.easeInOut' });
    this.scene.tweens.add({ targets: this.leftEdge, x: leftX + 178,
      duration, ease: 'Cubic.easeInOut' });
    this.scene.tweens.add({ targets: this.rightEdge, x: rightX - 178,
      duration, ease: 'Cubic.easeInOut', onComplete });
  }

  reset() {
    this.left.setX(180);
    this.right.setX(540);
    this.leftEdge.setX(358);
    this.rightEdge.setX(362);
    this.closed = true;
  }
}
