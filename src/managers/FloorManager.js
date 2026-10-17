import { getFloorConfig } from '../config/floorConfigs.js';

export class FloorManager {
  constructor(startFloor = 1) {
    this.currentFloor = startFloor;
    this.currentConfig = getFloorConfig(this.currentFloor);
  }

  advance() {
    this.currentFloor += 1;
    this.currentConfig = getFloorConfig(this.currentFloor);
    return this.currentConfig;
  }
}
