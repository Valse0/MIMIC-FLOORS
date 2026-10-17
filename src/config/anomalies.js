import { LAYOUT } from './layout.js';

function addRoomTween(scene, room, config) {
  room.tweens.push(scene.tweens.add(config));
}

export const ANOMALIES = {
  flicker: {
    weight: 1,
    apply(scene, room) {
      addRoomTween(scene, room, {
        targets: room.light,
        alpha: LAYOUT.anomalyMotion.flickerAlpha,
        duration: LAYOUT.anomalyMotion.flickerDuration,
        ease: 'Linear',
        yoyo: true,
        repeat: -1,
      });
    },
  },
  eyes: {
    weight: 1,
    apply(scene, room) {
      room.eyes.forEach((eye, index) => addRoomTween(scene, room, {
        targets: eye,
        x: room.normalEyePositions[index].x + LAYOUT.anomalyMotion.eyeDistance,
        duration: LAYOUT.anomalyMotion.eyeDuration,
        ease: 'Linear',
        yoyo: true,
        repeat: -1,
      }));
    },
  },
  carpetReversed: {
    weight: 1,
    apply(scene, room) {
      room.carpetStripes.forEach((stripe, index) => {
        stripe.setFillStyle(index % 2 ? LAYOUT.carpetStripeColors.dark : LAYOUT.carpetStripeColors.light);
      });
    },
  },
  extraDoor: {
    weight: 1,
    apply(scene, room) {
      room.extraDoor.setVisible(true);
    },
  },
  clockReverse: {
    weight: 1,
    apply(scene, room) {
      addRoomTween(scene, room, {
        targets: room.clockHand,
        angle: -360,
        duration: LAYOUT.anomalyMotion.clockDuration,
        ease: 'Linear',
        repeat: -1,
      });
    },
  },
};

export function resetRoom(room) {
  room.tweens.forEach((tween) => tween.stop());
  room.tweens = [];
  room.light.setAlpha(1);
  room.eyes.forEach((eye, index) => eye.setPosition(
    room.normalEyePositions[index].x,
    room.normalEyePositions[index].y,
  ));
  room.carpetStripes.forEach((stripe, index) => stripe.setFillStyle(room.normalStripeColors[index]));
  room.clockHand.setAngle(0);
  room.extraDoor.setVisible(false);
  room.mainDoor.setPosition(room.doorClosedPositions.left.x, room.doorClosedPositions.left.y);
  room.doorRight.setPosition(room.doorClosedPositions.right.x, room.doorClosedPositions.right.y);
}
