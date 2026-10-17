import { LAYOUT } from '../config/layout.js';

export function createRoom(scene) {
  const room = { tweens: [], carpetStripes: [], normalStripeColors: [] };
  const add = (object) => scene.track(object);
  const { frame, backWall, floor, carpet, light, painting, clock, mainDoor, extraDoor } = LAYOUT;

  add(scene.add.rectangle(frame.x + frame.width / 2, frame.y + frame.height / 2,
    frame.width, frame.height, 0x000000, 0).setStrokeStyle(8, 0x111820));
  add(scene.add.rectangle(backWall.x + backWall.width / 2, backWall.y + backWall.height / 2,
    backWall.width, backWall.height, 0x2a2f3a));
  add(scene.add.rectangle(floor.x + floor.width / 2, floor.y + floor.height / 2,
    floor.width, floor.height, 0x14161c));

  const glow = add(scene.add.circle(light.x, light.y, light.glowRadius, 0xffd27a, 0.18));
  room.light = add(scene.add.circle(light.x, light.y, light.radius, 0xffd27a));
  room.light.setDepth(glow.depth + 1);

  add(scene.add.rectangle(painting.x + painting.size / 2, painting.y + painting.size / 2,
    painting.size, painting.size, 0xd6aa58));
  room.painting = add(scene.add.rectangle(painting.x + painting.size / 2, painting.y + painting.size / 2,
    painting.size - 12, painting.size - 12, 0x314150));
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

  room.carpet = add(scene.add.rectangle(carpet.x + carpet.width / 2, carpet.y + carpet.height / 2,
    carpet.width, carpet.height, 0xd6aa58));
  const innerCarpet = add(scene.add.rectangle(carpet.x + carpet.width / 2, carpet.y + carpet.height / 2,
    carpet.width - 12, carpet.height - 12, 0x7c2525));
  room.carpet.setDepth(innerCarpet.depth - 1);
  [0, 1].forEach((index) => {
    const color = index % 2 ? LAYOUT.carpetStripeColors.light : LAYOUT.carpetStripeColors.dark;
    const stripe = add(scene.add.rectangle(carpet.x + carpet.width / 2,
      carpet.y + LAYOUT.carpetStripe.firstY + index * LAYOUT.carpetStripe.spacing,
      carpet.width - LAYOUT.carpetStripe.inset * 2, LAYOUT.carpetStripe.height, color));
    room.carpetStripes.push(stripe);
    room.normalStripeColors.push(color);
  });

  room.extraDoor = makeDoor(scene, extraDoor, true);
  const panelWidth = mainDoor.width / 2;
  const closedY = mainDoor.y + mainDoor.height / 2;
  room.doorClosedPositions = {
    left: { x: mainDoor.x + panelWidth / 2, y: closedY },
    right: { x: mainDoor.x + panelWidth * 1.5, y: closedY },
  };
  room.doorOpenPositions = {
    left: { x: room.doorClosedPositions.left.x - LAYOUT.doorMotion.openOffset, y: closedY },
    right: { x: room.doorClosedPositions.right.x + LAYOUT.doorMotion.openOffset, y: closedY },
  };
  add(scene.add.rectangle(mainDoor.x + mainDoor.width / 2, mainDoor.y + mainDoor.height / 2,
    mainDoor.width + 12, mainDoor.height + 12, 0xb88a57));
  room.mainDoor = add(scene.add.rectangle(room.doorClosedPositions.left.x, closedY,
    panelWidth, mainDoor.height, 0x5a3a22));
  room.doorRight = add(scene.add.rectangle(room.doorClosedPositions.right.x, closedY,
    panelWidth, mainDoor.height, 0x5a3a22));
  add(scene.add.circle(mainDoor.x + mainDoor.width / 2 - 12, closedY, 5, 0xffd27a));
  return room;
}

function makeDoor(scene, bounds, hidden) {
  const container = scene.add.container(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  container.add([
    scene.add.rectangle(0, 0, bounds.width, bounds.height, 0xb88a57),
    scene.add.rectangle(0, 0, bounds.width - 12, bounds.height - 12, 0x5a3a22),
    scene.add.circle(bounds.width / 2 - 14, 0, 5, 0xffd27a),
  ]);
  container.setVisible(!hidden);
  return scene.track(container);
}
