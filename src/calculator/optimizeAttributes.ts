import getWeaponAttack, {
  allAttackPowerTypes,
  allAttributes,
  allDamageTypes,
  allStatusTypes,
  AttackPowerType,
  type Attribute,
  type Attributes,
  type Weapon,
  WeaponType,
} from "./calculator.ts";
import type { OptimizeMode, OptimizationWeights } from "./optimization.ts";

export interface OptimizeWeaponOptions {
  weapon: Weapon;
  attributes: Attributes;
  freeStatPoints: number;
  twoHanding: boolean;
  upgradeLevel: number;
  disableTwoHandingAttackPowerBonus?: boolean;
  ineffectiveAttributePenalty?: number;
  optimizeMode: OptimizeMode;
  optimizeAttackPowerType: AttackPowerType;
  weights?: OptimizationWeights;
  spellScalingWeight?: number;
}

export interface OptimizeWeaponResult {
  optimizedAttributes: Attributes;
  optimizedAttackResult: ReturnType<typeof getWeaponAttack>;
}

const attributeIndex: Record<Attribute, number> = {
  str: 0,
  dex: 1,
  int: 2,
  fai: 3,
  arc: 4,
};

function clampAttributeValue(value: number) {
  return Math.max(1, Math.min(99, value));
}

function clampRequirementValue(value: number) {
  return Math.max(0, Math.min(99, value));
}

function getEffectiveGraphValue(graph: number[], attributeValue: number) {
  const idx = Math.max(0, Math.min(graph.length - 1, attributeValue));
  return graph[idx] ?? 0;
}

function getScalingFactor(
  weapon: Weapon,
  upgradeLevel: number,
  attribute: Attribute,
  attributeCorrect: number | true,
) {
  const scalingAtLevel = weapon.attributeScaling[upgradeLevel][attribute] ?? 0;
  if (!scalingAtLevel) {
    return 0;
  }

  if (attributeCorrect === true) {
    return scalingAtLevel;
  }

  const scalingAt0 = weapon.attributeScaling[0][attribute] ?? 0;
  if (!scalingAt0) {
    return 0;
  }

  return (attributeCorrect * scalingAtLevel) / scalingAt0;
}

interface ScoreTerm {
  readonly attackPowerType: AttackPowerType;
  readonly graph: number[];
  readonly base: number;
  readonly isDamageType: boolean;
  readonly usesMask: number;
  readonly reqMask: number;
  readonly coeff: Float64Array; // base * scalingFactor per attribute index (already includes weight)
  readonly req: Uint8Array; // requirement per attribute index (0..99)
}

interface ScoreModel {
  readonly terms: readonly ScoreTerm[];
  readonly twoHandingBonus: boolean;
  readonly disableTwoHandingAttackPowerBonus: boolean;
  readonly ineffectiveAttributePenalty: number;
}

function getSpellScalingType(weapon: Weapon): AttackPowerType | undefined {
  if (weapon.sorceryTool) {
    return AttackPowerType.MAGIC;
  }
  if (weapon.incantationTool) {
    return AttackPowerType.HOLY;
  }
  return undefined;
}

function computeTwoHandingBonus(weapon: Weapon, twoHanding: boolean) {
  let twoHandingBonus = twoHanding;
  if (weapon.paired) {
    twoHandingBonus = false;
  }

  // Match adjustAttributesForTwoHanding(): bows and ballistae can only be two-handed
  if (
    weapon.weaponType === WeaponType.LIGHT_BOW ||
    weapon.weaponType === WeaponType.BOW ||
    weapon.weaponType === WeaponType.GREATBOW ||
    weapon.weaponType === WeaponType.BALLISTA
  ) {
    twoHandingBonus = true;
  }

  return twoHandingBonus;
}

