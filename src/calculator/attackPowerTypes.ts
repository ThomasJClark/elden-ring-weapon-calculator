export const AttackPowerType = {
  PHYSICAL: 0,
  MAGIC: 1,
  FIRE: 2,
  LIGHTNING: 3,
  HOLY: 4,
  POISON: 5,
  SCARLET_ROT: 6,
  BLEED: 7,
  FROST: 8,
  SLEEP: 9,
  MADNESS: 10,
  DEATH_BLIGHT: 11,
} as const;

export type AttackPowerType = typeof AttackPowerType[keyof typeof AttackPowerType];

export const allDamageTypes: AttackPowerType[] = [
  AttackPowerType.PHYSICAL,
  AttackPowerType.MAGIC,
  AttackPowerType.FIRE,
  AttackPowerType.LIGHTNING,
  AttackPowerType.HOLY,
];

export const allStatusTypes: AttackPowerType[] = [
  AttackPowerType.POISON,
  AttackPowerType.SCARLET_ROT,
  AttackPowerType.BLEED,
  AttackPowerType.FROST,
  AttackPowerType.SLEEP,
  AttackPowerType.MADNESS,
  AttackPowerType.DEATH_BLIGHT,
];

export const allAttackPowerTypes = [...allDamageTypes, ...allStatusTypes];
