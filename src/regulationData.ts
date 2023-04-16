import {
  allDamageTypes,
  allStatusTypes,
  Attribute,
  CalcCorrectGraph,
  DamageType,
  StatusType,
  Weapon,
  WeaponType,
} from "./calculator/calculator";

export interface ReinforceParamWeapon {
  attack: Record<DamageType, number>;
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
    readonly [attackElementCorrectId in number]?: Partial<Record<DamageType, Attribute[]>>;
  };
  readonly reinforceTypes: {
    readonly [reinforceId in number]?: ReinforceParamWeapon[];
  };
  readonly statusSpEffectParams: {
    readonly [spEffectParamId in number]?: Partial<Record<StatusType, number>>;
  };
  readonly weapons: readonly EncodedWeaponJson[];
}

/**
 * Compact JSON representation of a weapon with things like AttackElementCorrect represented by
 * IDs. For convenience, this is converted to a denormalized Weapon object on the client side.
 */
export interface EncodedWeaponJson {
  name: string;
  weaponName: string;
  affinityId: number;
  weaponType: WeaponType;
  requirements: Partial<Record<Attribute, number>>;
  attributeScaling: Partial<Record<Attribute, number>>;
  attack: Partial<Record<DamageType, number>>;
  statusSpEffectParamIds: number[];
  reinforceTypeId: number;
  attackElementCorrectId: number;
  calcCorrectGraphIds?: Partial<Record<DamageType | StatusType, number>>;
  paired: boolean;
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
}: EncodedRegulationDataJson): Weapon[] {
  return weapons.map(
    ({
      attackElementCorrectId,
      reinforceTypeId,
      calcCorrectGraphIds,
      statusSpEffectParamIds,
      attack: unupgradedAttack,
      attributeScaling: unupgradedAttributeScaling,
      ...weapon
    }) => {
      const attackElementCorrect = attackElementCorrects[attackElementCorrectId];
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
        const calcCorrectGraph = calcCorrectGraphs[calcCorrectId];
        if (calcCorrectGraph == null) {
          throw new Error(
            `No CalcCorrectGraph found for id=${calcCorrectId} weapon=${weapon.name}`,
          );
        }
        return calcCorrectGraph;
      }

      const weaponCalcCorrectGraphs = Object.fromEntries([
        ...allDamageTypes.map((damageType) => [
          damageType,
          getCalcCorrectGraph(calcCorrectGraphIds?.[damageType] ?? 0),
        ]),
        ...allStatusTypes.map((statusType) => [
          statusType,
          getCalcCorrectGraph(calcCorrectGraphIds?.[statusType] ?? 6),
        ]),
      ]);

      const attack: Weapon["attack"] = reinforceParams.map((reinforceParam) => {
        const attackAtUpgradeLevel: Weapon["attack"][number] = {};

        (Object.entries(unupgradedAttack) as [DamageType, number][]).forEach(
          ([damageType, unupgradedAttackPower]) => {
            attackAtUpgradeLevel[damageType] =
              unupgradedAttackPower * (reinforceParam.attack?.[damageType] ?? 0);
          },
        );

        const offsets = [
          reinforceParam.statusSpEffectId1,
          reinforceParam.statusSpEffectId2,
          reinforceParam.statusSpEffectId3,
        ];

        // Hack: Cold Antspur Rapier has the same reinforceTypeId as every other cold weapon, but
        // in the game it doesn't seem to get more frostbite from upgrading.
        if (weapon.name === "Cold Antspur Rapier") {
          offsets[1] = 0;
        }

        statusSpEffectParamIds.forEach((spEffectParamId, i) => {
          if (spEffectParamId) {
            const statusSpEffectParam = statusSpEffectParams[spEffectParamId + (offsets[i] ?? 0)];
            Object.assign(attackAtUpgradeLevel, statusSpEffectParam);
          }
        });

        return attackAtUpgradeLevel;
      });

      const attributeScaling: Weapon["attributeScaling"] = reinforceParams.map((reinforceParam) => {
        const attributeScalingAtUpgradeLevel: Weapon["attributeScaling"][number] = {};

        (Object.entries(unupgradedAttributeScaling) as [Attribute, number][]).forEach(
          ([attribute, unupgradedScaling]) => {
            attributeScalingAtUpgradeLevel[attribute] =
              unupgradedScaling * (reinforceParam.attributeScaling?.[attribute] ?? 0);
          },
        );

        return attributeScalingAtUpgradeLevel;
      });

      return {
        ...weapon,
        attack,
        attributeScaling,
        attackElementCorrect,
        calcCorrectGraphs: weaponCalcCorrectGraphs,
      };
    },
  );
}
