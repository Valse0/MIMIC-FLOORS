import { DEPTH, LAYOUT } from '../config/layout.js';

export class FloorControls {
  constructor(scene, onAnswer) {
    this.scene = scene;
    this.onAnswer = onAnswer;
    this.controls = [
      this.createButton('NORMAL', LAYOUT.buttons.leftX, 'exit'),
      this.createButton('ANOMALİ', LAYOUT.buttons.rightX, 'close'),
    ];
    this.timerBar = scene.track(scene.add.rectangle(80, 1100, 560, 6, 0x8a7440)
      .setOrigin(0, 0.5).setDepth(DEPTH.BUTTONS).setScrollFactor(0).setAlpha(0));
    this.revealTween = null;
    this.timerTween = null;
  }

  createButton(label, x, answer) {
    const { y, width, height } = LAYOUT.buttons;
    const button = this.scene.track(this.scene.add.rectangle(x, y, width, height, 0x000000, 0.55)
      .setStrokeStyle(2, 0x8a7440).setDepth(DEPTH.BUTTONS).setScrollFactor(0).setAlpha(0));
    const text = this.scene.track(this.scene.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '27px', color: '#c9b27a', fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(DEPTH.BUTTONS).setScrollFactor(0).setAlpha(0));
    button.on('pointerdown', () => this.onAnswer(answer));
    return { button, text };
  }

  hide() {
    this.revealTween?.stop();
    this.timerTween?.stop();
    this.timerTween = null;
    this.controls.forEach(({ button, text }) => {
      button.disableInteractive().setAlpha(0);
      text.setAlpha(0);
    });
    this.timerBar.setAlpha(0).setScaleX(1).setFillStyle(0x8a7440);
  }

  reveal(timeLimitMs, onReady, onTimeout) {
    const targets = this.controls.flatMap(({ button, text }) => [button, text]);
    this.revealTween = this.scene.tweens.add({ targets, alpha: 1,
      delay: 1000, duration: 300, onComplete: () => {
        this.controls.forEach(({ button }) => button.setInteractive({ useHandCursor: true }));
        onReady();
        if (timeLimitMs > 0) this.startTimer(timeLimitMs, onTimeout);
      } });
  }

  startTimer(timeLimitMs, onTimeout) {
    this.timerBar.setAlpha(1).setScaleX(1);
    let warningShown = false;
    this.timerTween = this.scene.tweens.add({ targets: this.timerBar, scaleX: 0,
      duration: timeLimitMs, ease: 'Linear',
      onUpdate: (tween) => {
        if (!warningShown && tween.progress >= (timeLimitMs - 2000) / timeLimitMs) {
          warningShown = true;
          this.timerBar.setFillStyle(0x8a3030);
        }
      }, onComplete: onTimeout });
    this.scene.room.tweens.push(this.timerTween);
  }

  stopTimer() {
    this.timerTween?.stop();
    this.timerTween = null;
    this.timerBar.setAlpha(0);
  }
}
