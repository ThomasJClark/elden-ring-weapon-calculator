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

  /**
   * Include weapons from the Shadow of the Erdtree expansion if true
   */
  includeDLC?: boolean;

  twoHanding?: boolean;

  /**
   * Weapon types where the "Standard" vs. "Special" distinction doesn't exist for affinity
   * filtering purposes since no weapons can have affinities
   */
  uninfusableWeaponTypes?: Set<WeaponType>;

  /**
   * Weapon Names to apply to the filter. The weapon name will be "Dagger", not "Cold Dagger" for affinities
   */
  selectedWeapons?: Set<string>;
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
    includeDLC,
    twoHanding,
    uninfusableWeaponTypes,
    selectedWeapons,
  }: FilterWeaponsOptions,
): readonly Weapon[] {
  function filterWeapon(weapon: Weapon): boolean {
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

    if (!includeDLC && weapon.dlc) {
      return false;
    }

    // This works differently to the others filters and can result in an early return 'true'.
    // The justification here, is that
    // * It's useful to first apply the affinity filter, so that you can look at only the specified affinity for the weapon you're interested in
    // * Since your're explicitly filtering on a weapon name, it's nice to not need to toggle on all the weapon types or know which type it is.
    if (selectedWeapons && selectedWeapons.size > 0) {
      return selectedWeapons.has(weapon.weaponName);
    }

    if (weaponTypes.size > 0) {
      if (
        !weaponTypes.has(weapon.weaponType) &&
        // Treat weapons that can cast sorceries and incantations as Glintstone Staves and Sacred
        // Seals respectively. This is to support hybrid casting tools and weapons in Elden Ring
        // Reforged.
        !(weapon.sorceryTool && weaponTypes.has(WeaponType.GLINTSTONE_STAFF)) &&
        !(weapon.incantationTool && weaponTypes.has(WeaponType.SACRED_SEAL))
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
