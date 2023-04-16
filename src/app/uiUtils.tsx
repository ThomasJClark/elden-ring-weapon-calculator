import { Attribute, DamageType, StatusType } from "../calculator/calculator";
import specialWeaponIcon from "./img/specialWeapon.webp";
import standardAffinityIcon from "./img/standardAffinity.webp";
import heavyAffinityIcon from "./img/heavyAffinity.webp";
import keenAffinityIcon from "./img/keenAffinity.webp";
import qualityAffinityIcon from "./img/qualityAffinity.webp";
import magicAffinityIcon from "./img/magicAffinity.webp";
import coldAffinityIcon from "./img/coldAffinity.webp";
import fireAffinityIcon from "./img/fireAffinity.webp";
import lightningAffinityIcon from "./img/lightningAffinity.webp";
import sacredAffinityIcon from "./img/sacredAffinity.webp";
import poisonAffinityIcon from "./img/poisonAffinity.webp";
import bloodAffinityIcon from "./img/bloodAffinity.webp";
import occultAffinityIcon from "./img/occultAffinity.webp";
import scarletRotStatusIcon from "./img/scarletRotStatus.webp";
import madnessStatusIcon from "./img/madnessStatus.webp";
import sleepStatusIcon from "./img/sleepStatus.webp";
import frostStatusIcon from "./img/frostStatus.webp";
import poisonStatusIcon from "./img/poisonStatus.webp";
import bleedStatusIcon from "./img/bleedStatus.webp";

export function getAffinityDisplay(affinityId: number) {
  switch (affinityId) {
    // Special fake affinity ID for uninfusable weapons
    case -1:
      return { label: "Unique", icon: specialWeaponIcon };

    case 0:
      return { label: "Standard", icon: standardAffinityIcon };
    case 100:
      return { label: "Heavy", icon: heavyAffinityIcon };
    case 200:
      return { label: "Keen", icon: keenAffinityIcon };
    case 300:
      return { label: "Quality", icon: qualityAffinityIcon };
    case 400:
      return { label: "Fire", icon: fireAffinityIcon };
    case 500:
      return { label: "Flame Art", icon: fireAffinityIcon };
    case 600:
      return { label: "Lightning", icon: lightningAffinityIcon };
    case 700:
      return { label: "Sacred", icon: sacredAffinityIcon };
    case 800:
      return { label: "Magic", icon: magicAffinityIcon };
    case 900:
      return { label: "Cold", icon: coldAffinityIcon };
    case 1000:
      return { label: "Poison", icon: poisonAffinityIcon };
    case 1100:
      return { label: "Blood", icon: bloodAffinityIcon };
    case 1200:
      return { label: "Occult", icon: occultAffinityIcon };

    default:
      throw new Error(`Unknown affinity ID: ${affinityId}`);
  }
}

export function getDamageTypeLabel(damageType: DamageType) {
  switch (damageType) {
    case "physical":
      return "Physical";
    case "magic":
      return "Magic";
    case "fire":
      return "Fire";
    case "lightning":
      return "Lightning";
    case "holy":
      return "Holy";
  }
}

export function getDamageTypeIcon(damageType: DamageType): string {
  switch (damageType) {
    case "physical":
      return standardAffinityIcon;
    case "magic":
      return magicAffinityIcon;
    case "fire":
      return fireAffinityIcon;
    case "lightning":
      return lightningAffinityIcon;
    case "holy":
      return sacredAffinityIcon;
  }
}

export function getStatusTypeIcon(statusType: StatusType): string {
  switch (statusType) {
    case "Scarlet Rot":
      return scarletRotStatusIcon;
    case "Madness":
      return madnessStatusIcon;
    case "Sleep":
      return sleepStatusIcon;
    case "Frost":
      return frostStatusIcon;
    case "Poison":
      return poisonStatusIcon;
    case "Bleed":
      return bleedStatusIcon;
  }
}

export function getAttributeLabel(attribute: Attribute) {
  switch (attribute) {
    case "str":
      return "Strength";
    case "dex":
      return "Dexterity";
    case "int":
      return "Intelligence";
    case "fai":
      return "Faith";
    case "arc":
      return "Arcane";
  }
}

export function getShortAttributeLabel(attribute: Attribute) {
  switch (attribute) {
    case "str":
      return "Str";
    case "dex":
      return "Dex";
    case "int":
      return "Int";
    case "fai":
      return "Fai";
    case "arc":
      return "Arc";
  }
}

export function getScalingLabel(scaling: number) {
  if (scaling > 1.75) {
    return "S";
  } else if (scaling >= 1.4) {
    return "A";
  } else if (scaling >= 0.9) {
    return "B";
  } else if (scaling >= 0.6) {
    return "C";
  } else if (scaling >= 0.25) {
    return "D";
  } else if (scaling > 0) {
    return "E";
  } else {
    return "-";
  }
}

export function getTotalAttackPower(attackPower: Partial<Record<DamageType, number>>) {
  return Object.values(attackPower).reduce(
    (totalAttackPower, damageTypeAttackPower) => totalAttackPower + damageTypeAttackPower,
    0,
  );
}
