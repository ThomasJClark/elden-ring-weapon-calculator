import {
  allDamageTypes,
  AttackPowerType,
  WeaponType,
  type Attribute,
} from "../calculator/calculator";
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
import errBestialAffinityIcon from "./img/errBestialAffinity.webp";
import errBlessedAffinityIcon from "./img/errBlessedAffinity.webp";
import errBoltAffinityIcon from "./img/errBoltAffinity.webp";
import errCursedAffinityIcon from "./img/errCursedAffinity.webp";
import errFatedAffinityIcon from "./img/errFatedAffinity.webp";
import errFellAffinityIcon from "./img/errFellAffinity.webp";
import errFrenziedAffinityIcon from "./img/errFrenziedAffinity.webp";
import errGravitationalAffinityIcon from "./img/errGravitationalAffinity.webp";
import errMagicAffinityIcon from "./img/errMagicAffinity.webp";
import errMagmaAffinityIcon from "./img/errMagmaAffinity.webp";
import errNightAffinityIcon from "./img/errNightAffinity.webp";
import errOccultAffinityIcon from "./img/errOccultAffinity.webp";
import errRottenAffinityIcon from "./img/errRottenAffinity.webp";
import errSacredAffinityIcon from "./img/errSacredAffinity.webp";
import errSoporificAffinityIcon from "./img/errSoporificAffinity.webp";
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
  [-1, { text: "Unique", icon: specialWeaponIcon }], // Special fake affinity ID for uninfusable weapon s
]);

/**
 * Affinity names from the Elden Ring Reforged Mod
 *
 * @see https://err.fandom.com/wiki/Affinities
 */
export const reforgedAffinityOptions = new Map<number, AffinityOption>([
  [0, { text: "Standard", icon: standardAffinityIcon }],
  [1, { text: "Heavy", icon: heavyAffinityIcon }],
  [2, { text: "Keen", icon: keenAffinityIcon }],
  [3, { text: "Quality", icon: qualityAffinityIcon }],
  [8, { text: "Magic", icon: errMagicAffinityIcon }],
  [16, { text: "Magma", icon: errMagmaAffinityIcon }],
  [5, { text: "Fell", icon: errFellAffinityIcon }],
  [13, { text: "Bolt", icon: errBoltAffinityIcon }],
  [7, { text: "Sacred", icon: errSacredAffinityIcon }],
  [19, { text: "Night", icon: errNightAffinityIcon }],
  [4, { text: "Fire", icon: fireAffinityIcon }],
  [6, { text: "Lightning", icon: lightningAffinityIcon }],
  [21, { text: "Blessed", icon: errBlessedAffinityIcon }],
  [10, { text: "Poison", icon: poisonAffinityIcon }],
  [11, { text: "Blood", icon: bloodAffinityIcon }],
  [12, { text: "Occult", icon: errOccultAffinityIcon }],
  [22, { text: "Bestial", icon: errBestialAffinityIcon }],
  [20, { text: "Gravitational", icon: errGravitationalAffinityIcon }],
  [17, { text: "Rotten", icon: errRottenAffinityIcon }],
  [18, { text: "Cursed", icon: errCursedAffinityIcon }],
  [9, { text: "Cold", icon: coldAffinityIcon }],
  [14, { text: "Soporific", icon: errSoporificAffinityIcon }],
  [15, { text: "Frenzied", icon: errFrenziedAffinityIcon }],
  [23, { text: "Fated", icon: errFatedAffinityIcon }],
  [-1, { text: "Unique", icon: specialWeaponIcon }], // Special fake affinity ID for uninfusable weapons
]);

/**
 * Affinity names from The Convergence mod
 */
