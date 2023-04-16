import {
  allDamageTypes,
  DamageType,
  Attributes,
  Attribute,
  StatusType,
  allStatusTypes,
  adjustAttributesForTwoHanding,
} from "./utils";
import { CalcCorrectGraph, Weapon } from "./weapon";

export interface WeaponAttackOptions {
  weapon: Weapon;
  attributes: Attributes;
  twoHanding?: boolean;
  upgradeLevel: number;
}

export interface WeaponAttackResult {
  upgradeLevel: number;
  attackPower: Partial<Record<DamageType, number>>;
  statusBuildup: Partial<Record<StatusType, number>>;
  ineffectiveAttributes: Attribute[];
}

/**
 * @param attributeValue a raw player attribute from 1 to 99+
 * @returns the scaling from that attribute, as a fraction of the weapon's maximum scaling in that attribute
 */
function calcCorrect(calcCorrectGraph: CalcCorrectGraph, attributeValue: number) {
  for (let i = 1; i < calcCorrectGraph.length; i++) {
    const prevStage = calcCorrectGraph[i - 1];
    const stage = calcCorrectGraph[i];

    if (attributeValue <= stage.maxVal || i === calcCorrectGraph.length - 1) {
      let normalizedAttribute =
        (attributeValue - prevStage.maxVal) / (stage.maxVal - prevStage.maxVal);

      if (prevStage.adjPt > 0) {
        normalizedAttribute = normalizedAttribute ** prevStage.adjPt;
      } else if (prevStage.adjPt < 0) {
        normalizedAttribute = 1 - (1 - normalizedAttribute) ** -prevStage.adjPt;
      }

      return prevStage.maxGrowVal + (stage.maxGrowVal - prevStage.maxGrowVal) * normalizedAttribute;
    }
  }
  return 0;
}

/**
 * Determine the damage for a weapon with the given player stats
 */
export default function getWeaponAttack({
  weapon,
  attributes,
  twoHanding,
  upgradeLevel,
}: WeaponAttackOptions): WeaponAttackResult {
  const effectiveAttributes = adjustAttributesForTwoHanding({ twoHanding, weapon, attributes });

  const ineffectiveAttributes = (Object.entries(weapon.requirements) as [Attribute, number][])
    .filter(([attribute, requirement]) => effectiveAttributes[attribute] < requirement)
    .map(([attribute]) => attribute);

  const attack = weapon.attack[upgradeLevel];
  const attributeScaling = weapon.attributeScaling[upgradeLevel];

  const attackPower: Partial<Record<DamageType, number>> = {};
  for (const damageType of allDamageTypes) {
    const baseAttackPower = attack?.[damageType] ?? 0;
    if (baseAttackPower) {
      const scalingAttributes = weapon.attackElementCorrect[damageType] ?? [];
      const calcCorrectGraph = weapon.calcCorrectGraphs[damageType]!;

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
          const scaling = attributeScaling[attribute];
          if (scaling) {
            scalingMultiplier +=
              calcCorrect(calcCorrectGraph, effectiveAttributes[attribute]) * scaling;
          }
        }
      }

      attackPower[damageType] = baseAttackPower * (1 + scalingMultiplier);
    }
  }

  const statusBuildup: Partial<Record<StatusType, number>> = {};
  for (const statusType of allStatusTypes) {
    const baseStatusBuildup = attack[statusType] ?? 0;
    if (baseStatusBuildup) {
      const attribute = "arc";
      const calcCorrectGraph = weapon.calcCorrectGraphs[statusType]!;

      let scalingMultiplier = 0;
      if (
        (statusType === "Poison" ||
          statusType === "Bleed" ||
          statusType === "Madness" ||
          statusType === "Sleep") &&
        attributeScaling[attribute]
      ) {
        if (effectiveAttributes[attribute] < (weapon.requirements[attribute] ?? 0)) {
          // If the arcane requirement is not met, a 40% penalty is subtracted instead of a scaling
          // bonus being added
          scalingMultiplier = -0.4;
        } else {
          // Otherwise, the scaling multiplier for certain status types is equal to the product of
          // the arcane scaling and the current arcane stat on a special curve.
          const scaling = attributeScaling[attribute];
          if (scaling) {
            scalingMultiplier =
              scaling * calcCorrect(calcCorrectGraph, effectiveAttributes[attribute]);
          }
        }
      }

      statusBuildup[statusType] = baseStatusBuildup * (1 + scalingMultiplier);
    }
  }

  return {
    upgradeLevel,
    attackPower,
    statusBuildup,
    ineffectiveAttributes,
  };
}

export * from "./utils";
export * from "./weapon";
