import type {
  Affinity,
  Attribute,
  DamageType,
  MaxUpgradeLevel,
  StatusType,
  WeaponType,
} from "./utils";

export interface Weapon {
  /**
   * The full unique name of the weapon, e.g. "Heavy Nightrider Glaive +25"
   */
  name: string;

  /**
   * Extra info for searching/filtering that doesn't affect the attack rating calculation
   */
  metadata: WeaponMetadata;

  /**
   * Player attribute requirements to use the weapon effectively (without an attack rating penalty)
   */
  requirements: Partial<Record<Attribute, number>>;

  /**
   * Base attack rating for each damage type
   */
  attack: Partial<Record<DamageType, number>>;

  /**
   * Scaling amount for each player attribute
   */
  attributeScaling: Partial<Record<Attribute, number>>;

  /**
   * Map indicating which damage types scale with which player attributes
   */
  damageScalingAttributes: Partial<Record<DamageType, Attribute[]>>;

  /**
   * Map indicating which scaling curve is used for each damage type
   */
  damageScalingCurves: Partial<Record<DamageType, WeaponScalingCurve>>;

  /**
   * Map indicating the base buildup amount for any status effects this weapon has
   */
  statuses: Partial<Record<StatusType, number>>;

  /**
   * True if the weapon doesn't get a strength bonus when two-handing
   */
  paired: boolean;
}

export type WeaponScalingCurve = 0 | 1 | 2 | 4 | 7 | 8 | 12 | 14 | 15 | 16;

export interface WeaponMetadata {
  weight: number;
  upgradeLevel: number;
  maxUpgradeLevel: MaxUpgradeLevel;
  weaponName: string;
  affinity: Affinity;
  weaponType: WeaponType;
}
