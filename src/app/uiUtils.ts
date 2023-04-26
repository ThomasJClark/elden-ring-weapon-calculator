import { allDamageTypes, Attribute, DamageType, WeaponType } from "../calculator/calculator";
import specialWeaponIcon from "./img/specialWeapon.webp";
import standardAffinityIcon from "./img/standardAffinity.webp";
import heavyAffinityIcon from "./img/heavyAffinity.webp";
import keenAffinityIcon from "./img/keenAffinity.webp";
import qualityAffinityIcon from "./img/qualityAffinity.webp";
import magicAffinityIcon from "./img/magicAffinity.webp";
import coldAffinityIcon from "./img/coldAffinity.webp";
import fireAffinityIcon from "./img/fireAffinity.webp";
import lightningAffinityIcon from "./img/lightningAffinity.webp";
import sacredAffinityIcon from "./img/sacredAffinity.webp";
import poisonAffinityIcon from "./img/poisonAffinity.webp";
import bloodAffinityIcon from "./img/bloodAffinity.webp";
import occultAffinityIcon from "./img/occultAffinity.webp";
import scarletRotStatusIcon from "./img/scarletRotStatus.webp";
import madnessStatusIcon from "./img/madnessStatus.webp";
import sleepStatusIcon from "./img/sleepStatus.webp";
import frostStatusIcon from "./img/frostStatus.webp";
import poisonStatusIcon from "./img/poisonStatus.webp";
import bleedStatusIcon from "./img/bleedStatus.webp";
import deathBlightStatusIcon from "./img/deathBlightStatus.webp";

export interface AffinityOption {
  text: string;
  icon?: string;
}

export const affinityOptions = new Map<number, AffinityOption>([
  [0, { text: "Standard", icon: standardAffinityIcon }],
  [1, { text: "Heavy", icon: heavyAffinityIcon }],
  [2, { text: "Keen", icon: keenAffinityIcon }],
  [3, { text: "Quality", icon: qualityAffinityIcon }],
  [8, { text: "Magic", icon: magicAffinityIcon }],
  [4, { text: "Fire", icon: fireAffinityIcon }],
  [5, { text: "Flame Art", icon: fireAffinityIcon }],
  [6, { text: "Lightning", icon: lightningAffinityIcon }],
  [7, { text: "Sacred", icon: sacredAffinityIcon }],
  [9, { text: "Cold", icon: coldAffinityIcon }],
  [10, { text: "Poison", icon: poisonAffinityIcon }],
  [11, { text: "Blood", icon: bloodAffinityIcon }],
  [12, { text: "Occult", icon: occultAffinityIcon }],
  [-1, { text: "Unique", icon: specialWeaponIcon }], // Special fake affinity ID for uninfusable weapons
]);

/**
 * Affinity names from the Elden Ring Reforged Mod. Note that ERR doesn't have affinity icons
 *
 * @see https://err.fandom.com/wiki/Affinities
 */
export const reforgedAffinityOptions = new Map<number, AffinityOption>([
  [0, { text: "Standard" }],
  [1, { text: "Heavy" }],
  [2, { text: "Keen" }],
  [3, { text: "Quality" }],
  [8, { text: "Magic" }],
  [16, { text: "Magma" }],
  [5, { text: "Fell" }],
  [13, { text: "Bolt" }],
  [7, { text: "Sacred" }],
  [19, { text: "Night" }],
  [4, { text: "Fire" }],
  [6, { text: "Lightning" }],
  [21, { text: "Blessed" }],
  [10, { text: "Poison" }],
  [11, { text: "Blood" }],
  [12, { text: "Occult" }],
  [22, { text: "Bestial" }],
  [20, { text: "Gravitational" }],
  [17, { text: "Rotten" }],
  [18, { text: "Cursed" }],
  [9, { text: "Cold" }],
  [14, { text: "Soporific" }],
  [15, { text: "Frenzied" }],
  [-1, { text: "Unique" }], // Special fake affinity ID for uninfusable weapons
]);

/**
 * Might as well hide these by default. If you really need to know which small shield has the
 * highest AR... good luck.
 */
export const rangedWeaponTypes = [
  WeaponType.LIGHT_BOW,
  WeaponType.BOW,
  WeaponType.GREATBOW,
  WeaponType.CROSSBOW,
  WeaponType.BALLISTA,
];

export const miscWeaponTypes = [
  WeaponType.TORCH,
  WeaponType.SMALL_SHIELD,
  WeaponType.MEDIUM_SHIELD,
  WeaponType.GREATSHIELD,
  WeaponType.GLINTSTONE_STAFF,
  WeaponType.SACRED_SEAL,
];

export const meleeWeaponTypes = [
  WeaponType.AXE,
  WeaponType.CLAW,
  WeaponType.COLOSSAL_SWORD,
  WeaponType.COLOSSAL_WEAPON,
  WeaponType.CURVED_GREATSWORD,
  WeaponType.CURVED_SWORD,
  WeaponType.DAGGER,
  WeaponType.FIST,
  WeaponType.FLAIL,
  WeaponType.GREATAXE,
  WeaponType.GREAT_HAMMER,
  WeaponType.GREAT_SPEAR,
  WeaponType.GREATSWORD,
  WeaponType.HALBERD,
  WeaponType.HAMMER,
  WeaponType.HEAVY_THRUSTING_SWORD,
  WeaponType.KATANA,
  WeaponType.REAPER,
  WeaponType.SPEAR,
  WeaponType.STRAIGHT_SWORD,
  WeaponType.THRUSTING_SWORD,
  WeaponType.TWINBLADE,
  WeaponType.WHIP,
];

export const hiddenWeaponTypes = [WeaponType.UNIVERSAL_CATALYST];

