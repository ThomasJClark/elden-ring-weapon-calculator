/*
 * Usage: yarn rebuildWeaponData
 */
import { readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import makeDebug from "debug";
import { Attribute, WeaponType, DamageType } from "./calculator/calculator";
import {
  type EncodedWeaponJson,
  type EncodedRegulationDataJson,
  type ReinforceParamWeapon,
  type CalcCorrectGraph,
  defaultStatusCalcCorrectGraphId,
  defaultDamageCalcCorrectGraphId,
} from "./regulationData";

const debug = makeDebug("buildData");

interface CsvRow {
  name: string;
  data: {
    [key: string]: number;
  };
}

/**
 * Parse a CSV file with "ID", "Name", and numeric columns
 */
function readCsv(filename: string): Map<number, CsvRow> {
  const [cols, ...lines] = readFileSync(filename, "utf-8")
    .split("\n")
    .filter((row) => !!row)
    .map((row) => row.split(","));

  return new Map<number, CsvRow>(
    lines.map((line) => {
      let name: string = "";
      const data: { [key: string]: number } = {};

      cols.forEach((key, index) => {
        if (key === "Name") {
          name = line[index];
        } else if (key) {
          data[key] = +line[index];
        }
      });

      return [data.ID, { name, data }];
    }),
  );
}

/**
 * Parse a .fmg.json file, which contains translation strings displayed in game
 */
function readFmgJson(filename: string): Map<number, string | null> {
  const json = JSON.parse(readFileSync(filename, "utf-8"));
  return new Map(json.Fmg.Entries.map(({ ID, Text }: any) => [ID, Text]));
}

const dataDir = process.argv[2];
const isReforged = dataDir.includes("reforged");
const isVanilla = !isReforged;
const outputFile = join("public", `regulation-${basename(dataDir)}.js`);

const urlOverrides = new Map([
  [110000, null], // Unarmed
  ...(isReforged
    ? ([
        [1170000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Nightmaiden's Edge
        [16170000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Grave Spear
        [11110000, "https://eldenring.wiki.fextralife.com/Scepter+of+the+All-Knowing"], // Scepter of the All-Knowing Staff
        [33210000, "https://eldenring.wiki.fextralife.com/Carian+Glintstone+Staff"], // Dark Glintstone Staff
      ] as const)
    : []),
]);

const attackElementCorrectParams = readCsv(join(dataDir, "AttackElementCorrectParam.csv"));
const calcCorrectGraphs = readCsv(join(dataDir, "CalcCorrectGraph.csv"));
const equipParamWeapons = readCsv(join(dataDir, "EquipParamWeapon.csv"));
const reinforceParamWeapons = readCsv(join(dataDir, "ReinforceParamWeapon.csv"));
const spEffectParams = readCsv(join(dataDir, "SpEffectParam.csv"));
const weaponNames = readFmgJson(join(dataDir, "TitleWeapons.fmg.json"));

function ifNotDefault<T>(value: T, defaultValue: T): T | undefined {
  return value === defaultValue ? undefined : value;
}

/**
 * @returns true if the weapon cannot have affinities applied. This definition of "unique" helps us
 * filter out invalid EquipParamWeapons like Fire Treespear, and is used as a special fake affinity
 * for filtering purposes.
 */
function isUniqueWeapon(data: CsvRow["data"]) {
  // Consider a weapon unique if it can't have Ashes of War (e.g. torches, moonveil) or can't have
  // affinities selected when applying Ashes of War (e.g. bows)
  return data.gemMountType === 0 || data.disableGemAttr === 1;
}

const unobtainableWeapons = new Set(
  isReforged
    ? [
        1910000, // Reduvia (Esgar- Priest of Blood)
        11170000, // Gideon's Scepter of the All-Knowing
      ]
    : [],
);

const supportedWeaponTypes = new Set([
  WeaponType.DAGGER,
  WeaponType.STRAIGHT_SWORD,
  WeaponType.GREATSWORD,
  WeaponType.COLOSSAL_SWORD,
  WeaponType.CURVED_SWORD,
  WeaponType.CURVED_GREATSWORD,
  WeaponType.KATANA,
  WeaponType.TWINBLADE,
  WeaponType.THRUSTING_SWORD,
  WeaponType.HEAVY_THRUSTING_SWORD,
  WeaponType.AXE,
  WeaponType.GREATAXE,
  WeaponType.HAMMER,
  WeaponType.GREAT_HAMMER,
  WeaponType.FLAIL,
  WeaponType.SPEAR,
  WeaponType.GREAT_SPEAR,
  WeaponType.HALBERD,
  WeaponType.REAPER,
  WeaponType.FIST,
  WeaponType.CLAW,
  WeaponType.WHIP,
  WeaponType.COLOSSAL_WEAPON,
  WeaponType.LIGHT_BOW,
  WeaponType.BOW,
  WeaponType.GREATBOW,
  WeaponType.CROSSBOW,
  WeaponType.BALLISTA,
  WeaponType.GLINTSTONE_STAFF,
  WeaponType.UNIVERSAL_CATALYST,
  WeaponType.SACRED_SEAL,
  WeaponType.SMALL_SHIELD,
  WeaponType.MEDIUM_SHIELD,
  WeaponType.GREATSHIELD,
  WeaponType.TORCH,
]);

function isSupportedWeaponType(wepType: number): wepType is WeaponType {
  return supportedWeaponTypes.has(wepType);
}

function parseWeapon({ name, data }: CsvRow): EncodedWeaponJson | null {
  if (!weaponNames.has(data.ID) || !name) {
    debug(`No weapon title found for "${name}", ignoring`);
    return null;
  }

  // Categorize unarmed as a fist weapon I guess
  const weaponType = data.wepType === 33 ? WeaponType.FIST : data.wepType;
  if (!isSupportedWeaponType(weaponType)) {
    if (weaponType) {
      debug(`Unknown weapon type ${weaponType} on "${name}", ignoring`);
    }
    return null;
  }

  if (unobtainableWeapons.has(data.ID)) {
    return null;
  }

  if (!reinforceParamWeapons.has(data.reinforceTypeId)) {
    debug(`Unknown reinforceTypeId ${data.reinforceTypeId} on "${name}", ignoring`);
    return null;
  }

  if (!attackElementCorrectParams.has(data.attackElementCorrectId)) {
    debug(`Unknown AttackElementCorrectParam ${data.attackElementCorrectId} on "${name}, ignoring`);
    return null;
  }

  const affinityId = (data.ID % 10000) / 100;
  const uninfusedWeapon = equipParamWeapons.get(data.ID - 100 * affinityId)!;

  if (affinityId !== Math.floor(affinityId)) {
    debug(`Unknown affinity for ID ${data.ID} on "${name}", ignoring`);
    return null;
  }

  // Some weapons have infused versions in EquipParamWeapon even though ashes of war can't be
  // applied to them, e.g. Magic Great Club. Exclude these fake weapons from the list.
  if (affinityId !== 0 && isUniqueWeapon(uninfusedWeapon.data)) {
    debug(`Cannot apply affinity ${affinityId} on unique weapon "${name}", ignoring`);
    return null;
  }

  const attack = {
    [DamageType.PHYSICAL]: ifNotDefault(data.attackBasePhysics, 0),
    [DamageType.MAGIC]: ifNotDefault(data.attackBaseMagic, 0),
    [DamageType.FIRE]: ifNotDefault(data.attackBaseFire, 0),
    [DamageType.LIGHTNING]: ifNotDefault(data.attackBaseThunder, 0),
    [DamageType.HOLY]: ifNotDefault(data.attackBaseDark, 0),
  };

  const statuses = new Set<DamageType>();

  let statusSpEffectParamIds: number[] | undefined = [
    data.spEffectBehaviorId0,
    data.spEffectBehaviorId1,
    data.spEffectBehaviorId2,
  ];

  // Replace SpEffectParams that aren't relevant for status effects with 0, since they don't need
  // to be included in the data
  statusSpEffectParamIds = statusSpEffectParamIds.map((spEffectParamId) => {
    const statusSpEffectParams = parseStatusSpEffectParams(spEffectParamId);
    if (statusSpEffectParams != null) {
      Object.keys(statusSpEffectParams).forEach((statusType) => {
        statuses.add(+statusType as DamageType);
      });
      return spEffectParamId;
    }
    return 0;
  });

  if (statusSpEffectParamIds.every((id) => id === 0)) {
    statusSpEffectParamIds = undefined;
  }

  // Occult Fingerprint Stone Shield is bugged even though the data looks good.
  // Manually override this for now.
  if (isVanilla && data.ID === 32131200) {
    statusSpEffectParamIds = [0, 0, 0];
  }

  const calcCorrectGraphIds = {
    [DamageType.PHYSICAL]: ifNotDefault(
      attack[DamageType.PHYSICAL] ? data.correctType_Physics : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [DamageType.MAGIC]: ifNotDefault(
      attack[DamageType.MAGIC] ? data.correctType_Magic : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [DamageType.FIRE]: ifNotDefault(
      attack[DamageType.FIRE] ? data.correctType_Fire : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [DamageType.LIGHTNING]: ifNotDefault(
      attack[DamageType.LIGHTNING] ? data.correctType_Thunder : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [DamageType.HOLY]: ifNotDefault(
      attack[DamageType.HOLY] ? data.correctType_Dark : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [DamageType.POISON]: ifNotDefault(
      statuses.has(DamageType.POISON) ? data.correctType_Poison : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [DamageType.BLEED]: ifNotDefault(
      statuses.has(DamageType.BLEED) ? data.correctType_Blood : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [DamageType.SLEEP]: ifNotDefault(
      statuses.has(DamageType.SLEEP) ? data.correctType_Sleep : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [DamageType.MADNESS]: ifNotDefault(
      statuses.has(DamageType.MADNESS) ? data.correctType_Madness : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
  };

  for (const calcCorrectGraphId of Object.values(calcCorrectGraphIds)) {
    if (calcCorrectGraphId !== undefined && !calcCorrectGraphs.has(calcCorrectGraphId)) {
      debug(`Unknown CalcCorrectGraph ${calcCorrectGraphId} on "${name}", ignoring`);
      return null;
    }
  }

  return {
    name: weaponNames.get(data.ID)!,
    weaponName: weaponNames.get(uninfusedWeapon.data.ID)!,
    url: urlOverrides.get(uninfusedWeapon.data.ID),
    affinityId: isUniqueWeapon(data) ? -1 : affinityId,
    weaponType,
    requirements: {
      str: ifNotDefault(data.properStrength, 0),
      dex: ifNotDefault(data.properAgility, 0),
      int: ifNotDefault(data.properMagic, 0),
      fai: ifNotDefault(data.properFaith, 0),
      arc: ifNotDefault(data.properLuck, 0),
    },
    attack,
    attributeScaling: {
      str: ifNotDefault(data.correctStrength / 100, 0),
      dex: ifNotDefault(data.correctAgility / 100, 0),
      int: ifNotDefault(data.correctMagic / 100, 0),
      fai: ifNotDefault(data.correctFaith / 100, 0),
      arc: ifNotDefault(data.correctLuck / 100, 0),
    },
    statusSpEffectParamIds,
    reinforceTypeId: data.reinforceTypeId,
    attackElementCorrectId: data.attackElementCorrectId,
    calcCorrectGraphIds,
    paired: ifNotDefault(data.isDualBlade === 1, false),
  };
}

function parseCalcCorrectGraph({ data }: CsvRow): CalcCorrectGraph {
  return [
    {
      maxVal: data.stageMaxVal0,
      maxGrowVal: data.stageMaxGrowVal0 / 100,
      adjPt: data.adjPt_maxGrowVal0,
    },
    {
      maxVal: data.stageMaxVal1,
      maxGrowVal: data.stageMaxGrowVal1 / 100,
      adjPt: data.adjPt_maxGrowVal1,
    },
    {
      maxVal: data.stageMaxVal2,
      maxGrowVal: data.stageMaxGrowVal2 / 100,
      adjPt: data.adjPt_maxGrowVal2,
    },
    {
      maxVal: data.stageMaxVal3,
      maxGrowVal: data.stageMaxGrowVal3 / 100,
      adjPt: data.adjPt_maxGrowVal3,
    },
    {
      maxVal: data.stageMaxVal4,
      maxGrowVal: data.stageMaxGrowVal4 / 100,
      adjPt: data.adjPt_maxGrowVal4,
    },
  ];
}

function parseAttackElementCorrect({ data }: CsvRow): Partial<Record<DamageType, Attribute[]>> {
  function attributeArray(...args: (Attribute | 0)[]) {
    const attributes = args.filter((attribute): attribute is Attribute => !!attribute);
    return attributes.length ? attributes : undefined;
  }
  return {
    [DamageType.PHYSICAL]: attributeArray(
      data.isStrengthCorrect_byPhysics && "str",
      data.isDexterityCorrect_byPhysics && "dex",
      data.isFaithCorrect_byPhysics && "fai",
      data.isMagicCorrect_byPhysics && "int",
      data.isLuckCorrect_byPhysics && "arc",
    ),
    [DamageType.MAGIC]: attributeArray(
      data.isStrengthCorrect_byMagic && "str",
      data.isDexterityCorrect_byMagic && "dex",
      data.isFaithCorrect_byMagic && "fai",
      data.isMagicCorrect_byMagic && "int",
      data.isLuckCorrect_byMagic && "arc",
    ),
    [DamageType.FIRE]: attributeArray(
      data.isStrengthCorrect_byFire && "str",
      data.isDexterityCorrect_byFire && "dex",
      data.isFaithCorrect_byFire && "fai",
      data.isMagicCorrect_byFire && "int",
      data.isLuckCorrect_byFire && "arc",
    ),
    [DamageType.LIGHTNING]: attributeArray(
      data.isStrengthCorrect_byThunder && "str",
      data.isDexterityCorrect_byThunder && "dex",
      data.isFaithCorrect_byThunder && "fai",
      data.isMagicCorrect_byThunder && "int",
      data.isLuckCorrect_byThunder && "arc",
    ),
    [DamageType.HOLY]: attributeArray(
      data.isStrengthCorrect_byDark && "str",
      data.isDexterityCorrect_byDark && "dex",
      data.isFaithCorrect_byDark && "fai",
      data.isMagicCorrect_byDark && "int",
      data.isLuckCorrect_byDark && "arc",
    ),
  };
}

function parseReinforceParamWeapon({ data }: CsvRow): ReinforceParamWeapon {
  return {
    attack: {
      [DamageType.PHYSICAL]: data.physicsAtkRate,
      [DamageType.MAGIC]: data.magicAtkRate,
      [DamageType.FIRE]: data.fireAtkRate,
      [DamageType.LIGHTNING]: data.thunderAtkRate,
      [DamageType.HOLY]: data.darkAtkRate,
    },
    attributeScaling: {
      str: data.correctStrengthRate,
      dex: data.correctAgilityRate,
      int: data.correctMagicRate,
      fai: data.correctFaithRate,
      arc: data.correctLuckRate,
    },
    statusSpEffectId1: ifNotDefault(data.spEffectId1, 0),
    statusSpEffectId2: ifNotDefault(data.spEffectId2, 0),
    statusSpEffectId3: ifNotDefault(data.spEffectId3, 0),
  };
}

function parseStatusSpEffectParams(
  statusSpEffectParamId: number,
): Partial<Record<DamageType, number>> | null {
  const spEffectParam = spEffectParams.get(statusSpEffectParamId);
  if (!spEffectParam) {
    return null;
  }

  const statuses = {
    [DamageType.POISON]: ifNotDefault(spEffectParam.data.poizonAttackPower, 0),
    [DamageType.SCARLET_ROT]: ifNotDefault(spEffectParam.data.diseaseAttackPower, 0),
    [DamageType.BLEED]: ifNotDefault(spEffectParam.data.bloodAttackPower, 0),
    [DamageType.FROST]: ifNotDefault(spEffectParam.data.freezeAttackPower, 0),
    [DamageType.SLEEP]: ifNotDefault(spEffectParam.data.sleepAttackPower, 0),
    [DamageType.MADNESS]: ifNotDefault(spEffectParam.data.madnessAttackPower, 0),
    [DamageType.DEATH_BLIGHT]: ifNotDefault(spEffectParam.data.curseAttackPower, 0),
  };

  if (Object.values(statuses).some((value) => value !== undefined)) {
    return statuses;
  }

  return null;
}

const weaponsJson = [...equipParamWeapons.values()]
  .map(parseWeapon)
  .filter((w): w is EncodedWeaponJson => w != null);

// Accumulate every CalcCorrectGraph entry used by at least one weapon
const calcCorrectGraphIds = new Set([
  defaultDamageCalcCorrectGraphId,
  defaultStatusCalcCorrectGraphId,
  ...weaponsJson.flatMap((weapon) => Object.values(weapon.calcCorrectGraphIds ?? {})),
]);
const calcCorrectGraphsJson = Object.fromEntries(
  [...calcCorrectGraphs.entries()]
    .filter(([id]) => calcCorrectGraphIds.has(id))
    .map(([id, calcCorrectGraph]) => [id, parseCalcCorrectGraph(calcCorrectGraph)]),
);

// Accumulate every AttackElementCorrectParam entry used by at least one weapon
const attackElementCorrectIds = new Set(weaponsJson.map((weapon) => weapon.attackElementCorrectId));
const attackElementCorrectsJson = Object.fromEntries(
  [...attackElementCorrectParams.entries()]
    .filter(([id]) => attackElementCorrectIds.has(id))
    .map(([id, row]) => [id, parseAttackElementCorrect(row)]),
);

// Accumulate every ReinforceParamWeapon entry used by at least one weapon
const reinforceTypeIds = new Set(weaponsJson.map((weapon) => weapon.reinforceTypeId));
const reinforceTypesJson: { [reinforceId in number]?: ReinforceParamWeapon[] } = {};
reinforceParamWeapons.forEach((reinforceParamWeapon, reinforceParamId) => {
  const reinforceLevel = reinforceParamId % 50;
  const reinforceTypeId = reinforceParamId - reinforceLevel;
  if (reinforceTypeIds.has(reinforceTypeId)) {
    (reinforceTypesJson[reinforceTypeId] ??= [])[reinforceLevel] =
      parseReinforceParamWeapon(reinforceParamWeapon);
  }
});

// Accumulate every SpEffectParam entry used by at least one weapon to add innate status effect
// buildup
const statusSpEffectParamIds = new Set<number>();
weaponsJson.forEach((weapon) => {
  const reinforceParamWeapons = reinforceTypesJson[weapon.reinforceTypeId]!;
  reinforceParamWeapons.forEach(({ statusSpEffectId1, statusSpEffectId2, statusSpEffectId3 }) => {
    weapon.statusSpEffectParamIds?.forEach((spEffectParamId, i) => {
      if (spEffectParamId) {
        const offset = [statusSpEffectId1, statusSpEffectId2, statusSpEffectId3][i] ?? 0;
        statusSpEffectParamIds.add(spEffectParamId + offset);
      }
    });
  });
});
const statusSpEffectParamsJson: {
  [spEffectParamId in number]?: Partial<Record<DamageType, number>>;
} = {};
for (const spEffectParamId of spEffectParams.keys()) {
  if (statusSpEffectParamIds.has(spEffectParamId)) {
    statusSpEffectParamsJson[spEffectParamId] = parseStatusSpEffectParams(spEffectParamId)!;
  }
}

const regulationDataJson: EncodedRegulationDataJson = {
  calcCorrectGraphs: calcCorrectGraphsJson,
  attackElementCorrects: attackElementCorrectsJson,
  reinforceTypes: reinforceTypesJson,
  statusSpEffectParams: statusSpEffectParamsJson,
  weapons: weaponsJson,
};

writeFileSync(outputFile, JSON.stringify(regulationDataJson));
