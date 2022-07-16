import { Affinity, AttackPower, Attribute, DamageType, StatusType } from "../calculator/calculator";
import noAffinityIcon from "./img/noAffinity.webp";
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

export function getAffinityLabel(affinity: Affinity) {
  switch (affinity) {
    case "None":
      return "Standard";
    default:
      return affinity;
  }
}

export function getAffinityIcon(affinity: Affinity) {
  switch (affinity) {
    case "None":
      return noAffinityIcon;
    case "Heavy":
      return heavyAffinityIcon;
    case "Keen":
      return keenAffinityIcon;
    case "Quality":
      return qualityAffinityIcon;
    case "Magic":
      return magicAffinityIcon;
    case "Cold":
      return coldAffinityIcon;
    case "Fire":
    case "Flame Art":
      return fireAffinityIcon;
    case "Lightning":
      return lightningAffinityIcon;
    case "Sacred":
      return sacredAffinityIcon;
    case "Poison":
      return poisonAffinityIcon;
    case "Blood":
      return bloodAffinityIcon;
    case "Occult":
      return occultAffinityIcon;
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

export function getDamageTypeIcon(damageType: DamageType) {
  switch (damageType) {
    case "physical":
      return noAffinityIcon;
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

export function getStatusTypeIcon(statusType: StatusType) {
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

export function getDamageTypeAttackPower(
  attackRating: Partial<Record<DamageType, AttackPower>>,
  damageType: DamageType,
) {
  const attackPower = attackRating[damageType];
  return attackPower != null ? attackPower.baseAttackPower + attackPower.scalingAttackPower : 0;
}

export function getTotalAttackPower(attackRating: Partial<Record<DamageType, AttackPower>>) {
  return Object.values(attackRating).reduce(
    (totalAttackPower, attackPower) =>
      totalAttackPower + attackPower.baseAttackPower + attackPower.scalingAttackPower,
    0,
  );
}
