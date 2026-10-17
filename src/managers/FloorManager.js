import { getFloorConfig } from '../config/floorConfigs.js';

export class FloorManager {
  constructor() {
    this.currentFloor = 1;
    this.currentConfig = getFloorConfig(this.currentFloor);
  }

  advance() {
    this.currentFloor += 1;
    this.currentConfig = getFloorConfig(this.currentFloor);
    return this.currentConfig;
  }
}
