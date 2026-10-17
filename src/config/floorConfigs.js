export const MIMIC_CHANCE = 0.35;

export function getFloorConfig(floorNumber) {
  if (floorNumber === 1) {
    return {
      floor: 1,
      isMimic: false,
      anomalyId: null,
      tutorialText: "Bu koridor NORMAL. Dikkatle bak, sonra NORMAL'e bas.",
      timeLimitMs: 0,
    };
  }
  if (floorNumber === 2) {
    return {
      floor: 2,
      isMimic: true,
      anomalyId: 'figure',
      tutorialText: "Bir şey var. Koridorun sonuna bak. ANOMALİ'ye bas.",
      timeLimitMs: 0,
    };
  }
  return {
    floor: floorNumber,
    isMimic: Math.random() < MIMIC_CHANCE,
    anomalyId: null,
    tutorialText: '',
    timeLimitMs: 7000,
  };
}
