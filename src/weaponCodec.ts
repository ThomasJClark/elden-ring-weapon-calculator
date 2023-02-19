// Encode/decode weapons into a more compact JSON format than the one used in the application code.
// This saves a lot on storage (some static hosts also have file size limits). Also, even after
// gzip or brotli compression it's about a 20% smaller download.

import {
  MaxUpgradeLevel,
  Weapon,
  WeaponScalingCurve,
  allAffinities,
  allAttributes,
  allDamageTypes,
  allStatusTypes,
  allWeaponTypes,
  WeaponMetadata,
} from "./calculator/calculator";

type EncodedAttributeInfo = [
  number, // Attribute (index in allAttributes)
  number, // Requirement for this attribute
  ...number[], // Scaling for this attribute at each upgrade level
];

type EncodedDamageInfo = [
  number, // Damage type (index in allDamageTypes)
  WeaponScalingCurve, // Scaling curve for this damage type
  number[], // Attributes that this damage type scales with (indexes in allAttributes)
  ...number[], // Base attack for this damage type at each upgrade level
];

type EncodedStatusInfo = [
  number, // Status type (index in allStatusTypes)
  ...number[], // Base buildup for this status type at each upgrade level
];

export type EncodedWeapon = [
  MaxUpgradeLevel,
  number, // Weapon name without affinity or upgrade level (index in the weapon name array)
  number, // Affinity (index in allAffinities)
  number, // Weapon type (index in allWeaponTypes)
  EncodedAttributeInfo[],
  EncodedDamageInfo[],
  EncodedStatusInfo[] | undefined,
  number | undefined, // Paired (1 if this is a paired weapon, absent otherwise)
];

const accentedNames = new Map([
  ["Misericorde", "Miséricorde"],
  ["Great Epee", "Great Épée"],
]);

// Weapons that have "Bloody" in the name for the Blood affinity
const bloodyNames = new Set([
  "Bastard Sword",
  "Buckler",
  "Carian Knight's Shield",
  "Club",
  "Highland Axe",
  "Iron Roundshield",
  "Lance",
  "Large Leather Shield",
  "Longsword",
  "Red Thorn Roundshield",
  "Rickety Shield",
  "Scimitar",
  "Spear",
  "Twinblade",
]);