export const allWeaponTypes = [
  ...meleeWeaponTypes,
  ...rangedWeaponTypes,
  ...miscWeaponTypes,
  ...hiddenWeaponTypes,
];

export const weaponTypeLabels = new Map([
  [WeaponType.DAGGER, "Dagger"],
  [WeaponType.STRAIGHT_SWORD, "Straight Sword"],
  [WeaponType.GREATSWORD, "Greatsword"],
  [WeaponType.COLOSSAL_SWORD, "Colossal Sword"],
  [WeaponType.CURVED_SWORD, "Curved Sword"],
  [WeaponType.CURVED_GREATSWORD, "Curved Greatsword"],
  [WeaponType.KATANA, "Katana"],
  [WeaponType.TWINBLADE, "Twinblade"],
  [WeaponType.THRUSTING_SWORD, "Thrusting Sword"],
  [WeaponType.HEAVY_THRUSTING_SWORD, "Heavy Thrusting Sword"],
  [WeaponType.AXE, "Axe"],
  [WeaponType.GREATAXE, "Greataxe"],
  [WeaponType.HAMMER, "Hammer"],
  [WeaponType.GREAT_HAMMER, "Great Hammer"],
  [WeaponType.FLAIL, "Flail"],
  [WeaponType.SPEAR, "Spear"],
  [WeaponType.GREAT_SPEAR, "Great Spear"],
  [WeaponType.HALBERD, "Halberd"],
  [WeaponType.REAPER, "Reaper"],
  [WeaponType.FIST, "Fist"],
  [WeaponType.CLAW, "Claw"],
  [WeaponType.WHIP, "Whip"],
  [WeaponType.COLOSSAL_WEAPON, "Colossal Weapon"],
  [WeaponType.LIGHT_BOW, "Light Bow"],
  [WeaponType.BOW, "Bow"],
  [WeaponType.GREATBOW, "Greatbow"],
  [WeaponType.CROSSBOW, "Crossbow"],
  [WeaponType.BALLISTA, "Ballista"],
  [WeaponType.GLINTSTONE_STAFF, "Glintstone Staff"],
  [WeaponType.UNIVERSAL_CATALYST, "Hybrid Glintstone Staff / Sacred Seal"],
  [WeaponType.SACRED_SEAL, "Sacred Seal"],
  [WeaponType.SMALL_SHIELD, "Small Shield"],
  [WeaponType.MEDIUM_SHIELD, "Medium Shield"],
  [WeaponType.GREATSHIELD, "Greatshield"],
  [WeaponType.TORCH, "Torch"],
]);

export const damageTypeLabels = new Map([
  [DamageType.PHYSICAL, "Physical Attack"],
  [DamageType.MAGIC, "Magic Attack"],
  [DamageType.FIRE, "Fire Attack"],
  [DamageType.LIGHTNING, "Lightning Attack"],
  [DamageType.HOLY, "Holy Attack"],
  [DamageType.SCARLET_ROT, "Scarlet Rot Buildup"],
  [DamageType.MADNESS, "Madness Buildup"],
  [DamageType.SLEEP, "Sleep Buildup"],
  [DamageType.FROST, "Frost Buildup"],
  [DamageType.POISON, "Poison Buildup"],
  [DamageType.BLEED, "Bleed Buildup"],
  [DamageType.DEATH_BLIGHT, "Death Blight Buildup"],
]);

export const damageTypeIcons = new Map([
  [DamageType.PHYSICAL, standardAffinityIcon],
  [DamageType.MAGIC, magicAffinityIcon],
  [DamageType.FIRE, fireAffinityIcon],
  [DamageType.LIGHTNING, lightningAffinityIcon],
  [DamageType.HOLY, sacredAffinityIcon],
  [DamageType.SCARLET_ROT, scarletRotStatusIcon],
  [DamageType.MADNESS, madnessStatusIcon],
  [DamageType.SLEEP, sleepStatusIcon],
  [DamageType.FROST, frostStatusIcon],
  [DamageType.POISON, poisonStatusIcon],
  [DamageType.BLEED, bleedStatusIcon],
  [DamageType.DEATH_BLIGHT, deathBlightStatusIcon],
]);

export function getAttributeLabel(attribute: Attribute) {
  switch (attribute) {
    case "str":
      return "Strength";
    case "dex":
      return "Dexterity";
    case "int":
      return "Intelligence";
    case "fai":
      return "Faith";
    case "arc":
      return "Arcane";
  }
}

export function getShortAttributeLabel(attribute: Attribute) {
  switch (attribute) {
    case "str":
      return "Str";
    case "dex":
      return "Dex";
    case "int":
      return "Int";
    case "fai":
      return "Fai";
    case "arc":
      return "Arc";
  }
}

export function getTotalAttackPower(attackPower: Partial<Record<DamageType, number>>) {
  return allDamageTypes.reduce(
    (totalAttackPower, damageType) => totalAttackPower + (attackPower[damageType] ?? 0),
    0,
  );
}

export const maxRegularUpgradeLevel = 25;
export const maxSpecialUpgradeLevel = 10;

/**
 * @param regularUpgradeLevel the upgrade level of a regular weapon
 * @returns the corresponding upgrade level for a somber weapon
 */
export function toSpecialUpgradeLevel(regularUpgradeLevel: number) {
  // For in between levels with no exact equivalent, round down. I think this is what you would
  // look for in practice, e.g. if you pick +24 you probably want +9 sombers because you're not
  // spending an Ancient Dragon (Somber) Smithing Stone, although it's not necessarily the same
  // matchmaking range.
  return Math.floor(
    (regularUpgradeLevel + 0.5) * (maxSpecialUpgradeLevel / maxRegularUpgradeLevel),
  );
}
