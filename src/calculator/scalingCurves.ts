import { WeaponScalingCurve } from "./weapon";

/**
 * These determine how much a player attribute affects scaling damage, as a percentage of the
 * weapon's base attack multiplied by its scaling.
 */
export const damageScalingCurves: Record<WeaponScalingCurve, (attributeValue: number) => number> = {
  0: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.9 + 0.2 * ((attributeValue - 80) / 70);
    } else if (attributeValue > 60) {
      return 0.75 + 0.15 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 18) {
      return 0.25 + 0.5 * (1 - (1 - (attributeValue - 18) / 42) ** 1.2);
    } else {
      return 0.25 * ((attributeValue - 1) / 17) ** 1.2;
    }
  },
  1: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.9 + 0.2 * ((attributeValue - 80) / 70);
    } else if (attributeValue > 60) {
      return 0.75 + 0.15 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 20) {
      return 0.35 + 0.4 * (1 - (1 - (attributeValue - 20) / 40) ** 1.2);
    } else {
      return 0.35 * ((attributeValue - 1) / 19) ** 1.2;
    }
  },
  2: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.9 + 0.2 * ((attributeValue - 80) / 70);
    } else if (attributeValue > 60) {
      return 0.75 + 0.15 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 20) {
      return 0.35 + 0.4 * (1 - (1 - (attributeValue - 20) / 40) ** 1.2);
    } else {
      return 0.35 * ((attributeValue - 1) / 19) ** 1.2;
    }
  },
  4: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.95 + 0.05 * ((attributeValue - 80) / 19);
    } else if (attributeValue > 50) {
      return 0.8 + 0.15 * ((attributeValue - 50) / 30);
    } else if (attributeValue > 20) {
      return 0.4 + 0.4 * ((attributeValue - 20) / 30);
    } else {
      return (0.4 * (attributeValue - 1)) / 19;
    }
  },
  7: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.9 + 0.2 * ((attributeValue - 80) / 70);
    } else if (attributeValue > 60) {
      return 0.75 + 0.15 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 20) {
      return 0.35 + 0.4 * (1 - (1 - (attributeValue - 20) / 40) ** 1.2);
    } else {
      return 0.35 * ((attributeValue - 1) / 19) ** 1.2;
    }
  },
  8: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.9 + 0.2 * ((attributeValue - 80) / 70);
    } else if (attributeValue > 60) {
      return 0.75 + 0.15 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 16) {
      return 0.25 + 0.5 * (1 - (1 - (attributeValue - 16) / 44) ** 1.2);
    } else {
      return 0.25 * ((attributeValue - 1) / 15) ** 1.2;
    }
  },
  12: (attributeValue) => {
    if (attributeValue > 45) {
      return 0.75 + 0.25 * ((attributeValue - 45) / 54);
    } else if (attributeValue > 30) {
      return 0.55 + 0.2 * ((attributeValue - 30) / 15);
    } else if (attributeValue > 15) {
      return 0.1 + 0.45 * ((attributeValue - 15) / 15);
    } else {
      return 0.1 * ((attributeValue - 1) / 14);
    }
  },
  14: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.85 + 0.15 * ((attributeValue - 80) / 19);
    } else if (attributeValue > 40) {
      return 0.6 + 0.25 * ((attributeValue - 40) / 40);
    } else if (attributeValue > 20) {
      return 0.4 + 0.2 * ((attributeValue - 20) / 20);
    } else {
      return 0.4 * ((attributeValue - 1) / 19);
    }
  },
  15: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.95 + 0.5 * ((attributeValue - 80) / 19);
    } else if (attributeValue > 60) {
      return 0.65 + 0.3 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 25) {
      return 0.25 + 0.4 * ((attributeValue - 25) / 35);
    } else {
      return 0.25 * ((attributeValue - 1) / 24);
    }
  },
  16: (attributeValue) => {
    if (attributeValue > 80) {
      return 0.9 + 0.1 * ((attributeValue - 80) / 19);
    } else if (attributeValue > 60) {
      return 0.75 + 0.15 * ((attributeValue - 60) / 20);
    } else if (attributeValue > 18) {
      return 0.2 + 0.55 * ((attributeValue - 18) / 42);
    } else {
      return 0.2 * ((attributeValue - 1) / 17);
    }
  },
};

/**
 * Unique scaling curve used for arcane scaling for status effect buildup
 */
export function statusCurve(attributeValue: number) {
  if (attributeValue > 60) {
    return 0.9 + (0.1 * (attributeValue - 60)) / 39;
  } else if (attributeValue > 45) {
    return 0.75 + (0.15 * (attributeValue - 45)) / 15;
  } else if (attributeValue > 25) {
    return 0.1 + (0.65 * (attributeValue - 25)) / 20;
  } else {
    return 0.1 * ((attributeValue - 1) / 24);
  }
}
