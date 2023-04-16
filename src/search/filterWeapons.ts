import {
  adjustAttributesForTwoHanding,
  Attribute,
  Attributes,
  Weapon,
  WeaponType,
} from "../calculator/calculator";

export interface FilterWeaponsOptions {
  /**
   * Only include these types of weapons
   */
  weaponTypes: readonly WeaponType[];

  /**
   * Only include weapons infused with one of these affinities
   */
  affinityIds: readonly number[];

  /**
   * Only include weapons that are effective with the given player attribute values
   */
  effectiveWithAttributes?: Attributes;

  twoHanding?: boolean;
}

/** Weapon types that can never have an affinity applied, so an affinity filter doesn't make sense */
export const uninfusableWeaponTypes: WeaponType[] = [
  "Light Bow",
  "Bow",
  "Greatbow",
  "Crossbow",
  "Ballista",
  "Torch",
  "Glintstone Staff",
  "Sacred Seal",
];

export default function filterWeapons(
  weapons: IterableIterator<Weapon>,
  { weaponTypes, affinityIds, effectiveWithAttributes, twoHanding }: FilterWeaponsOptions,
): readonly Weapon[] {
  function filterWeapon(weapon: Weapon): boolean {
    if (weaponTypes.length > 0 && !weaponTypes.includes(weapon.weaponType)) {
      return false;
    }

    if (
      affinityIds.length > 0 &&
      !affinityIds.some(
        (affinityId) =>
          affinityId === weapon.affinityId ||
          // Include uninfusable categories of armaments (torches etc.) if special weapons are included,
          // since the standard vs. unique distinction doesn't apply to these categories
          (affinityId === -1 && uninfusableWeaponTypes.includes(weapon.weaponType)),
      )
    ) {
      return false;
    }

    if (effectiveWithAttributes != null) {
      const attributes = adjustAttributesForTwoHanding({
        twoHanding,
        weapon,
        attributes: effectiveWithAttributes,
      });

      if (
        (Object.entries(weapon.requirements) as [Attribute, number][]).some(
          ([attribute, requirement]) => attributes[attribute] < requirement,
        )
      ) {
        return false;
      }
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
