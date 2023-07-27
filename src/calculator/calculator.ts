import type { Attribute, Attributes } from "./attributes";
import { AttackPowerType, allAttackPowerTypes, allDamageTypes } from "./attackPowerTypes";
import type { Weapon } from "./weapon";
import { WeaponType } from "./weaponTypes";

interface WeaponAttackOptions {
  weapon: Weapon;
  attributes: Attributes;
  twoHanding?: boolean;
  upgradeLevel: number;
  disableTwoHandingAttackPowerBonus?: boolean;
  ineffectiveAttributePenalty?: number;
}

export interface WeaponAttackResult {
  upgradeLevel: number;
  attackPower: Partial<Record<AttackPowerType, number>>;
  ineffectiveAttributes: Attribute[];
}

/**
 * Adjust a set of character attributes to take into account the 50% Strength bonus when two
 * handing a weapon
 */
export function adjustAttributesForTwoHanding({
  twoHanding = false,
  weapon,
  attributes,
}: {
  twoHanding?: boolean;
  weapon: Weapon;
  attributes: Attributes;
}): Attributes {
  let twoHandingBonus = twoHanding;

  // Paired weapons do not get the two handing bonus
  if (weapon.paired) {
    twoHandingBonus = false;
  }

  // Bows and ballistae can only be two handed
  if (
    weapon.weaponType === WeaponType.LIGHT_BOW ||
    weapon.weaponType === WeaponType.BOW ||
    weapon.weaponType === WeaponType.GREATBOW ||
    weapon.weaponType === WeaponType.BALLISTA
  ) {
    twoHandingBonus = true;
  }

  if (twoHandingBonus) {
    return {
      ...attributes,
      str: Math.floor(attributes.str * 1.5),
    };
  }

  return attributes;
}

/**
 * Determine the damage for a weapon with the given player stats
 */
export default function getWeaponAttack({
  weapon,
  attributes,
  twoHanding,
  upgradeLevel,
  disableTwoHandingAttackPowerBonus,
  ineffectiveAttributePenalty = 0.4,
}: WeaponAttackOptions): WeaponAttackResult {
  const adjustedAttributes = adjustAttributesForTwoHanding({ twoHanding, weapon, attributes });

  const ineffectiveAttributes = (Object.entries(weapon.requirements) as [Attribute, number][])
    .filter(([attribute, requirement]) => adjustedAttributes[attribute] < requirement)
    .map(([attribute]) => attribute);

  const attackPower: Partial<Record<AttackPowerType, number>> = {};
  for (const attackPowerType of allAttackPowerTypes) {
    const baseAttackPower = weapon.attack[upgradeLevel][attackPowerType] ?? 0;
    if (baseAttackPower) {
      // This weapon's AttackElementCorrectParam determines what attributes each damage type scales
      // with
      const scalingAttributes = weapon.attackElementCorrect[attackPowerType] ?? [];

      let scalingMultiplier = 0;

      if (ineffectiveAttributes.some((attribute) => scalingAttributes.includes(attribute))) {
        // If the requirements for this damage type are not met, a penalty is subtracted instead
        // of a scaling bonus being added
        scalingMultiplier = -ineffectiveAttributePenalty;
      } else {
        // Otherwise, the scaling multiplier is equal to the sum of the corrected attribute values
        // multiplied by the scaling for that attribute
        const effectiveAttributes =
          !disableTwoHandingAttackPowerBonus && allDamageTypes.includes(attackPowerType)
            ? adjustedAttributes
            : attributes;
        for (const attribute of scalingAttributes) {
          const scaling = weapon.attributeScaling[upgradeLevel][attribute];
          if (scaling) {
            scalingMultiplier +=
              weapon.calcCorrectGraphs[attackPowerType][effectiveAttributes[attribute]] * scaling;
          }
        }
      }

      // The final scaling multiplier modifies the attack power for this damage type as a
      // percentage boost, e.g. 0.5 adds +50% of the base attack power
      attackPower[attackPowerType] = baseAttackPower * (1 + scalingMultiplier);
    }
  }

  return {
    upgradeLevel,
    attackPower,
    ineffectiveAttributes,
  };
}

export * from "./attributes";
export * from "./attackPowerTypes";
export * from "./weapon";
export * from "./weaponTypes";
