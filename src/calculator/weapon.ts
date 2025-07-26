import type { Attribute } from "./attributes.ts";
import type { AttackPowerType } from "./attackPowerTypes.ts";
import type { WeaponType } from "./weaponTypes.ts";

export type AttackElementCorrect = Partial<
  Record<AttackPowerType, Partial<Record<Attribute, number | true>>>
>;

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
   * A (rarely-used) modifier to differentiate variants of weapons beyond what's shown in-game
   */
  variant?: string;

  /**
   * A wiki link for the weapon
   */
  url: string | null;

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
   * Base attack power for each damage type, status effect, and spell scaling at each upgrade level
   */
  attack: Partial<Record<AttackPowerType, number>>[];

  /**
   * Critical stat of the weapon, used for critical damage calculations
   */
  critical: number;

  /**
   * Critical damage multiplier, typically determined by the weapon type
   */
  criticalMultiplier?: Partial<Record<AttackPowerType, number>>;

  /**
   * Map indicating which damage types scale with which player attributes
   */
  attackElementCorrect: AttackElementCorrect;

  /**
   * Map indicating which scaling curve is used for each damage type, status effect, or spell scaling
   */
  calcCorrectGraphs: Record<AttackPowerType, number[]>;

  /**
   * True if the weapon doesn't get a strength bonus when two-handing
   */
  paired?: boolean;

  /**
   * True if this weapon can cast glintstone sorceries
   */
  sorceryTool?: boolean;

  /**
   * True if this weapon can cast incantations
   */
  incantationTool?: boolean;

  /**
   * Thresholds and labels for each scaling grade (S, A, B, etc.) for this weapon. This isn't
   * hardcoded for all weapons because it can be changed by mods.
   */
  scalingTiers: [number, string][];

  /**
   * If true, this weapon is from the Shadow of the Erdtree expansion
   */
  dlc: boolean;
}