export const convergenceAffinityOptions = new Map<number, AffinityOption>([
  [0, { text: "Standard" }],
  [1, { text: "Heavy" }],
  [2, { text: "Keen" }],
  [3, { text: "Quality" }],
  [4, { text: "Glint" }],
  [5, { text: "Dragonkin" }],
  [6, { text: "Gravity" }],
  [7, { text: "Flame" }],
  [8, { text: "Golden" }],
  [9, { text: "Draconic" }],
  [10, { text: "Bestial" }],
  [11, { text: "Night" }],
  [12, { text: "Lava" }],
  [13, { text: "Frenzy" }],
  [14, { text: "Death" }],
  [15, { text: "Godslayer" }],
  [16, { text: "Frost" }],
  [17, { text: "Aberrant" }],
  [18, { text: "Bloodflame" }],
  [19, { text: "Rotten" }],
  [20, { text: "Storm" }],
  [21, { text: "Mystic" }],
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

export const catalystTypes = [WeaponType.GLINTSTONE_STAFF, WeaponType.SACRED_SEAL];

export const shieldTypes = [
  WeaponType.SMALL_SHIELD,
  WeaponType.MEDIUM_SHIELD,
  WeaponType.GREATSHIELD,
  WeaponType.THRUSTING_SHIELD,
];

export const meleeWeaponTypes = [
  WeaponType.AXE,
  WeaponType.BACKHAND_BLADE,
  WeaponType.BEAST_CLAW,
  WeaponType.CLAW,
  WeaponType.COLOSSAL_SWORD,
  WeaponType.COLOSSAL_WEAPON,
  WeaponType.CURVED_GREATSWORD,
  WeaponType.CURVED_SWORD,
  WeaponType.DAGGER,
  WeaponType.FIST,
  WeaponType.FLAIL,
  WeaponType.GREAT_HAMMER,
  WeaponType.GREAT_KATANA,
  WeaponType.GREAT_SPEAR,
  WeaponType.GREATAXE,
  WeaponType.GREATSWORD,
  WeaponType.HALBERD,
  WeaponType.HAMMER,
  WeaponType.HAND_TO_HAND,
  WeaponType.HEAVY_THRUSTING_SWORD,
  WeaponType.KATANA,
  WeaponType.LIGHT_GREATSWORD,
  WeaponType.PERFUME_BOTTLE,
  WeaponType.REAPER,
  WeaponType.SPEAR,
  WeaponType.STRAIGHT_SWORD,
  WeaponType.THROWING_BLADE,
  WeaponType.THRUSTING_SWORD,
  WeaponType.TORCH,
  WeaponType.TWINBLADE,
  WeaponType.WHIP,
];

export const dlcWeaponTypes = [
  WeaponType.HAND_TO_HAND,
  WeaponType.PERFUME_BOTTLE,
  WeaponType.THRUSTING_SHIELD,
  WeaponType.THROWING_BLADE,
  WeaponType.BACKHAND_BLADE,
  WeaponType.LIGHT_GREATSWORD,
  WeaponType.GREAT_KATANA,
  WeaponType.BEAST_CLAW,
];

export const hiddenWeaponTypes = [WeaponType.DUAL_CATALYST];

export const allWeaponTypes = [
  ...meleeWeaponTypes,
  ...rangedWeaponTypes,
  ...catalystTypes,
  ...shieldTypes,
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
  [WeaponType.DUAL_CATALYST, "Dual Catalyst"],
  [WeaponType.SACRED_SEAL, "Sacred Seal"],
  [WeaponType.SMALL_SHIELD, "Small Shield"],
  [WeaponType.MEDIUM_SHIELD, "Medium Shield"],
  [WeaponType.GREATSHIELD, "Greatshield"],
  [WeaponType.TORCH, "Torch"],
  [WeaponType.HAND_TO_HAND, "Hand-to-Hand"],
  [WeaponType.PERFUME_BOTTLE, "Perfume Bottle"],
  [WeaponType.THRUSTING_SHIELD, "Thrusting Shield"],
  [WeaponType.THROWING_BLADE, "Throwing Blade"],
  [WeaponType.BACKHAND_BLADE, "Backhand Blade"],
  [WeaponType.LIGHT_GREATSWORD, "Light Greatsword"],
  [WeaponType.GREAT_KATANA, "Great Katana"],
  [WeaponType.BEAST_CLAW, "Beast Claw"],
]);

export const damageTypeLabels = new Map([
  [AttackPowerType.PHYSICAL, "Physical Attack"],
  [AttackPowerType.MAGIC, "Magic Attack"],
  [AttackPowerType.FIRE, "Fire Attack"],
  [AttackPowerType.LIGHTNING, "Lightning Attack"],
  [AttackPowerType.HOLY, "Holy Attack"],
  [AttackPowerType.SCARLET_ROT, "Scarlet Rot Buildup"],
  [AttackPowerType.MADNESS, "Madness Buildup"],
  [AttackPowerType.SLEEP, "Sleep Buildup"],
  [AttackPowerType.FROST, "Frost Buildup"],
  [AttackPowerType.POISON, "Poison Buildup"],
  [AttackPowerType.BLEED, "Bleed Buildup"],
  [AttackPowerType.DEATH_BLIGHT, "Death Blight Buildup"],
]);

export const damageTypeIcons = new Map([
  [AttackPowerType.PHYSICAL, standardAffinityIcon],
  [AttackPowerType.MAGIC, magicAffinityIcon],
  [AttackPowerType.FIRE, fireAffinityIcon],
  [AttackPowerType.LIGHTNING, lightningAffinityIcon],
  [AttackPowerType.HOLY, sacredAffinityIcon],
  [AttackPowerType.SCARLET_ROT, scarletRotStatusIcon],
  [AttackPowerType.MADNESS, madnessStatusIcon],
  [AttackPowerType.SLEEP, sleepStatusIcon],
  [AttackPowerType.FROST, frostStatusIcon],
  [AttackPowerType.POISON, poisonStatusIcon],
  [AttackPowerType.BLEED, bleedStatusIcon],
  [AttackPowerType.DEATH_BLIGHT, deathBlightStatusIcon],
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

export function getTotalDamageAttackPower(attackPower: Partial<Record<AttackPowerType, number>>) {
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

/**
 * @param regularUpgradeLevel the upgrade level of a somber weapon
 * @returns the corresponding upgrade level for a regular weapon
 */
export function toRegularUpgradeLevel(specialUpgradeLevel: number) {
  return Math.floor(specialUpgradeLevel * 2.5);
}
