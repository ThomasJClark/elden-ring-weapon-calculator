/*
 * Usage: yarn ts-node-esm src/buildData.ts data/vanilla-1.09
 */
import { readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import type {
  Attribute,
  CalcCorrectGraph,
  WeaponType,
  StatusType,
  DamageType,
} from "./calculator/calculator";
import type {
  EncodedWeaponJson,
  EncodedRegulationDataJson,
  ReinforceParamWeapon,
} from "./regulationData";
import { uninfusableWeaponTypes } from "./search/filterWeapons";

const weaponTypesById: { [key in number]?: WeaponType } = {
  1: "Dagger",
  3: "Straight Sword",
  5: "Greatsword",
  7: "Colossal Sword",
  9: "Curved Sword",
  11: "Curved Greatsword",
  13: "Katana",
  14: "Twinblade",
  15: "Thrusting Sword",
  16: "Heavy Thrusting Sword",
  17: "Axe",
  19: "Greataxe",
  21: "Hammer",
  23: "Great Hammer",
  24: "Flail",
  25: "Spear",
  28: "Great Spear",
  29: "Halberd",
  31: "Reaper",
  35: "Fist",
  37: "Claw",
  39: "Whip",
  41: "Colossal Weapon",
  50: "Light Bow",
  51: "Bow",
  53: "Greatbow",
  55: "Crossbow",
  56: "Ballista",
  57: "Glintstone Staff",
  61: "Sacred Seal",
  65: "Small Shield",
  67: "Medium Shield",
  69: "Greatshield",
  87: "Torch",
};

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

const dataDir = process.argv[2];
const outputFile = join("public", `regulation-${basename(dataDir)}.js`);

// Hack: these weapons can't have Ashes of War applied and therefore will never have an affinity
const uninfusableWeaponIds = [
  9080000, // Serpentbone Blade
  17070000, // Treespear
  23020000, // Great Club
  23130000, // Troll's Hammer
];

// Hack: these weapons have names in the UI that are different from their names in EquipParamWeapon
const nameOverrides = new Map([
  [1030000, "Miséricorde"],
  [1030100, "Heavy Miséricorde"],
  [1030200, "Keen Miséricorde"],
  [1030300, "Quality Miséricorde"],
  [1030400, "Fire Miséricorde"],
  [1030500, "Flame Art Miséricorde"],
  [1030600, "Lightning Miséricorde"],
  [1030700, "Sacred Miséricorde"],
  [1030800, "Magic Miséricorde"],
  [1030900, "Cold Miséricorde"],
  [1031000, "Poison Miséricorde"],
  [1031100, "Blood Miséricorde"],
  [1031200, "Occult Miséricorde"],
  [6020000, "Great Épée"],
  [6020100, "Heavy Great Épée"],
  [6020200, "Keen Great Épée"],
  [6020300, "Quality Great Épée"],
  [6020400, "Fire Great Épée"],
  [6020500, "Flame Art Great Épée"],
  [6020600, "Lightning Great Épée"],
  [6020700, "Sacred Great Épée"],
  [6020800, "Magic Great Épée"],
  [6020900, "Cold Great Épée"],
  [6021000, "Poison Great Épée"],
  [6021100, "Blood Great Épée"],
  [6021200, "Occult Great Épée"],
  [11060000, "Varré's Bouquet"],
]);

const attackElementCorrectParams = readCsv(join(dataDir, "AttackElementCorrectParam.csv"));
const calcCorrectGraphs = readCsv(join(dataDir, "CalcCorrectGraph.csv"));
const equipParamWeapons = readCsv(join(dataDir, "EquipParamWeapon.csv"));
const reinforceParamWeapons = readCsv(join(dataDir, "ReinforceParamWeapon.csv"));
const spEffectParams = readCsv(join(dataDir, "SpEffectParam.csv"));

function ifNotDefault<T>(value: T, defaultValue: T): T | undefined {
  return value === defaultValue ? undefined : value;
}

function parseWeapon({ name, data }: CsvRow): EncodedWeaponJson | null {
  if (
    !name ||
    !(data.wepType in weaponTypesById) ||
    !reinforceParamWeapons.has(data.reinforceTypeId) ||
    !attackElementCorrectParams.has(data.attackElementCorrectId)
  ) {
    return null;
  }

  const uninfusedWeaponId = Math.floor(data.ID / 10000) * 10000;
  let affinityId = Math.floor((data.ID - uninfusedWeaponId) / 100) * 100;
  if (affinityId && uninfusableWeaponIds.includes(uninfusedWeaponId)) {
    return null;
  }

  const weaponType = weaponTypesById[data.wepType]!;

  // If the weapon can't be given an affinity, categorize it as "Unique" instead of standard affinity
  if (
    !affinityId &&
    !uninfusableWeaponTypes.includes(weaponType) &&
    (!equipParamWeapons.has(data.ID + 100) || uninfusableWeaponIds.includes(uninfusedWeaponId))
  ) {
    affinityId = -1;
  }

  const attack = {
    physical: ifNotDefault(data.attackBasePhysics, 0),
    magic: ifNotDefault(data.attackBaseMagic, 0),
    fire: ifNotDefault(data.attackBaseFire, 0),
    lightning: ifNotDefault(data.attackBaseThunder, 0),
    holy: ifNotDefault(data.attackBaseDark, 0),
  };

  // TODO: Include Death Blight status effects (curseAttackPower) for Elden Ring
  // Reforged and perhaps future content expansions

  const statuses = new Set<StatusType>();

  let statusSpEffectParamIds = [
    data.spEffectBehaviorId0,
    data.spEffectBehaviorId1,
    data.spEffectBehaviorId2,
  ];

  // Replace SpEffectParams that aren't relevant for status effects with 0, since they don't need
  // to be included in the data
  statusSpEffectParamIds = statusSpEffectParamIds.map((spEffectParamId) => {
    const statusSpEffectParams = parseStatusSpEffectParams(spEffectParamId);
    if (statusSpEffectParams != null) {
      (Object.keys(statusSpEffectParams) as StatusType[]).forEach((statusType) => {
        statuses.add(statusType);
      });
      return spEffectParamId;
    }
    return 0;
  });

  // Occult Fingerprint Stone Shield is bugged even though the data looks good.
  // Manually override this for now.
  if (data.ID === 32131200) {
    statusSpEffectParamIds = [0, 0, 0];
  }

  const calcCorrectGraphIds = {
    physical: ifNotDefault(attack.physical && data.correctType_Physics, 0),
    magic: ifNotDefault(attack.magic && data.correctType_Magic, 0),
    fire: ifNotDefault(attack.fire && data.correctType_Fire, 0),
    lightning: ifNotDefault(attack.lightning && data.correctType_Thunder, 0),
    holy: ifNotDefault(attack.holy && data.correctType_Dark, 0),
    Poison: ifNotDefault(statuses.has("Poison") ? data.correctType_Poison : undefined, 6),
    Bleed: ifNotDefault(statuses.has("Bleed") ? data.correctType_Blood : undefined, 6),
    Sleep: ifNotDefault(statuses.has("Sleep") ? data.correctType_Sleep : undefined, 6),
    Madness: ifNotDefault(statuses.has("Madness") ? data.correctType_Madness : undefined, 6),
  };

  if (
    !Object.values(calcCorrectGraphIds).every(
      (calcCorrectGraphId) =>
        calcCorrectGraphId == null || calcCorrectGraphs.has(calcCorrectGraphId),
    )
  ) {
    return null;
  }

  return {
    name: nameOverrides.get(data.ID) ?? name,
    weaponName: equipParamWeapons.get(uninfusedWeaponId)!.name,
    affinityId,
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
    paired: data.isDualBlade === 1,
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
    physical: attributeArray(
      data.isStrengthCorrect_byPhysics && "str",
      data.isDexterityCorrect_byPhysics && "dex",
      data.isFaithCorrect_byPhysics && "fai",
      data.isMagicCorrect_byPhysics && "int",
      data.isLuckCorrect_byPhysics && "arc",
    ),
    magic: attributeArray(
      data.isStrengthCorrect_byMagic && "str",
      data.isDexterityCorrect_byMagic && "dex",
      data.isFaithCorrect_byMagic && "fai",
      data.isMagicCorrect_byMagic && "int",
      data.isLuckCorrect_byMagic && "arc",
    ),
    fire: attributeArray(
      data.isStrengthCorrect_byFire && "str",
      data.isDexterityCorrect_byFire && "dex",
      data.isFaithCorrect_byFire && "fai",
      data.isMagicCorrect_byFire && "int",
      data.isLuckCorrect_byFire && "arc",
    ),
    lightning: attributeArray(
      data.isStrengthCorrect_byThunder && "str",
      data.isDexterityCorrect_byThunder && "dex",
      data.isFaithCorrect_byThunder && "fai",
      data.isMagicCorrect_byThunder && "int",
      data.isLuckCorrect_byThunder && "arc",
    ),
    holy: attributeArray(
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
      physical: data.physicsAtkRate,
      magic: data.magicAtkRate,
      fire: data.fireAtkRate,
      lightning: data.thunderAtkRate,
      holy: data.darkAtkRate,
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
): Partial<Record<StatusType, number>> | null {
  const spEffectParam = spEffectParams.get(statusSpEffectParamId);
  if (!spEffectParam) {
    return null;
  }

  const statuses = {
    Poison: ifNotDefault(spEffectParam.data.poizonAttackPower, 0),
    "Scarlet Rot": ifNotDefault(spEffectParam.data.diseaseAttackPower, 0),
    Bleed: ifNotDefault(spEffectParam.data.bloodAttackPower, 0),
    Frost: ifNotDefault(spEffectParam.data.freezeAttackPower, 0),
    Sleep: ifNotDefault(spEffectParam.data.sleepAttackPower, 0),
    Madness: ifNotDefault(spEffectParam.data.madnessAttackPower, 0),
  };

  if (Object.values(statuses).some((value) => value !== undefined)) {
    return statuses;
  }

  return null;
}

const calcCorrectGraphsJson = Object.fromEntries(
  [...calcCorrectGraphs.entries()].map(([id, calcCorrectGraph]) => [
    id,
    parseCalcCorrectGraph(calcCorrectGraph),
  ]),
);

const weaponsJson = [...equipParamWeapons.values()]
  .map(parseWeapon)
  .filter((w): w is EncodedWeaponJson => w != null);

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
    weapon.statusSpEffectParamIds.forEach((spEffectParamId, i) => {
      if (spEffectParamId) {
        const offset = [statusSpEffectId1, statusSpEffectId2, statusSpEffectId3][i] ?? 0;
        statusSpEffectParamIds.add(spEffectParamId + offset);
      }
    });
  });
});
const statusSpEffectParamsJson: {
  [spEffectParamId in number]?: Partial<Record<StatusType, number>>;
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
