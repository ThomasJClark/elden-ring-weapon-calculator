import { Affinity, Attribute, DamageType } from "../calculator/calculator";
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
