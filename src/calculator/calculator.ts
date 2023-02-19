import {
  allDamageTypes,
  DamageType,
  Attributes,
  Attribute,
  StatusType,
  allStatusTypes,
  adjustAttributesForTwoHanding,
} from "./utils";
import { Weapon } from "./weapon";
import { damageScalingCurves, statusCurve } from "./scalingCurves";

export interface WeaponAttackOptions {
  weapon: Weapon;
  attributes: Attributes;
  twoHanding?: boolean;
}

export interface AttackPower {
  baseAttackPower: number;
  scalingAttackPower: number;
}

export interface WeaponAttackResult {
  attackRating: Partial<Record<DamageType, AttackPower>>;
  statusBuildup: Partial<Record<StatusType, number>>;
  ineffectiveAttributes: Attribute[];
}

/**
 * Determine the damage for a weapon with the given player stats
 */
export default function getWeaponAttack({
  weapon,
  attributes,
  twoHanding,
}: WeaponAttackOptions): WeaponAttackResult {
  const effectiveAttributes = adjustAttributesForTwoHanding({ twoHanding, weapon, attributes });

  const ineffectiveAttributes = (Object.entries(weapon.requirements) as [Attribute, number][])
    .filter(([attribute, requirement]) => effectiveAttributes[attribute] < requirement)
    .map(([attribute]) => attribute);

  const attackRating: Partial<Record<DamageType, AttackPower>> = {};
  for (const damageType of allDamageTypes) {
    if (damageType in weapon.attack) {
      const baseAttackPower = weapon.attack[damageType] ?? 0;
      const scalingAttributes = weapon.damageScalingAttributes[damageType] ?? [];
      const scalingCurve = damageScalingCurves[weapon.damageScalingCurves[damageType] ?? 0];

      let scalingMultiplier = 0;

      if (ineffectiveAttributes.some((attribute) => scalingAttributes.includes(attribute))) {
        // If the requirements for this damage type are not met, a 40% penalty is subtracted instead
        // of a scaling bonus being added
        scalingMultiplier = -0.4;
      } else {
        // Otherwise, the scaling multiplier is equal to the product of the scaling for the relevant
        // attribute, and the current value of that attribute a curve. If this damage type scales
        // with multiple attributes, the products are added together.
        for (const attribute of scalingAttributes) {
          const scaling = weapon.attributeScaling[attribute] ?? 0;
          scalingMultiplier += scalingCurve(effectiveAttributes[attribute]) * scaling;
        }
      }

      attackRating[damageType] = {
        baseAttackPower,
        scalingAttackPower: scalingMultiplier * baseAttackPower,
      };
    }
  }

  const statusBuildup: Partial<Record<StatusType, number>> = {};
  for (const statusType of allStatusTypes) {
    if (statusType in weapon.statuses) {
      const statusBase = weapon.statuses[statusType] ?? 0;

      let scalingMultiplier = 0;
      if (effectiveAttributes.arc < (weapon.requirements.arc ?? 0)) {
        // If the arcane requirement is not met, a 40% penalty is subtracted instead of a scaling
        // bonus being added
        scalingMultiplier = -0.4;
      } else if (
        statusType === "Poison" ||
        statusType === "Bleed" ||
        statusType === "Madness" ||
        statusType === "Sleep"
      ) {
        // Otherwise, the scaling multiplier for certain status types is equal to the product of
        // the arcane scaling and the current arcane stat on a special curve.
        scalingMultiplier =
          (weapon.attributeScaling.arc ?? 0) * statusCurve(effectiveAttributes.arc);
      }

      statusBuildup[statusType] = statusBase * (1 + scalingMultiplier);
    }
  }

  return {
    attackRating,
    statusBuildup: statusBuildup,
    ineffectiveAttributes,
  };
}

export * from "./utils";
export * from "./weapon";
