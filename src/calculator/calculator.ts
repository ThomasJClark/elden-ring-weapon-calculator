import { allAttributes, type Attribute, type Attributes } from "./attributes.ts";
import { AttackPowerType, allDamageTypes, allStatusTypes } from "./attackPowerTypes.ts";
import type { Weapon } from "./weapon.ts";
import { WeaponType } from "./weaponTypes.ts";

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
  spellScaling: Partial<Record<AttackPowerType, number>>;
  ineffectiveAttributes: Attribute[];
  ineffectiveAttackPowerTypes: AttackPowerType[];
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

  const ineffectiveAttackPowerTypes: AttackPowerType[] = [];

  const attackPower: Partial<Record<AttackPowerType, number>> = {};
  const spellScaling: Partial<Record<AttackPowerType, number>> = {};

  for (const attackPowerType of [...allDamageTypes, ...allStatusTypes]) {
    const isDamageType = allDamageTypes.includes(attackPowerType);

    const baseAttackPower = weapon.attack[upgradeLevel][attackPowerType] ?? 0;
    if (baseAttackPower || weapon.sorceryTool || weapon.incantationTool) {
      // This weapon's AttackElementCorrectParam determines what attributes each damage type scales
      // with
      const scalingAttributes = weapon.attackElementCorrect[attackPowerType] ?? {};

      let totalScaling = 1;

      if (ineffectiveAttributes.some((attribute) => scalingAttributes[attribute])) {
        // If the requirements for this damage type are not met, a penalty is subtracted instead
        // of a scaling bonus being added
        totalScaling = 1 - ineffectiveAttributePenalty;
        ineffectiveAttackPowerTypes.push(attackPowerType);
      } else {
        // Otherwise, the scaling multiplier is equal to the sum of the corrected attribute values
        // multiplied by the scaling for that attribute
        const effectiveAttributes =
          !disableTwoHandingAttackPowerBonus && isDamageType ? adjustedAttributes : attributes;
        for (const attribute of allAttributes) {
          const attributeCorrect = scalingAttributes[attribute];
          if (attributeCorrect) {
            let scaling: number;
            if (attributeCorrect === true) {
              scaling = weapon.attributeScaling[upgradeLevel][attribute] ?? 0;
            } else {
              scaling =
                (attributeCorrect * (weapon.attributeScaling[upgradeLevel][attribute] ?? 0)) /
                (weapon.attributeScaling[0][attribute] ?? 0);
            }

            if (scaling) {
              totalScaling +=
                weapon.calcCorrectGraphs[attackPowerType][effectiveAttributes[attribute]] * scaling;
            }
          }
        }
      }

      // The final scaling multiplier modifies the attack power for this damage type as a
      // percentage boost, e.g. 0.5 adds +50% of the base attack power
      if (baseAttackPower) {
        attackPower[attackPowerType] = baseAttackPower * totalScaling;
      }

      if (isDamageType && (weapon.sorceryTool || weapon.incantationTool)) {
        spellScaling[attackPowerType] = 100 * totalScaling;
      }
    }
  }

  return {
    upgradeLevel,
    attackPower,
    spellScaling,
    ineffectiveAttributes,
    ineffectiveAttackPowerTypes,
  };
}

/**
 * Determine the critical attack for a weapon with the given player stats
 */
export function getCriticalAttack({
  weapon,
  attributes,
  upgradeLevel,
  ineffectiveAttributePenalty = 0.4,
}: WeaponAttackOptions): WeaponAttackResult | undefined {
  if (weapon.criticalMultiplier == null) return undefined;

  const result = getWeaponAttack({
    weapon,
    attributes,
    twoHanding: false,
    upgradeLevel,
    ineffectiveAttributePenalty: ineffectiveAttributePenalty,
  });

  for (const [type, value] of Object.entries(result.attackPower)) {
    const typedType = type as unknown as AttackPowerType;
    result.attackPower[typedType] = value * (weapon.critical / 100) * (weapon.criticalMultiplier[typedType] ?? 0);
  }

  return result;
}

export * from "./attributes.ts";
export * from "./attackPowerTypes.ts";
export * from "./weapon.ts";
export * from "./weaponTypes.ts";
