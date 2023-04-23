export const enum DamageType {
  PHYSICAL = 0,
  MAGIC = 1,
  FIRE = 2,
  LIGHTNING = 3,
  HOLY = 4,
  POISON = 5,
  SCARLET_ROT = 6,
  BLEED = 7,
  FROST = 8,
  SLEEP = 9,
  MADNESS = 10,
  DEATH_BLIGHT = 11,
}

export const allDamageTypes = [
  DamageType.PHYSICAL,
  DamageType.MAGIC,
  DamageType.FIRE,
  DamageType.LIGHTNING,
  DamageType.HOLY,
];

export const allStatusTypes = [
  DamageType.POISON,
  DamageType.SCARLET_ROT,
  DamageType.BLEED,
  DamageType.FROST,
  DamageType.SLEEP,
  DamageType.MADNESS,
  DamageType.DEATH_BLIGHT,
];
