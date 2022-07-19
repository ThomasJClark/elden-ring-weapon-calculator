/*
 * Build-time script that generates a single JSON file of weapon stats from the various Elden Ring
 * Weapon Calculator spreadsheets
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { cwd, argv } from "process";
import {
  allDamageTypes,
  Affinity,
  WeaponType,
  Weapon,
  WeaponScalingCurve,
  StatusType,
} from "./calculator/calculator";
import { encodeWeapon } from "./weaponCodec";

function getTrueBaseWeaponName(baseWeaponName: string) {
  // Include the accent marks which are missing from the spreadsheet
  if (baseWeaponName.includes("Epee")) {
    return baseWeaponName.replace("Epee", "Épée");
  }
  if (baseWeaponName.includes("Misericorde")) {
    return baseWeaponName.replace("Misericorde", "Miséricorde");
  }
  return baseWeaponName;
}

function getTrueWeaponName(weaponName: string) {
  // I think this is an error in the spreadsheet - "Sacred" was searched & replaced out of all
  // weapon names
  if (weaponName === "Relic Sword") {
    return "Sacred Relic Sword";
  }
  if (weaponName === "Mohgwyn's Spear") {
    return "Mohgwyn's Sacred Spear";
  }
  return weaponName;
}

/**
 * Load a map from a spreadsheet where the first column is the key
 */
const loadSpreadsheet = <T>(path: string, mapper: (columns: string[], key: string) => T) =>
  new Map<string, T>(
    readFileSync(path, "utf-8")
      .split("\n")
      .slice(1)
      .map((row) => row.trim().split(","))
      .map(([key, ...columns]) => [key.toUpperCase(), mapper(columns, key)]),
  );

/**
 * Load a map from a spreadsheet where the first column is the key, and the remaining columns
 * are partitioned by upgrade level
 */
const loadSpreadsheetByLevel = <T>(
  path: string,
  columnCount: number,
  mapper: (columns: string[], key: string) => T,
) =>
  loadSpreadsheet<T[]>(path, (columns, key) =>
    Array.from({ length: Math.floor(columns.length / columnCount) }, (_, upgradeLevel) =>
      mapper(columns.slice(upgradeLevel * columnCount, (upgradeLevel + 1) * columnCount), key),
    ),
  );

/**
 * Load the weapon data from the Elden Ring Weapon Calculator spreadsheets
 */
