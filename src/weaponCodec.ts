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

export type EncodedWeapon = [
  number, // upgrade level
  MaxUpgradeLevel,
  number, // weapon name
  number, // affinity
  number, // weapon type
  number[], // requirement for each attribute
  number[], // base attack for each damage type
  number[], // scaling for each attribute
  number[][], // scaling attributes for each damage type
  (WeaponScalingCurve | -1)[], // scaling curve for each damage type
  number[] | undefined, // base buildup for each status type
  number | undefined, // paired
];

function encodeMap<Key extends string, Value, Encoded>(
  obj: Readonly<Partial<Record<Key, Value>>>,
  allKeys: ReadonlyArray<Key>,
  defaultValue: Value,
  encodeValue: (value: Value) => Encoded,
): Encoded[] {
  const arr = allKeys.map((key) => obj[key] ?? defaultValue);
  while (arr.length && arr[arr.length - 1] === defaultValue) {
    arr.pop();
  }
  return arr.map(encodeValue);
}

function decodeMap<Key extends string, Value, Encoded>(
  arr: ReadonlyArray<Encoded>,
  allKeys: ReadonlyArray<Key>,
  isDefaultValue: (encoded: Encoded) => boolean,
  decodeValue: (encoded: Encoded) => Value,
): Partial<Record<Key, Value>> {
  const obj: Partial<Record<Key, Value>> = {};
  arr.forEach((encoded, idx) => {
    if (!isDefaultValue(encoded)) {
      obj[allKeys[idx]] = decodeValue(encoded);
    }
  });
  return obj;
}

function equals<V>(defaultValue: V) {
  return (value: V) => value === defaultValue;
}

function identity<V>(value: V) {
  return value;
}

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
 * @returns the given weapon encoded into a compact JSON object
 */
export function encodeWeapon(
  {
    name,
    metadata: { upgradeLevel, maxUpgradeLevel, weaponName, affinity, weaponType },
    requirements,
    attack,
    attributeScaling,
    damageScalingAttributes,
    damageScalingCurves,
    statuses,
    paired,
  }: Weapon,
  indexesByWeaponName: Map<string, number>,
): EncodedWeapon {
  const encodedStatuses = encodeMap(statuses, allStatusTypes, 0, identity);
  return [
    upgradeLevel,
    maxUpgradeLevel,
    indexesByWeaponName.get(weaponName)!,
    allAffinities.indexOf(affinity),
    allWeaponTypes.indexOf(weaponType),
    encodeMap(requirements, allAttributes, 0, identity),
    encodeMap(attack, allDamageTypes, 0, identity),
    encodeMap(attributeScaling, allAttributes, 0, identity),
    encodeMap(damageScalingAttributes, allDamageTypes, [], (values) =>
      values.map((value) => allAttributes.indexOf(value)),
    ),
    encodeMap(damageScalingCurves, allDamageTypes, -1, identity),
    encodedStatuses.length !== 0 || paired ? encodedStatuses : undefined,
    paired ? 1 : undefined,
  ];
}

/**
 * @returns the given weapon decoded into a usable JavaScript object
 */
export function decodeWeapon(
  [
    upgradeLevel,
    maxUpgradeLevel,
    weaponNameIdx,
    affinityIdx,
    weaponTypeIdx,
    requirements,
    attack,
    attributeScalling,
    damageScalingAttributes,
    damageScalingCurves,
    statuses = [],
    paired = 0,
  ]: EncodedWeapon,
  names: readonly string[],
): Weapon {
  const metadata = {
    weaponName: names[weaponNameIdx],
    affinity: allAffinities[affinityIdx],
    maxUpgradeLevel,
    weaponType: allWeaponTypes[weaponTypeIdx],
    upgradeLevel,
  };

  return {
    name: getNameFromMetadata(metadata),
    metadata,
    requirements: decodeMap(requirements, allAttributes, equals(0), identity),
    attack: decodeMap(attack, allDamageTypes, equals(0), identity),
    attributeScaling: decodeMap(attributeScalling, allAttributes, equals(0), identity),
    damageScalingAttributes: decodeMap(
      damageScalingAttributes,
      allDamageTypes,
      (attributesArr) => attributesArr.length === 0,
      (attributesArr) => attributesArr.map((idx) => allAttributes[idx]),
    ),
    damageScalingCurves: decodeMap(
      damageScalingCurves,
      allDamageTypes,
      equals(-1),
      (scalingCurve) => scalingCurve as WeaponScalingCurve,
    ),
    statuses: decodeMap(statuses, allStatusTypes, equals(0), identity),
    paired: !!paired,
  };
}

export function decodeWeapons([names, encodedWeapons]: [readonly string[], EncodedWeapon[]]) {
  return encodedWeapons.map((encodedWeapon) => decodeWeapon(encodedWeapon, names));
}
