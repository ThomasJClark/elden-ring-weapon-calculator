import {
  allDamageTypes,
  allStatusTypes,
  AttackPowerType,
  WeaponType,
} from "./calculator/calculator";
import type { AttackElementCorrect, Attribute, Weapon } from "./calculator/calculator";

export const defaultDamageCalcCorrectGraphId = 0;
export const defaultStatusCalcCorrectGraphId = 6;

export type CalcCorrectGraph = {
  /** The highest attribute value where this stage applies (i.e. the "soft cap") */
  maxVal: number;
  /** The highest scaling value within this stage */
  maxGrowVal: number;
  /** Exponent used for non-linear scaling curves */
  adjPt: number;
}[];

export interface ReinforceParamWeapon {
  attack: Partial<Record<AttackPowerType, number>>;
  attributeScaling: Record<Attribute, number>;
  statusSpEffectId1?: number;
  statusSpEffectId2?: number;
  statusSpEffectId3?: number;
}

/**
 * Regulation data from a particular version of Elden Ring
 */
export interface EncodedRegulationDataJson {
  readonly calcCorrectGraphs: {
    readonly [calcCorrectId in number]?: CalcCorrectGraph;
  };
  readonly attackElementCorrects: {
    readonly [attackElementCorrectId in number]?: Partial<
      Record<AttackPowerType, Partial<Record<Attribute, number | true>>>
    >;
  };
  readonly reinforceTypes: {
    readonly [reinforceId in number]?: ReinforceParamWeapon[];
  };
  readonly statusSpEffectParams: {
    readonly [spEffectParamId in number]?: Partial<Record<AttackPowerType, number>>;
  };
  readonly scalingTiers: [number, string][];
  readonly weapons: readonly EncodedWeaponJson[];
}

/**
 * Compact JSON representation of a weapon with things like AttackElementCorrect represented by
 * IDs. For convenience, this is converted to a denormalized Weapon object on the client side.
 */
export interface EncodedWeaponJson {
  name: string;
  weaponName: string;
  variant?: string;
  url?: string | null;
  affinityId: number;
  weaponType: WeaponType;
  requirements: Partial<Record<Attribute, number>>;
  attributeScaling: (readonly [Attribute, number])[];
  attack: (readonly [AttackPowerType, number])[];
  statusSpEffectParamIds?: number[];
  reinforceTypeId: number;
  attackElementCorrectId: number;
  calcCorrectGraphIds?: Partial<Record<AttackPowerType, number>>;
  paired?: boolean;
  sorceryTool?: boolean;
  incantationTool?: boolean;
  dlc?: boolean;
}

/**
 * Precompute a CalcCorrectGraph into an array of scaling amounts at each stat level
 */
function evaluateCalcCorrectGraph(calcCorrectGraph: CalcCorrectGraph) {
  const arr: number[] = [];

  for (let i = 1; i < calcCorrectGraph.length; i++) {
    const prevStage = calcCorrectGraph[i - 1];
    const stage = calcCorrectGraph[i];

    const minAttributeValue = i === 1 ? 1 : prevStage.maxVal + 1;
    const maxAttributeValue = i === calcCorrectGraph.length - 1 ? 148 : stage.maxVal;

    for (
      let attributeValue = minAttributeValue;
      attributeValue <= maxAttributeValue;
      attributeValue++
    ) {
      if (!arr[attributeValue]) {
        let ratio = Math.max(
          0,
          Math.min(1, (attributeValue - prevStage.maxVal) / (stage.maxVal - prevStage.maxVal)),
        );

        if (prevStage.adjPt > 0) {
          ratio = ratio ** prevStage.adjPt;
        } else if (prevStage.adjPt < 0) {
          ratio = 1 - (1 - ratio) ** -prevStage.adjPt;
        }

        arr[attributeValue] =
          prevStage.maxGrowVal + (stage.maxGrowVal - prevStage.maxGrowVal) * ratio;
      }
    }
  }

  return arr;
}

/**
 * Decode the game regulation data into a convenient JavaScript object used in the React app
 */
