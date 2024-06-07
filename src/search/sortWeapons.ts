import { getTotalDamageAttackPower } from "../app/uiUtils";
import { type WeaponTableRowData } from "../app/weaponTable/WeaponTable";
import { getAggScalingValue } from "../app/weaponTable/tableRenderers";
import { type Attribute, allAttributes, type Agg, AttackPowerType } from "../calculator/calculator";

export type SortBy =
  | "name"
  | "totalAttack"
  | `${AttackPowerType}Attack`
  | "sortBy"
  | `${AttackPowerType}SpellScaling`
  | `${Attribute}Scaling`
  | `${Agg}Agg`
  | `${Attribute}Requirement`;

/**
 * Sort and paginate a filtered list of weapons for display in the weapon table
 */
export function sortWeapons(
  rows: readonly WeaponTableRowData[],
  sortBy: SortBy,
  reverse: boolean,
): WeaponTableRowData[] {
  const getSortValue = ((): ((row: WeaponTableRowData) => number | string) => {
    if (sortBy === "name") {
      return ([weapon]) => `${weapon.weaponName},${weapon.affinityId.toString().padStart(4, "0")}`;
    }

    if (sortBy === "totalAttack") {
      return ([, { attackPower }]) => -getTotalDamageAttackPower(attackPower);
    }

    if (sortBy.endsWith("Attack")) {
      const attackPowerType = +sortBy.slice(0, -1 * "Attack".length) as AttackPowerType;
      return ([, { attackPower }]) => -(attackPower[attackPowerType] ?? 0);
    }

    if (sortBy.endsWith("SpellScaling")) {
      const attackPowerType = +sortBy.slice(0, -1 * "SpellScaling".length) as AttackPowerType;
      return ([, { spellScaling }]) => -(spellScaling[attackPowerType] ?? 0);
    }

    if (sortBy.endsWith("Scaling")) {
      const attribute = sortBy.slice(0, -1 * "Scaling".length) as Attribute;
      return ([weapon, { upgradeLevel }]) =>
        -(weapon.attributeScaling[upgradeLevel][attribute] ?? 0);
    }

    if (sortBy.endsWith("Agg")) {
      const agg = sortBy.slice(0, -1 * "Agg".length) as Agg;
      return ([weapon, { upgradeLevel }]) => getAggScalingValue(weapon.attributeScaling, upgradeLevel, agg);
    }

    if (sortBy.endsWith("Requirement")) {
      const attribute = sortBy.slice(0, -1 * "Requirement".length) as Attribute;
      return ([weapon]) => -(weapon.requirements[attribute] ?? 0);
    }

    return () => "";
  })();

  return [...rows].sort((row1, row2) =>
    getSortValue(row1) > getSortValue(row2) !== reverse ? 1 : -1,
  );
}
