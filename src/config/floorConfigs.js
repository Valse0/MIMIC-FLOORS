export function getFloorConfig(floorNumber) {
  if (floorNumber === 1) {
    return {
      floor: 1,
      isMimic: false,
      anomalyId: null,
      tutorialText: "Bu NORMAL koridor. Her şey düzgün. ÇIK'a bas.",
    };
  }

  if (floorNumber === 2) {
    return {
      floor: 2,
      isMimic: true,
      anomalyId: 'eyes',
      tutorialText: 'Bu MIMIC. Bir şey yanlış, fark ettin mi? KAPAT’a bas.',
    };
  }

  return {
    floor: floorNumber,
    isMimic: Math.random() < 0.2,
    anomalyId: null,
    tutorialText: '',
  };
}