function buildScoreModel(options: OptimizeWeaponOptions): ScoreModel {
  const {
    weapon,
    upgradeLevel,
    optimizeMode,
    optimizeAttackPowerType,
    weights,
    spellScalingWeight = 1,
    disableTwoHandingAttackPowerBonus = false,
    ineffectiveAttributePenalty = 0.4,
    twoHanding,
  } = options;

  const twoHandingBonus = computeTwoHandingBonus(weapon, twoHanding);

  const includedAttackPowerTypes: AttackPowerType[] = (() => {
    switch (optimizeMode) {
      case "totalAttackPower":
        return [...allDamageTypes];
      case "specificAttackPower":
        return allDamageTypes.includes(optimizeAttackPowerType) ? [optimizeAttackPowerType] : [];
      case "statusBuildup":
        return allStatusTypes.includes(optimizeAttackPowerType) ? [optimizeAttackPowerType] : [];
      case "weighted":
        return [...allAttackPowerTypes];
      default:
        return [];
    }
  })();

  const includeSpellScaling =
    optimizeMode === "spellScaling" || optimizeMode === "weighted";
  const effectiveSpellScalingWeight =
    optimizeMode === "weighted" ? Math.max(0, spellScalingWeight) : 1;
  const spellScalingType = includeSpellScaling ? getSpellScalingType(weapon) : undefined;

  const terms: ScoreTerm[] = [];

  for (const type of includedAttackPowerTypes) {
    const isDamageType = allDamageTypes.includes(type);

    const base = weapon.attack[upgradeLevel][type] ?? 0;

    if (!base) {
      continue;
    }

    const weight = optimizeMode === "weighted" ? Math.max(0, weights?.[type] ?? 1) : 1;

    const weightedBase = base * weight;
    if (!weightedBase) {
      continue;
    }

    const scalingAttributes = weapon.attackElementCorrect[type] ?? {};

    const coeff = new Float64Array(5);
    let usesMask = 0;
    let reqMask = 0;

    for (const attr of allAttributes) {
      const attributeCorrect = scalingAttributes[attr];
      if (!attributeCorrect) {
        continue;
      }

      const scalingFactor = getScalingFactor(weapon, upgradeLevel, attr, attributeCorrect);
      if (!scalingFactor) {
        continue;
      }

      const idx = attributeIndex[attr];
      coeff[idx] = weightedBase * scalingFactor;
      usesMask |= 1 << idx;
      reqMask |= 1 << idx;
    }

    // If this term has no scaling, it's still a constant contribution. Keep it.
    const req = new Uint8Array(5);
    for (const attr of allAttributes) {
      req[attributeIndex[attr]] = clampRequirementValue(weapon.requirements[attr] ?? 0);
      // Only requirements for scaling attributes matter (matches getWeaponAttack logic)
      if (scalingAttributes[attr]) {
        reqMask |= 1 << attributeIndex[attr];
      }
    }

    terms.push({
      attackPowerType: type,
      graph: weapon.calcCorrectGraphs[type],
      base: weightedBase,
      isDamageType,
      usesMask,
      reqMask,
      coeff,
      req,
    });
  }

  if (
    includeSpellScaling &&
    spellScalingType != null &&
    (weapon.sorceryTool || weapon.incantationTool) &&
    effectiveSpellScalingWeight > 0
  ) {
    const type = spellScalingType;
    const isDamageType = true;
    const weightedBase = 100 * effectiveSpellScalingWeight;

    const scalingAttributes = weapon.attackElementCorrect[type] ?? {};

    const coeff = new Float64Array(5);
    let usesMask = 0;
    let reqMask = 0;

    for (const attr of allAttributes) {
      const attributeCorrect = scalingAttributes[attr];
      if (!attributeCorrect) {
        continue;
      }

      const scalingFactor = getScalingFactor(weapon, upgradeLevel, attr, attributeCorrect);
      if (!scalingFactor) {
        continue;
      }

      const idx = attributeIndex[attr];
      coeff[idx] = weightedBase * scalingFactor;
      usesMask |= 1 << idx;
      reqMask |= 1 << idx;
    }

    const req = new Uint8Array(5);
    for (const attr of allAttributes) {
      req[attributeIndex[attr]] = clampRequirementValue(weapon.requirements[attr] ?? 0);
      if (scalingAttributes[attr]) {
        reqMask |= 1 << attributeIndex[attr];
      }
    }

    terms.push({
      attackPowerType: type,
      graph: weapon.calcCorrectGraphs[type],
      base: weightedBase,
      isDamageType,
      usesMask,
      reqMask,
      coeff,
      req,
    });
  }

  return {
    terms,
    twoHandingBonus,
    disableTwoHandingAttackPowerBonus: !!disableTwoHandingAttackPowerBonus,
    ineffectiveAttributePenalty,
  };
}

