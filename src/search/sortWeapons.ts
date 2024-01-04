import { getTotalDamageAttackPower } from "../app/uiUtils";
import { type WeaponTableRowData } from "../app/weaponTable/WeaponTable";
import { type Attribute, AttackPowerType } from "../calculator/calculator";

export type SortBy =
  | "name"
  | "totalAttack"
  | `${AttackPowerType}Attack`
  | `${Attribute}Scaling`
  | `${Attribute}Requirement`
  | "convergenceSpellAffinity"
  | "convergenceSpellTier";

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

    if (sortBy.endsWith("Scaling")) {
      const attribute = sortBy.slice(0, -1 * "Scaling".length) as Attribute;
      return ([weapon, { upgradeLevel }]) =>
        -(weapon.attributeScaling[upgradeLevel][attribute] ?? 0);
    }

    if (sortBy.endsWith("Requirement")) {
      const attribute = sortBy.slice(0, -1 * "Requirement".length) as Attribute;
      return ([weapon]) => -(weapon.requirements[attribute] ?? 0);
    }

    if (sortBy === "convergenceSpellAffinity") {
      return ([{ convergenceData }]) =>
        (convergenceData?.spellAffinity ?? " ") + (1 - (convergenceData?.spellTier ?? 0));
    }

    if (sortBy === "convergenceSpellTier") {
      return ([{ convergenceData }]) =>
        1 - (convergenceData?.spellTier ?? 0) + (convergenceData?.spellAffinity ?? " ");
    }

    return () => "";
  })();

  return [...rows].sort((row1, row2) =>
    getSortValue(row1) > getSortValue(row2) !== reverse ? 1 : -1,
  );
}
