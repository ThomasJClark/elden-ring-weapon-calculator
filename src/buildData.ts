/*
 * Build-time script that generates a single JSON file of weapon stats from the various Elden Ring
 * Weapon Calculator spreadsheets
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { cwd, argv } from "process";
import {
  damageTypes,
  Affinity,
  WeaponType,
  Weapon,
  WeaponScalingCurve,
} from "./calculator/calculator";

/**
 * Load a map from a spreadsheet where the first column is the key
 */
const loadSpreadsheet = <T>(path: string, mapper: (columns: string[]) => T) =>
  new Map<string, T>(
    readFileSync(path, "utf-8")
      .split("\n")
      .slice(1)
      .map((row) => row.trim().split(","))
      .map(([weaponName, ...columns]) => [weaponName, mapper(columns)]),
  );

/**
 * Load a map from a spreadsheet where the first column is the key, and the remaining columns
 * are partitioned by upgrade level
 */
const loadSpreadsheetByLevel = <T>(
  path: string,
  columnCount: number,
  mapper: (columns: string[]) => T,
) =>
  loadSpreadsheet<T[]>(path, (columns) =>
    Array.from({ length: Math.floor(columns.length / columnCount) }, (_, upgradeLevel) =>
      mapper(columns.slice(upgradeLevel * columnCount, (upgradeLevel + 1) * columnCount)),
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
    ([
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
    ]) => ({
      metadata: {
        weaponName,
        affinity: affinity as Affinity,
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

  return [...attackMap.keys()].flatMap((weaponNameWithoutUpgradeLevel) => {
    const attackByLevel = attackMap.get(weaponNameWithoutUpgradeLevel)!;
    const attributeScalingByLevel = attributeScalingMap.get(weaponNameWithoutUpgradeLevel)!;
    const { metadata, requirements } = extraDataMap.get(weaponNameWithoutUpgradeLevel)!;
    const { attackElementCorrectId, damageScalingCurves } = calcCorrectMap.get(
      weaponNameWithoutUpgradeLevel,
    )!;
    const damageScalingAttributes = attackElementCorrect.get(attackElementCorrectId)!;

    return Array.from({ length: metadata.maxUpgradeLevel + 1 }, (_, upgradeLevel) => {
      const attack = attackByLevel[upgradeLevel];
      const attributeScaling = attributeScalingByLevel[upgradeLevel];

      const weapon = {
        name: `${weaponNameWithoutUpgradeLevel} +${upgradeLevel}`,
        metadata: { ...metadata, upgradeLevel },
        requirements,
        attack,
        attributeScaling,
        damageScalingAttributes: { ...damageScalingAttributes },
        damageScalingCurves: { ...damageScalingCurves },
      };

      damageTypes.forEach((damageType) => {
        if (damageType in weapon.damageScalingAttributes) {
          // Only include attributes that this weapon actually scales with
          weapon.damageScalingAttributes[damageType] = weapon.damageScalingAttributes[
            damageType
          ]!.filter((attribute) => weapon.attributeScaling[attribute]);

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
writeFileSync(outputPath, JSON.stringify(weapons));
