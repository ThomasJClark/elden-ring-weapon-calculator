import {
  adjustAttributesForTwoHanding,
  Affinity,
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
  affinities: readonly Affinity[];

  /**
   * Only include weapons that are effective with the given player attribute values
   */
  effectiveWithAttributes?: Attributes;

  twoHanding?: boolean;
}

/** Weapon types that can never have an affinity applied, so an affinity filter doesn't make sense */
const uninfusableWeaponTypes: WeaponType[] = [
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
  { weaponTypes, affinities, effectiveWithAttributes, twoHanding }: FilterWeaponsOptions,
): readonly Weapon[] {
  function filterWeapon(weapon: Weapon): boolean {
    if (weaponTypes.length > 0 && !weaponTypes.includes(weapon.metadata.weaponType)) {
      return false;
    }

    if (
      affinities.length > 0 &&
      !affinities.some(
        (affinity) =>
          affinity === weapon.metadata.affinity ||
          // Include uninfusable categories of armaments (torches etc.) if standard weapons are included,
          // since the standard vs. unique distinction doesn't apply to these categories
          (affinity === "Standard" && uninfusableWeaponTypes.includes(weapon.metadata.weaponType)),
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
