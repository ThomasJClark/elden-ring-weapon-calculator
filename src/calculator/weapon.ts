import type { Attribute } from "./attributes";
import type { DamageType } from "./damageTypes";
import type { WeaponType } from "./weaponTypes";

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
   * Base attack power for each damage type and status effect at each upgrade level
   */
  attack: Partial<Record<DamageType, number>>[];

  /**
   * Map indicating which damage types scale with which player attributes
   */
  attackElementCorrect: Partial<Record<DamageType, Attribute[]>>;

  /**
   * Map indicating which scaling curve is used for each damage type or status effect
   */
  calcCorrectGraphs: Record<DamageType, number[]>;

  /**
   * True if the weapon doesn't get a strength bonus when two-handing
   */
  paired?: boolean;
}
