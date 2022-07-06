export const allDamageTypes = ["physical", "magic", "fire", "lightning", "holy"] as const;

export const allPassiveTypes = [
  "Scarlet Rot",
  "Madness",
  "Sleep",
  "Frost",
  "Poison",
  "Bleed",
] as const;

export const allAttributes = ["str", "dex", "int", "fai", "arc"] as const;

export const allAffinities = [
  "None",
  "Heavy",
  "Keen",
  "Quality",
  "Magic",
  "Cold",
  "Fire",
  "Flame Art",
  "Lightning",
  "Sacred",
  "Poison",
  "Blood",
  "Occult",
] as const;

export const allWeaponTypes = [
  "Axe",
  "Ballista",
  "Bow",
  "Claw",
  "Colossal Sword",
  "Colossal Weapon",
  "Crossbow",
  "Curved Greatsword",
  "Curved Sword",
  "Dagger",
  "Fist",
  "Flail",
  "Glintstone Staff",
  "Greataxe",
  "Greatbow",
  "Great Hammer",
  "Greatshield",
  "Great Spear",
  "Greatsword",
  "Halberd",
  "Hammer",
  "Heavy Thrusting Sword",
  "Katana",
  "Light Bow",
  "Medium Shield",
  "Reaper",
  "Sacred Seal",
  "Small Shield",
  "Spear",
  "Straight Sword",
  "Thrusting Sword",
  "Torch",
  "Twinblade",
  "Whip",
] as const;

export const maxRegularUpgradeLevel = 25 as const;

export const maxSpecialUpgradeLevel = 10 as const;

export type DamageType = typeof allDamageTypes[number];
export type PassiveType = typeof allPassiveTypes[number];
export type Attribute = typeof allAttributes[number];
export type Attributes = Record<Attribute, number>;
export type Affinity = typeof allAffinities[number];
export type WeaponType = typeof allWeaponTypes[number];
export type MaxUpgradeLevel = typeof maxSpecialUpgradeLevel | typeof maxRegularUpgradeLevel;

/**
 * Adjust a set of character attributes to take into account the 50% Strength bonus when two
 * handing a weapon
 */
export function adjustAttributesForTwoHanding({ str, ...attributes }: Attributes) {
  return {
    str: Math.floor(str * 1.5),
    ...attributes,
  };
}