export function decodeRegulationData({
  calcCorrectGraphs,
  attackElementCorrects,
  reinforceTypes,
  statusSpEffectParams,
  weapons,
  scalingTiers,
}: EncodedRegulationDataJson): Weapon[] {
  const calcCorrectGraphsById = new Map(
    Object.entries(calcCorrectGraphs).map(([calcCorrectGraphId, calcCorrectGraph]) => [
      +calcCorrectGraphId,
      evaluateCalcCorrectGraph(calcCorrectGraph!),
    ]),
  );

  const attackElementCorrectsById = new Map<number, AttackElementCorrect>(
    Object.entries(attackElementCorrects).map(([attackElementCorrectId, attackElementCorrect]) => [
      +attackElementCorrectId,
      {
        ...attackElementCorrect,

        // Status effects aren't stored in AttackElementCorrectParam because it's the same for all
        // weapons. Manually add it to all entries
        [AttackPowerType.POISON]: { arc: true },
        [AttackPowerType.BLEED]: { arc: true },
        [AttackPowerType.MADNESS]: { arc: true },
        [AttackPowerType.SLEEP]: { arc: true },
      },
    ]),
  );

  return weapons.map(
    ({
      attackElementCorrectId,
      reinforceTypeId,
      calcCorrectGraphIds,
      statusSpEffectParamIds,
      attack: unupgradedAttack,
      attributeScaling: unupgradedAttributeScaling,
      dlc = false,
      ...weapon
    }): Weapon => {
      const attackElementCorrect = attackElementCorrectsById.get(attackElementCorrectId);
      if (attackElementCorrect == null) {
        throw new Error(
          `No AttackElementCorrectParam found for id=${attackElementCorrectId} weapon=${weapon.name}`,
        );
      }

      const reinforceParams = reinforceTypes[reinforceTypeId];
      if (reinforceParams == null) {
        throw new Error(
          `No ReinforceParamWeapon found for id=${reinforceTypeId} weapon=${weapon.name}`,
        );
      }

      function getCalcCorrectGraph(calcCorrectId: number) {
        const calcCorrectGraph = calcCorrectGraphsById.get(calcCorrectId);
        if (calcCorrectGraph == null) {
          throw new Error(
            `No CalcCorrectGraph found for id=${calcCorrectId} weapon=${weapon.name}`,
          );
        }
        return calcCorrectGraph;
      }

      const weaponCalcCorrectGraphs = {} as Weapon["calcCorrectGraphs"];
      allDamageTypes.forEach((damageType) => {
        weaponCalcCorrectGraphs[damageType] = getCalcCorrectGraph(
          calcCorrectGraphIds?.[damageType] ?? defaultDamageCalcCorrectGraphId,
        );
      });
      allStatusTypes.forEach((statusType) => {
        weaponCalcCorrectGraphs[statusType] = getCalcCorrectGraph(
          calcCorrectGraphIds?.[statusType] ?? defaultStatusCalcCorrectGraphId,
        );
      });

      // Using the base unupgraded attack and ReinforceParamWeapon for this weapon, calculate the
      // base attack at each upgrade level
      const attack: Weapon["attack"] = reinforceParams.map((reinforceParam) => {
        const attackAtUpgradeLevel: Weapon["attack"][number] = {};

        unupgradedAttack.forEach(([attackPowerType, unupgradedAttackPower]) => {
          attackAtUpgradeLevel[attackPowerType] =
            unupgradedAttackPower * (reinforceParam.attack[attackPowerType] ?? 0);
        });

        const offsets = [
          reinforceParam.statusSpEffectId1,
          reinforceParam.statusSpEffectId2,
          reinforceParam.statusSpEffectId3,
        ];

        statusSpEffectParamIds?.forEach((spEffectParamId, i) => {
          if (spEffectParamId) {
            const statusSpEffectParam = statusSpEffectParams[spEffectParamId + (offsets[i] ?? 0)];
            Object.assign(attackAtUpgradeLevel, statusSpEffectParam);
          }
        });

        return attackAtUpgradeLevel;
      });

      // Using the base unupgraded scaling and ReinforceParamWeapon for this weapon, calculate the
      // base scaling at each upgrade level
      const attributeScaling: Weapon["attributeScaling"] = reinforceParams.map((reinforceParam) => {
        const attributeScalingAtUpgradeLevel: Weapon["attributeScaling"][number] = {};
        unupgradedAttributeScaling.forEach(([attribute, unupgradedScaling]) => {
          attributeScalingAtUpgradeLevel[attribute] =
            unupgradedScaling * reinforceParam.attributeScaling[attribute];
        });

        return attributeScalingAtUpgradeLevel;
      });

      return {
        ...weapon,
        url:
          weapon.url === undefined
            ? `https://eldenring.fandom.com/wiki/${weapon.weaponName.replaceAll(" ", "_")}`
            : weapon.url,
        attack,
        attributeScaling,
        attackElementCorrect,
        calcCorrectGraphs: weaponCalcCorrectGraphs,
        scalingTiers,
        dlc,
      };
    },
  );
}
