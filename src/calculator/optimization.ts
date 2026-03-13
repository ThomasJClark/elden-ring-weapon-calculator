import type { AttackPowerType } from "./attackPowerTypes.ts";

export type OptimizeMode =
  | "none"
  | "totalAttackPower"
  | "specificAttackPower"
  | "statusBuildup"
  | "spellScaling"
  | "weighted";

export type OptimizationWeights = Partial<Record<AttackPowerType, number>>;

