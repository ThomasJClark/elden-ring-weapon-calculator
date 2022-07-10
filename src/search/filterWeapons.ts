import {
  Affinity,
  Attribute,
  Attributes,
  maxRegularUpgradeLevel,
  maxSpecialUpgradeLevel,
  Weapon,
  WeaponType,
} from "../calculator/calculator";

export interface FilterWeaponsOptions {
  /**
   * The weapon regular upgrade level. For special weapons, this is converted to the equivalent
   * upgrade level for matchmaking purposes, or the closest level if there is no equivalent.
   */
  upgradeLevel: number;

  /**
   * Only include these types of weapons
   */
  weaponTypes: readonly WeaponType[];

  /**
   * Only include weapons infused with one of these affinities
   */
  affinities: readonly Affinity[];

  /**
   * Only include weapons up to this weight
   */
  maxWeight: number;

  /**
   * Only include weapons that are effective with the given player attribute values
   */
  effectiveWithAttributes?: Attributes;
}

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

export default function filterWeapons(
  weapons: IterableIterator<Weapon>,
  {
    upgradeLevel,
    weaponTypes,
    affinities,
    maxWeight,
    effectiveWithAttributes,
  }: FilterWeaponsOptions,
): Weapon[] {
  const specialUpgradeLevel = toSpecialUpgradeLevel(upgradeLevel);

  function filterWeapon(weapon: Weapon): boolean {
    if (
      weapon.metadata.maxUpgradeLevel === maxRegularUpgradeLevel &&
      weapon.metadata.upgradeLevel !== upgradeLevel
    ) {
      return false;
    }

    if (
      weapon.metadata.maxUpgradeLevel === maxSpecialUpgradeLevel &&
      weapon.metadata.upgradeLevel !== specialUpgradeLevel
    ) {
      return false;
    }

    if (weaponTypes.length > 0 && !weaponTypes.includes(weapon.metadata.weaponType)) {
      return false;
    }

    if (affinities.length > 0 && !affinities.includes(weapon.metadata.affinity)) {
      return false;
    }

    if (weapon.metadata.weight > maxWeight) {
      return false;
    }

    if (
      effectiveWithAttributes != null &&
      (Object.entries(weapon.requirements) as [Attribute, number][]).some(
        ([attribute, requirement]) => effectiveWithAttributes[attribute] < requirement,
      )
    ) {
      return false;
    }

    return true;
  }

  const filteredWeapons: Weapon[] = [];
  for (const weapon of weapons) {
    if (filterWeapon(weapon)) {
      filteredWeapons.push(weapon);
    }
  }
  return filteredWeapons;
}
