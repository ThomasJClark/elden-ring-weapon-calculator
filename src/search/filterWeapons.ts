import {
  adjustAttributesForTwoHanding,
  WeaponType,
  type Attribute,
  type Attributes,
  type Weapon,
} from "../calculator/calculator";

export interface FilterWeaponsOptions {
  /**
   * Only include these types of weapons
   */
  weaponTypes: ReadonlySet<WeaponType>;

  /**
   * Only include weapons infused with one of these affinities
   */
  affinityIds: ReadonlySet<number>;

  /**
   * Only include weapons that are effective with the given player attribute values
   */
  effectiveWithAttributes?: Attributes;

  twoHanding?: boolean;

  /**
   * Weapon types where the "Standard" vs. "Special" distinction doesn't exist for affinity
   * filtering purposes since no weapons can have affinities
   */
  uninfusableWeaponTypes?: Set<WeaponType>;
}

/**
 * Implements the UI/business logic for filtering weapons by type, affinity, etc.
 */
export default function filterWeapons(
  weapons: readonly Weapon[],
  {
    weaponTypes,
    affinityIds,
    effectiveWithAttributes,
    twoHanding,
    uninfusableWeaponTypes,
  }: FilterWeaponsOptions,
): readonly Weapon[] {
  function filterWeapon(weapon: Weapon): boolean {
    if (weaponTypes.size > 0) {
      if (
        !weaponTypes.has(weapon.weaponType) &&
        // Treat hybrid seals/staves as either category
        !(
          weapon.weaponType === WeaponType.UNIVERSAL_CATALYST &&
          (weaponTypes.has(WeaponType.SACRED_SEAL) || weaponTypes.has(WeaponType.GLINTSTONE_STAFF))
        )
      ) {
        return false;
      }
    }

    if (affinityIds.size > 0) {
      if (
        !affinityIds.has(weapon.affinityId) &&
        // Treat uninfusable categories of armaments (torches etc.) as either standard or unique,
        // since the distinction doesn't apply to these categories
        !(
          uninfusableWeaponTypes?.has(weapon.weaponType) &&
          (affinityIds.has(0) || affinityIds.has(-1))
        )
      ) {
        return false;
      }
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

  return weapons.filter(filterWeapon);
}