function computeTermContribution(
  term: ScoreTerm,
  model: ScoreModel,
  stats: Int16Array,
): number {
  const str = stats[0];
  const reqStr = model.twoHandingBonus ? Math.floor(str * 1.5) : str;

  // Determine whether requirements are met for any scaling attribute used by this term.
  // Note: only requirements for attributes that scale this type matter (matches getWeaponAttack).
  if (term.reqMask) {
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 1) {
      if (reqStr < term.req[0]) {
        return term.base * (1 - model.ineffectiveAttributePenalty);
      }
    }
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 2) {
      if (stats[1] < term.req[1]) {
        return term.base * (1 - model.ineffectiveAttributePenalty);
      }
    }
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 4) {
      if (stats[2] < term.req[2]) {
        return term.base * (1 - model.ineffectiveAttributePenalty);
      }
    }
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 8) {
      if (stats[3] < term.req[3]) {
        return term.base * (1 - model.ineffectiveAttributePenalty);
      }
    }
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 16) {
      if (stats[4] < term.req[4]) {
        return term.base * (1 - model.ineffectiveAttributePenalty);
      }
    }
  }

  let contribution = term.base;

  const effectiveStrForDamage =
    term.isDamageType && !model.disableTwoHandingAttackPowerBonus && model.twoHandingBonus
      ? reqStr
      : str;

  // eslint-disable-next-line no-bitwise
  if (term.usesMask & 1) {
    contribution += getEffectiveGraphValue(term.graph, effectiveStrForDamage) * term.coeff[0];
  }
  // eslint-disable-next-line no-bitwise
  if (term.usesMask & 2) {
    contribution += getEffectiveGraphValue(term.graph, stats[1]) * term.coeff[1];
  }
  // eslint-disable-next-line no-bitwise
  if (term.usesMask & 4) {
    contribution += getEffectiveGraphValue(term.graph, stats[2]) * term.coeff[2];
  }
  // eslint-disable-next-line no-bitwise
  if (term.usesMask & 8) {
    contribution += getEffectiveGraphValue(term.graph, stats[3]) * term.coeff[3];
  }
  // eslint-disable-next-line no-bitwise
  if (term.usesMask & 16) {
    contribution += getEffectiveGraphValue(term.graph, stats[4]) * term.coeff[4];
  }

  return contribution;
}

function computeScore(model: ScoreModel, stats: Int16Array) {
  let total = 0;
  for (const term of model.terms) {
    total += computeTermContribution(term, model, stats);
  }
  return total;
}

function minBaseStrForRequirement(requirement: number, twoHandingBonus: boolean) {
  if (!twoHandingBonus) {
    return clampRequirementValue(requirement);
  }
  // requirement is checked against floor(str * 1.5) when two-handing
  return clampRequirementValue(Math.ceil(clampRequirementValue(requirement) / 1.5));
}

function applyRequirementJump(
  model: ScoreModel,
  stats: Int16Array,
): { jumped: Int16Array; cost: number } {
  const required = new Uint8Array(5);

  for (const term of model.terms) {
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 1) required[0] = Math.max(required[0], term.req[0]);
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 2) required[1] = Math.max(required[1], term.req[1]);
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 4) required[2] = Math.max(required[2], term.req[2]);
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 8) required[3] = Math.max(required[3], term.req[3]);
    // eslint-disable-next-line no-bitwise
    if (term.reqMask & 16) required[4] = Math.max(required[4], term.req[4]);
  }

  const target = new Int16Array(stats);
  const targetStr = minBaseStrForRequirement(required[0], model.twoHandingBonus);
  target[0] = Math.max(target[0], targetStr);
  target[1] = Math.max(target[1], required[1]);
  target[2] = Math.max(target[2], required[2]);
  target[3] = Math.max(target[3], required[3]);
  target[4] = Math.max(target[4], required[4]);

  let cost = 0;
  for (let i = 0; i < 5; i++) {
    target[i] = clampAttributeValue(target[i]);
    cost += Math.max(0, target[i] - stats[i]);
  }

  return { jumped: target, cost };
}

