import { LAYOUT } from '../config/layout.js';

export function createRoom(scene) {
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
  room.mainDoor = add(scene.add.rectangle(room.doorClosedPositions.left.x, closedY,
    panelWidth, mainDoor.height, 0x81512e));
  room.doorRight = add(scene.add.rectangle(room.doorClosedPositions.right.x, closedY,
    panelWidth, mainDoor.height, 0x81512e));
  add(scene.add.rectangle(frame.x + frame.width / 2, frame.y + frame.height / 2,
    frame.width, frame.height, 0x111111, 0).setStrokeStyle(14, 0x202020));
  add(scene.add.rectangle(corridor.left, LAYOUT.corridorSides.y,
    LAYOUT.corridorSides.width, LAYOUT.corridorSides.height, 0x202020));
  add(scene.add.rectangle(corridor.right, LAYOUT.corridorSides.y,
    LAYOUT.corridorSides.width, LAYOUT.corridorSides.height, 0x202020));
  return room;
}