const loadWeapons = (): Weapon[] => {
  const attackMap = loadSpreadsheetByLevel(
    resolve(cwd(), "data/attack.csv"),
    6, // 5 damage types, plus stamina damage (ignored)
    ([physical, magic, fire, lightning, holy]) => ({
      physical: parseFloat(physical) || undefined,
      magic: parseFloat(magic) || undefined,
      fire: parseFloat(fire) || undefined,
      lightning: parseFloat(lightning) || undefined,
      holy: parseFloat(holy) || undefined,
    }),
  );

  const attributeScalingMap = loadSpreadsheetByLevel(
    resolve(cwd(), "data/scaling.csv"),
    5,
    ([str, dex, int, fai, arc]) => ({
      str: parseFloat(str) || undefined,
      dex: parseFloat(dex) || undefined,
      int: parseFloat(int) || undefined,
      fai: parseFloat(fai) || undefined,
      arc: parseFloat(arc) || undefined,
    }),
  );

  const extraDataMap = loadSpreadsheet(
    resolve(cwd(), "data/extraData.csv"),
    (
      [
        weaponName,
        affinity,
        ,
        maxUpgradeLevel,
        strRequirement,
        dexRequirement,
        intRequirement,
        faiRequirement,
        arcRequirement,
        ,
        weight,
        weaponType,
      ],
      baseWeaponName,
    ) => ({
      baseWeaponName: getTrueBaseWeaponName(baseWeaponName),
      metadata: {
        weaponName: getTrueWeaponName(weaponName),
        affinity: affinity as Affinity, // Note: this technically can contain "None" which is fixed below
        maxUpgradeLevel: parseInt(maxUpgradeLevel, 10) as 10 | 25,
        weight: parseFloat(weight),
        weaponType: weaponType as WeaponType,
      },
      requirements: {
        str: parseInt(strRequirement, 10) || undefined,
        dex: parseInt(dexRequirement, 10) || undefined,
        int: parseInt(intRequirement, 10) || undefined,
        fai: parseInt(faiRequirement, 10) || undefined,
        arc: parseInt(arcRequirement, 10) || undefined,
      },
    }),
  );

  const calcCorrectMap = loadSpreadsheet(
    resolve(cwd(), "data/calcCorrectGraph.csv"),
    ([physical, magic, fire, lightning, holy, attackElementCorrectId]): {
      attackElementCorrectId: string;
      damageScalingCurves: Weapon["damageScalingCurves"];
    } => ({
      attackElementCorrectId,
      damageScalingCurves: {
        physical: parseInt(physical) as WeaponScalingCurve,
        magic: parseInt(magic) as WeaponScalingCurve,
        fire: parseInt(fire) as WeaponScalingCurve,
        lightning: parseInt(lightning) as WeaponScalingCurve,
        holy: parseInt(holy) as WeaponScalingCurve,
      },
    }),
  );

  const attackElementCorrect = loadSpreadsheet(
    resolve(cwd(), "data/attackElementCorrect.csv"),
    ([
      physicalScalesOnStr,
      physicalScalesOnDex,
      physicalScalesOnInt,
      physicalScalesOnFai,
      physicalScalesOnArc,
      magicScalesOnStr,
      magicScalesOnDex,
      magicScalesOnInt,
      magicScalesOnFai,
      magicScalesOnArc,
      fireScalesOnStr,
      fireScalesOnDex,
      fireScalesOnInt,
      fireScalesOnFai,
      fireScalesOnArc,
      lightningScalesOnStr,
      lightningScalesOnDex,
      lightningScalesOnInt,
      lightningScalesOnFai,
      lightningScalesOnArc,
      holyScalesOnStr,
      holyScalesOnDex,
      holyScalesOnInt,
      holyScalesOnFai,
      holyScalesOnArc,
    ]) => {
      const map: Weapon["damageScalingAttributes"] = {};

      if (physicalScalesOnStr === "1") (map.physical = map.physical || []).push("str");
      if (physicalScalesOnDex === "1") (map.physical = map.physical || []).push("dex");
      if (physicalScalesOnInt === "1") (map.physical = map.physical || []).push("int");
      if (physicalScalesOnFai === "1") (map.physical = map.physical || []).push("fai");
      if (physicalScalesOnArc === "1") (map.physical = map.physical || []).push("arc");
      if (magicScalesOnStr === "1") (map.magic = map.magic || []).push("str");
      if (magicScalesOnDex === "1") (map.magic = map.magic || []).push("dex");
      if (magicScalesOnInt === "1") (map.magic = map.magic || []).push("int");
      if (magicScalesOnFai === "1") (map.magic = map.magic || []).push("fai");
      if (magicScalesOnArc === "1") (map.magic = map.magic || []).push("arc");
      if (fireScalesOnStr === "1") (map.fire = map.fire || []).push("str");
      if (fireScalesOnDex === "1") (map.fire = map.fire || []).push("dex");
      if (fireScalesOnInt === "1") (map.fire = map.fire || []).push("int");
      if (fireScalesOnFai === "1") (map.fire = map.fire || []).push("fai");
      if (fireScalesOnArc === "1") (map.fire = map.fire || []).push("arc");
      if (lightningScalesOnStr === "1") (map.lightning = map.lightning || []).push("str");
      if (lightningScalesOnDex === "1") (map.lightning = map.lightning || []).push("dex");
      if (lightningScalesOnInt === "1") (map.lightning = map.lightning || []).push("int");
      if (lightningScalesOnFai === "1") (map.lightning = map.lightning || []).push("fai");
      if (lightningScalesOnArc === "1") (map.lightning = map.lightning || []).push("arc");
      if (holyScalesOnStr === "1") (map.holy = map.holy || []).push("str");
      if (holyScalesOnDex === "1") (map.holy = map.holy || []).push("dex");
      if (holyScalesOnInt === "1") (map.holy = map.holy || []).push("int");
      if (holyScalesOnFai === "1") (map.holy = map.holy || []).push("fai");
      if (holyScalesOnArc === "1") (map.holy = map.holy || []).push("arc");

      return map;
    },
  );

  const statusMap = loadSpreadsheet(
    resolve(cwd(), "data/status.csv"),
    ([, , scarletRot, madness, sleep, ...columns], weaponName) =>
      Array.from({ length: Math.floor(columns.length / 3) }, (_, upgradeLevel) => {
        const [frost, poison, bleed] = columns.slice(upgradeLevel * 3, (upgradeLevel + 1) * 3);

        const statusBuildup: Partial<Record<StatusType, number>> = {};

        if (scarletRot !== "0") statusBuildup["Scarlet Rot"] = +scarletRot;
        if (madness !== "0") statusBuildup["Madness"] = +madness;
        if (sleep !== "0") statusBuildup["Sleep"] = +sleep;
        if (frost !== "0") statusBuildup["Frost"] = +frost;
        if (poison !== "0") statusBuildup["Poison"] = +poison;
        if (bleed !== "0") statusBuildup["Bleed"] = +bleed;

        // Cold antspur rapier is bugged? It apparently gains more scarlet rot buildup up to +5,
        // then loses it at +6 and above
        if (weaponName === "Cold Antspur Rapier") {
          if (upgradeLevel < 6) {
            statusBuildup["Scarlet Rot"] = 50 + 5 * upgradeLevel;
          } else {
            delete statusBuildup["Scarlet Rot"];
          }
        }

        // TODO: test Poison/Blood Fingerprint Stone Shield. /u/TarnishedSpreadsheet's spreadsheet
        // has some shenanagins and I don't understand how they would change things

        if (Object.values(statusBuildup).some((value) => value !== 0)) {
          return statusBuildup;
        }

        return undefined;
      }),
  );

  // The raw spreadsheets list all weapons without an affinity as "None". Separate special weapons
  // that can't be infused from standard weapons that are not currently infused.
  const infusableWeaponNames = new Set<string>();
  extraDataMap.forEach(({ metadata }) => {
    if ((metadata.affinity as Affinity | "None") !== "None") {
      infusableWeaponNames.add(metadata.weaponName);
    }
  });
  extraDataMap.forEach(({ metadata }) => {
    if ((metadata.affinity as Affinity | "None") === "None") {
      metadata.affinity = infusableWeaponNames.has(metadata.weaponName) ? "Standard" : "Special";
    }
  });

  return [...attackMap.keys()].flatMap((weaponKey) => {
    const attackByLevel = attackMap.get(weaponKey)!;
    const statusBuildupsByLevel = statusMap.get(weaponKey);
    const attributeScalingByLevel = attributeScalingMap.get(weaponKey)!;
    const { baseWeaponName, metadata, requirements } = extraDataMap.get(weaponKey)!;
    const { attackElementCorrectId, damageScalingCurves } = calcCorrectMap.get(weaponKey)!;
    const damageScalingAttributes = attackElementCorrect.get(attackElementCorrectId)!;

    return Array.from({ length: metadata.maxUpgradeLevel + 1 }, (_, upgradeLevel) => {
      const attack = attackByLevel[upgradeLevel];
      const attributeScaling = attributeScalingByLevel[upgradeLevel];

      const weapon = {
        name: upgradeLevel > 0 ? `${baseWeaponName} +${upgradeLevel}` : baseWeaponName,
        metadata: {
          ...metadata,
          upgradeLevel,
        },
        requirements,
        attack,
        attributeScaling,
        damageScalingAttributes: { ...damageScalingAttributes },
        damageScalingCurves: { ...damageScalingCurves },
        statuses: statusBuildupsByLevel?.[upgradeLevel] ?? {},
      };

      allDamageTypes.forEach((damageType) => {
        if (damageType in weapon.damageScalingAttributes) {
          // Only include attributes that affect the weapon's attack power
          weapon.damageScalingAttributes[damageType] = weapon.damageScalingAttributes[
            damageType
          ]!.filter(
            (attribute) => weapon.attributeScaling[attribute] || weapon.requirements[attribute],
          );

          // Do not include any scaling information if this weapon doesn't deal this damage type,
          // or the damage type doesn't scale with any attributes.
          if (!attack[damageType] || weapon.damageScalingAttributes[damageType]!.length === 0) {
            delete weapon.damageScalingAttributes[damageType];
            delete weapon.damageScalingCurves[damageType];
          }
        }
      });

      return weapon;
    });
  });
};

const weapons = loadWeapons();

const outputPath = resolve(cwd(), argv[2]);
writeFileSync(
  outputPath,
  JSON.stringify(
    weapons
      .map(encodeWeapon)
      .map((encodedWeapon) => encodedWeapon.filter((field) => field !== undefined)),
  ),
);
