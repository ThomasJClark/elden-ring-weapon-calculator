import { Weapon } from "./weapon";

export const allDamageTypes = ["physical", "magic", "fire", "lightning", "holy"] as const;

export const allStatusTypes = [
  "Poison",
  "Scarlet Rot",
  "Bleed",
  "Frost",
  "Sleep",
  "Madness",
] as const;

export const allAttributes = ["str", "dex", "int", "fai", "arc"] as const;

export const allAffinities = [
  "Standard",
  "Heavy",
  "Keen",
  "Quality",
  "Magic",
  "Fire",
  "Flame Art",
  "Lightning",
  "Sacred",
  "Cold",
  "Poison",
  "Blood",
  "Occult",
  "Special",
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

export const maxUnupgradeableUpgradeLevel = 0 as const;
export const maxRegularUpgradeLevel = 25 as const;
export const maxSpecialUpgradeLevel = 10 as const;

export type DamageType = typeof allDamageTypes[number];
export type StatusType = typeof allStatusTypes[number];
export type Attribute = typeof allAttributes[number];
export type Attributes = Record<Attribute, number>;
export type Affinity = typeof allAffinities[number];
export type WeaponType = typeof allWeaponTypes[number];
export type MaxUpgradeLevel =
  | typeof maxUnupgradeableUpgradeLevel
  | typeof maxSpecialUpgradeLevel
  | typeof maxRegularUpgradeLevel;

/**
 * Adjust a set of character attributes to take into account the 50% Strength bonus when two
 * handing a weapon
 */
export function adjustAttributesForTwoHanding({
  twoHanding = false,
  weapon,
  attributes,
}: {
  twoHanding?: boolean;
  weapon: Weapon;
  attributes: Attributes;
}): Attributes {
  let twoHandingBonus = twoHanding;

  // Paired weapons do not get the two handing bonus
  if (weapon.paired) {
    twoHandingBonus = false;
  }

  // Bows and ballistae can only be two handed
  if (
    weapon.metadata.weaponType === "Light Bow" ||
    weapon.metadata.weaponType === "Bow" ||
    weapon.metadata.weaponType === "Greatbow" ||
    weapon.metadata.weaponType === "Ballista"
  ) {
    twoHandingBonus = true;
  }

  if (twoHandingBonus) {
    return {
      ...attributes,
      str: Math.floor(attributes.str * 1.5),
    };
  }

  return attributes;
}