function greedyAllocate(model: ScoreModel, start: Int16Array, freePoints: number) {
  const stats = new Int16Array(start);
  let pointsLeft = Math.max(0, Math.floor(freePoints));

  if (!pointsLeft || model.terms.length === 0) {
    return stats;
  }

  while (pointsLeft-- > 0) {
    let bestAttrIdx = 0;
    let bestDelta = -Infinity;
    const baseScore = computeScore(model, stats);

    for (let idx = 0; idx < 5; idx++) {
      if (stats[idx] >= 99) {
        continue;
      }
      stats[idx] += 1;
      const newScore = computeScore(model, stats);
      stats[idx] -= 1;

      const delta = newScore - baseScore;
      if (delta > bestDelta) {
        bestDelta = delta;
        bestAttrIdx = idx;
      }
    }

    if (stats[bestAttrIdx] >= 99) {
      break;
    }

    stats[bestAttrIdx] += 1;
  }

  return stats;
}

/**
 * Greedy optimizer that allocates up to `freeStatPoints` across STR/DEX/INT/FAI/ARC (capped at 99)
 * to maximize the selected metric for the given weapon.
 *
 * The final displayed attack power/spell scaling is always computed via getWeaponAttack() to match
 * the project's canonical logic exactly.
 */
export function optimizeWeaponAttributes(options: OptimizeWeaponOptions): OptimizeWeaponResult {
  const {
    weapon,
    attributes,
    freeStatPoints,
    twoHanding,
    upgradeLevel,
    disableTwoHandingAttackPowerBonus,
    ineffectiveAttributePenalty,
  } = options;

  const model = buildScoreModel(options);

  const stats = new Int16Array(5);
  stats[0] = clampAttributeValue(attributes.str);
  stats[1] = clampAttributeValue(attributes.dex);
  stats[2] = clampAttributeValue(attributes.int);
  stats[3] = clampAttributeValue(attributes.fai);
  stats[4] = clampAttributeValue(attributes.arc);

  const greedyStats = greedyAllocate(model, stats, freeStatPoints);
  let bestStats = greedyStats;
  let bestScore = computeScore(model, greedyStats);

  // Requirements-aware branch:
  // If we can afford to "jump" to meet relevant requirements, do so and then continue greedily.
  const { jumped, cost } = applyRequirementJump(model, stats);
  if (cost > 0 && cost <= freeStatPoints) {
    const jumpedGreedyStats = greedyAllocate(model, jumped, freeStatPoints - cost);
    const jumpedScore = computeScore(model, jumpedGreedyStats);
    if (jumpedScore > bestScore) {
      bestScore = jumpedScore;
      bestStats = jumpedGreedyStats;
    }
  }

  const optimizedAttributes: Attributes = {
    str: bestStats[0],
    dex: bestStats[1],
    int: bestStats[2],
    fai: bestStats[3],
    arc: bestStats[4],
  };

  // Canonical final result must use the project's existing calculation logic (incl. forced two-handing).
  // We also run adjustAttributesForTwoHanding indirectly via getWeaponAttack.
  const optimizedAttackResult = getWeaponAttack({
    weapon,
    attributes: optimizedAttributes,
    twoHanding,
    upgradeLevel,
    disableTwoHandingAttackPowerBonus,
    ineffectiveAttributePenalty,
  });

  return { optimizedAttributes, optimizedAttackResult };
}

export function getMaxFreeStatPoints(attributes: Attributes) {
  return Math.max(
    0,
    99 * 5 - (attributes.str + attributes.dex + attributes.int + attributes.fai + attributes.arc),
  );
}
