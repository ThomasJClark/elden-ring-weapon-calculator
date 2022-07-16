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
} from "./calculator/calculator";

export type EncodedWeapon = [
  string, // name
  number, // weight
  number, // upgrade level
  MaxUpgradeLevel,
  string, // weapon name
  number, // affinity
  number, // weapon type
  number[], // requirement for each attribute
  number[], // base attack for each damage type
  number[], // scaling for each attribute
  number[][], // scaling attributes for each damage type
  (WeaponScalingCurve | -1)[], // scaling curve for each damage type
  number[] | undefined, // base buildup for each status type
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

/**
 * @returns the given weapon encoded into a compact JSON object
 */
export function encodeWeapon({
  name,
  metadata: { weight, upgradeLevel, maxUpgradeLevel, weaponName, affinity, weaponType },
  requirements,
  attack,
  attributeScaling,
  damageScalingAttributes,
  damageScalingCurves,
  statuses,
}: Weapon): EncodedWeapon {
  const encodedStatuses = encodeMap(statuses, allStatusTypes, 0, identity);
  return [
    name,
    weight,
    upgradeLevel,
    maxUpgradeLevel,
    weaponName,
    allAffinities.indexOf(affinity),
    allWeaponTypes.indexOf(weaponType),
    encodeMap(requirements, allAttributes, 0, identity),
    encodeMap(attack, allDamageTypes, 0, identity),
    encodeMap(attributeScaling, allAttributes, 0, identity),
    encodeMap(damageScalingAttributes, allDamageTypes, [], (values) =>
      values.map((value) => allAttributes.indexOf(value)),
    ),
    encodeMap(damageScalingCurves, allDamageTypes, -1, identity),
    encodedStatuses.length !== 0 ? encodedStatuses : undefined,
  ];
}

/**
 * @returns the given weapon decoded into a usable JavaScript object
 */
export function decodeWeapon([
  name,
  weight,
  upgradeLevel,
  maxUpgradeLevel,
  weaponName,
  affinityIdx,
  weaponTypeIdx,
  requirements,
  attack,
  attributeScalling,
  damageScalingAttributes,
  damageScalingCurves,
  statuses = [],
]: EncodedWeapon): Weapon {
  return {
    name,
    metadata: {
      weaponName,
      affinity: allAffinities[affinityIdx],
      maxUpgradeLevel,
      weight,
      weaponType: allWeaponTypes[weaponTypeIdx],
      upgradeLevel,
    },
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
  };
}
