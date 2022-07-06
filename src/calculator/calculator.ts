import {
  allDamageTypes,
  DamageType,
  Attributes,
  Attribute,
  PassiveType,
  allPassiveTypes,
} from "./utils";
import { Weapon } from "./weapon";
import { damageScalingCurves, passiveCurve } from "./scalingCurves";

export interface WeaponAttackOptions {
  weapon: Weapon;
  attributes: Attributes;
}

export interface AttackPower {
  baseAttackPower: number;
  scalingAttackPower: number;
}

export interface WeaponAttackResult {
  attackRating: Partial<Record<DamageType, AttackPower>>;
  passiveBuildup: Partial<Record<PassiveType, number>>;
  ineffectiveAttributes: Attribute[];
}

/**
 * Determine the damage for a weapon with the given player stats
 */
export default function getWeaponAttack({
  weapon,
  attributes,
}: WeaponAttackOptions): WeaponAttackResult {
  const ineffectiveAttributes = (Object.entries(weapon.requirements) as [Attribute, number][])
    .filter(([attribute, requirement]) => attributes[attribute] < requirement)
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
          scalingMultiplier += scalingCurve(attributes[attribute]) * scaling;
        }
      }

      attackRating[damageType] = {
        baseAttackPower,
        scalingAttackPower: scalingMultiplier * baseAttackPower,
      };
    }
  }

  const passiveBuildup: Partial<Record<PassiveType, number>> = {};
  for (const passiveType of allPassiveTypes) {
    if (passiveType in weapon.passives) {
      const passiveBase = weapon.passives[passiveType] ?? 0;

      let scalingMultiplier = 0;
      if (attributes.arc < (weapon.requirements.arc ?? 0)) {
        // If the arcane requirement is not met, a 40% penalty is subtracted instead of a scaling
        // bonus being added
        scalingMultiplier = -0.4;
      } else if (passiveType === "Poison" || passiveType === "Bleed") {
        // Otherwise, the scaling multiplier for poison and bleed is equal to the product of the
        // arcane scaling and the current arcane stat on a special curve.
        scalingMultiplier = (weapon.attributeScaling.arc ?? 0) * passiveCurve(attributes.arc);
      }

      passiveBuildup[passiveType] = passiveBase * (1 + scalingMultiplier);
    }
  }

  return {
    attackRating,
    passiveBuildup,
    ineffectiveAttributes,
  };
}

export * from "./utils";
export * from "./weapon";
