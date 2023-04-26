import { getTotalAttackPower } from "../app/uiUtils";
import { type WeaponTableRowData } from "../app/weaponTable/WeaponTable";
import { type Attribute, DamageType } from "../calculator/calculator";

export type SortBy =
  | "name"
  | "totalAttack"
  | `${DamageType}Attack`
  | `${Attribute}Scaling`
  | `${Attribute}Requirement`;

/**
 * Sort and paginate a filtered list of weapons for display in the weapon table
 */
export function sortWeapons(
  rows: readonly WeaponTableRowData[],
  sortBy: SortBy,
  reverse: boolean,
): WeaponTableRowData[] {
  const getSortValue = ((): ((row: WeaponTableRowData) => any) => {
    if (sortBy === "name") {
      return ([weapon]) => `${weapon.weaponName},${weapon.affinityId.toString().padStart(4, "0")}`;
    }

    if (sortBy === "totalAttack") {
      return ([, { attackPower }]) => -getTotalAttackPower(attackPower);
    }

    if (sortBy.endsWith("Attack")) {
      const damageType = +sortBy.slice(0, -1 * "Attack".length) as DamageType;
      return ([, { attackPower }]) => -(attackPower[damageType] ?? 0);
    }

    if (sortBy.endsWith("Scaling")) {
      const attribute = sortBy.slice(0, -1 * "Scaling".length) as Attribute;
      return ([weapon, { upgradeLevel }]) =>
        -(weapon.attributeScaling[upgradeLevel][attribute] ?? 0);
    }

    if (sortBy.endsWith("Requirement")) {
      const attribute = sortBy.slice(0, -1 * "Requirement".length) as Attribute;
      return ([weapon]) => -(weapon.requirements[attribute] ?? 0);
    }

    return () => {};
  })();

  return [...rows].sort((row1, row2) =>
    // eslint-disable-next-line no-mixed-operators
    getSortValue(row1) > getSortValue(row2) !== reverse ? 1 : -1,
  );
}