// Patterns that determine where in a weapon name the affinity goes
// e.g. "Flowing Curved Sword" => ["Flowing", "Curved Sword"] => "Flowing Heavy Curved Sword"
const affinityMatches = [
  /(^Weathered )(.*$)/,
  /(^Troll's Golden )(.*$)/,
  /(^Flowing )(.*$)/,
  /(^)(Gilded Greatshield$)/,
  /(^.*Gilded )(.*$)/,
  /(^Marred )(.*$)/,
  /(^Distinguished )(.*$)/,
  /(^)(Lordsworn's Shield$)/,
  /(^.*'s )(.*$)/,
  /(^)(.*$)/,
];

function getNameFromMetadata({ weaponName, affinity, upgradeLevel }: WeaponMetadata) {
  let name = weaponName;

  if (accentedNames.has(weaponName)) {
    name = accentedNames.get(weaponName)!;
  }

  if (affinity !== "Standard" && affinity !== "Special") {
    let affinityStr: string = affinity;
    if (affinity === "Blood" && bloodyNames.has(weaponName)) {
      affinityStr = "Bloody";
    }

    for (const affinityMatch of affinityMatches) {
      if (affinityMatch.test(name)) {
        name = name.replace(
          affinityMatch,
          (_, prefix, suffix) => `${prefix}${affinityStr} ${suffix}`,
        );
        break;
      }
    }
  }

  if (upgradeLevel > 0) {
    name = `${name} +${upgradeLevel}`;
  }

  return name;
}

/**
 * @param weaponGroup a list of every upgraded version of a weapon from +0 to +25/+10
 * @returns the given weapon encoded into a compact JSON object
 */
export function encodeWeapon(
  weaponGroup: Weapon[],
  indexesByWeaponName: Map<string, number>,
): EncodedWeapon {
  const { metadata, requirements, damageScalingAttributes, damageScalingCurves, paired } =
    weaponGroup[0];

  const encodedAttributeInfo: EncodedAttributeInfo[] = [];
  allAttributes.forEach((attribute, index) => {
    if (requirements[attribute] || weaponGroup[0].attributeScaling[attribute]) {
      const requirement = requirements[attribute] ?? 0;
      const scaling = weaponGroup.map((weapon) => weapon.attributeScaling[attribute] ?? 0);
      encodedAttributeInfo.push([index, requirement, ...scaling]);
    }
  });

  const encodedDamageInfo: EncodedDamageInfo[] = [];
  allDamageTypes.forEach((damageType, index) => {
    if (weaponGroup[0].attack[damageType]) {
      const curve = damageScalingCurves[damageType] ?? 0;
      const attributes =
        damageScalingAttributes[damageType]?.map((attribute) => allAttributes.indexOf(attribute)) ??
        [];
      const baseAttack = weaponGroup.map((weapon) => weapon.attack[damageType] ?? 0);
      encodedDamageInfo.push([index, curve, attributes, ...baseAttack]);
    }
  });

  const encodedStatusInfo: EncodedStatusInfo[] = [];
  allStatusTypes.forEach((statusType, index) => {
    if (weaponGroup[0].statuses[statusType]) {
      const baseBuildup = weaponGroup.map((weapon) => weapon.statuses[statusType] ?? 0);
      encodedStatusInfo.push([index, ...baseBuildup]);
    }
  });

  return [
    metadata.maxUpgradeLevel,
    indexesByWeaponName.get(metadata.weaponName)!,
    allAffinities.indexOf(metadata.affinity),
    allWeaponTypes.indexOf(metadata.weaponType),
    encodedAttributeInfo,
    encodedDamageInfo,
    encodedStatusInfo.length || paired ? encodedStatusInfo : undefined,
    paired ? 1 : undefined,
  ];
}

/**
 * @returns the given weapon decoded into a usable JavaScript object
 */
export function decodeWeapon(
  [
    maxUpgradeLevel,
    weaponNameIdx,
    affinityIdx,
    weaponTypeIdx,
    encodedAttributeInfo,
    encodedDamageInfo,
    encodedStatusInfo = [],
    paired = 0,
  ]: EncodedWeapon,
  names: readonly string[],
): Weapon[] {
  const baseMetadata: Omit<Weapon["metadata"], "upgradeLevel"> = {
    weaponName: names[weaponNameIdx],
    affinity: allAffinities[affinityIdx],
    maxUpgradeLevel,
    weaponType: allWeaponTypes[weaponTypeIdx],
  };
  const requirements: Weapon["requirements"] = {};
  const damageScalingAttributes: Weapon["damageScalingAttributes"] = {};
  const damageScalingCurves: Weapon["damageScalingCurves"] = {};

  const weapons: Weapon[] = Array.from({ length: maxUpgradeLevel + 1 }, (_, upgradeLevel) => {
    const metadata = { ...baseMetadata, upgradeLevel };
    return {
      name: getNameFromMetadata(metadata),
      metadata,
      requirements,
      attack: {},
      attributeScaling: {},
      damageScalingAttributes,
      damageScalingCurves,
      statuses: {},
      paired: !!paired,
    };
  });

  encodedDamageInfo.forEach(([damageTypeIndex, scalingCurve, attributeIndexes, ...values]) => {
    const damageType = allDamageTypes[damageTypeIndex];
    damageScalingAttributes[damageType] = attributeIndexes.map((i) => allAttributes[i]);
    damageScalingCurves[damageType] = scalingCurve;
    weapons.forEach((weapon, upgradeLevel) => {
      weapon.attack[damageType] = values[upgradeLevel];
    });
  });

  encodedAttributeInfo.forEach(([attributeIndex, requirement, ...values]) => {
    const attribute = allAttributes[attributeIndex];
    requirements[attribute] = requirement;
    weapons.forEach((weapon, upgradeLevel) => {
      weapon.attributeScaling[attribute] = values[upgradeLevel];
    });
  });

  encodedStatusInfo.forEach(([statusTypeIndex, ...values]) => {
    const statusType = allStatusTypes[statusTypeIndex];
    weapons.forEach((weapon, upgradeLevel) => {
      weapon.statuses[statusType] = values[upgradeLevel];
    });
  });

  return weapons;
}

export function decodeWeapons([names, encodedWeapons]: [readonly string[], EncodedWeapon[]]) {
  return encodedWeapons.flatMap((encodedWeapon) => decodeWeapon(encodedWeapon, names));
}
