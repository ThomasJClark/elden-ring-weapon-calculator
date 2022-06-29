import { Attribute, DamageType } from "../calculator/calculator";
import standardIcon from "./standard.png";
import magicIcon from "./magic.png";
import fireIcon from "./fire.png";
import lightningIcon from "./lightning.png";
import sacredIcon from "./sacred.png";

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
      return standardIcon;
    case "magic":
      return magicIcon;
    case "fire":
      return fireIcon;
    case "lightning":
      return lightningIcon;
    case "holy":
      return sacredIcon;
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
