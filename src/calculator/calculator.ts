import { damageTypes, DamageType, Attribute } from "./utils";
import { Weapon } from "./weapon";
import scalingCurves from "./scalingCurves";

export type Attributes = Record<Attribute, number>;

interface WeaponAttackOptions {
  weapon: Weapon;
  attributes: Record<Attribute, number>;
}

export interface WeaponAttackPower {
  baseAttackPower: number;
  scalingAttackPower: number;
}

/**
 * Calculate the amount of scaling damage for the given damage type
 */
function getScalingAttackPower(weapon: Weapon, attributes: Attributes, damageType: DamageType) {
  const scalingAttributes = weapon.damageScalingAttributes[damageType] ?? [];

  // If the requirements are not met, a 40% penalty is substracted from the attack rating instead
  // of a scaling bonus being added
  if (
    scalingAttributes.some((attribute) => {
      const requirement = weapon.requirements[attribute];
      return requirement != null && attributes[attribute] < requirement;
    })
  ) {
    return -0.4 * (weapon.attack[damageType] ?? 0);
  }

  // Otherwise, the attack rating scaling is equal to the product of the base attack rating, the
  // scaling for the relevant attribute, and the value of the relevant attribute on a curve.
  // If this damage type scales with multiple attributes, the products are added together.
  let scalingAttack = 0;
  for (const attribute of scalingAttributes) {
    const baseAttack = weapon.attack[damageType] ?? 0;
    const scaling = weapon.attributeScaling[attribute] ?? 0;
    const scalingCurve = scalingCurves[weapon.damageScalingCurves[damageType] ?? 0];
    scalingAttack += scalingCurve(attributes[attribute]) * baseAttack * scaling;
  }
  return scalingAttack;
}

/**
 * Determine the damage for a weapon with the given player stats
 */
export default function getWeaponAttack({
  weapon,
  attributes,
}: WeaponAttackOptions): Partial<Record<DamageType, WeaponAttackPower>> {
  const weaponAttack: Partial<Record<DamageType, WeaponAttackPower>> = {};
  for (const damageType of damageTypes) {
    if (damageType in weapon.attack) {
      weaponAttack[damageType] = {
        baseAttackPower: weapon.attack[damageType] ?? 0,
        scalingAttackPower: getScalingAttackPower(weapon, attributes, damageType),
      };
    }
  }
  return weaponAttack;
}

export * from "./utils";
export * from "./weapon";
