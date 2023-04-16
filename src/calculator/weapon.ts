import type { Attribute, DamageType, StatusType, WeaponType } from "./utils";

export interface Weapon {
  /**
   * The full unique name of the weapon, e.g. "Heavy Nightrider Glaive"
   */
  name: string;

  /**
   * The base weapon name without an affinity specified, e.g. "Nightrider Glaive"
   */
  weaponName: string;

  /**
   * The affinity of the weapon for filtering, see uiUtils.tsx for a full list of vanilla affinities
   */
  affinityId: number;

  /**
   * The category of the weapon for filtering
   */
  weaponType: WeaponType;

  /**
   * Player attribute requirements to use the weapon effectively (without an attack rating penalty)
   */
  requirements: Partial<Record<Attribute, number>>;

  /**
   * Scaling amount for each player attribute at each upgrade level
   */
  attributeScaling: Partial<Record<Attribute, number>>[];

  /**
   * Base attack power for each damage type and status effect at each upgrade level
   */
  attack: Partial<Record<DamageType | StatusType, number>>[];

  /**
   * Map indicating which damage types scale with which player attributes
   */
  attackElementCorrect: Partial<Record<DamageType, Attribute[]>>;

  /**
   * Map indicating which scaling curve is used for each damage type or status effect
   */
  calcCorrectGraphs: Record<DamageType | StatusType, CalcCorrectGraph>;

  /**
   * True if the weapon doesn't get a strength bonus when two-handing
   */
  paired: boolean;
}

export type CalcCorrectGraph = {
  /** The highest attribute value where this stage applies (i.e. the "soft cap") */
  maxVal: number;
  /** The highest scaling value within this stage */
  maxGrowVal: number;
  /** Exponent used for non-linear scaling curves */
  adjPt: number;
}[];
