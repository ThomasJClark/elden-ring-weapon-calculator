/*
 * Usage: yarn rebuildWeaponData
 */
import { readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import makeDebug from "debug";
import { type Attribute, WeaponType, AttackPowerType } from "./calculator/calculator";
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
      let name = "";
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
  return new Map(
    json.Fmg.Entries.map(({ ID, Text }: { ID: string; Text: string | null }) => [ID, Text]),
  );
}

const dataDir = process.argv[2];
const outputFile = process.argv[3];
const isReforged = dataDir.includes("reforged");
const isConvergence = dataDir.includes("convergence");
const isVanilla = !isReforged && !isConvergence;

const urlOverrides = new Map([
  [110000, null], // Unarmed
  ...(isReforged
    ? ([
        [1120000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Iron Spike
        [1170000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Nightmaiden's Edge
        [2100000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Marionette Short Sword
        [7130000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Red Wolf's Fang
        [7160000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Avionette Scimitar
        [8090000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Fury of Azash
        [8110000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Makar's Ceremonial Cleaver
        [12030000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Pumpkin Head Sledgehammer
        [14070000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Vulgar Militia Chain Sickle
        [16100000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Disciple's Rotten Branch
        [16170000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Grave Spear
        [16180000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Lordsworn's Spear
        [18120000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Avionette Pig Sticker
        [18170000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Starcaller Spire
        [20300000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Sun Realm Sword
        [21050000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Nox Flowing Fist
        [22040000, "https://err.fandom.com/wiki/Weapons#New_Weapons"], // Crude Iron Claws
        [11110000, "https://eldenring.wiki.fextralife.com/Scepter+of+the+All-Knowing"], // Scepter of the All-Knowing Staff
        [33210000, "https://eldenring.wiki.fextralife.com/Carian+Glintstone+Staff"], // Dark Glintstone Staff
      ] as const)
    : []),
  ...(isConvergence
    ? ([
        [1120000, null], // Surgeon's Catlinger
        [1170000, null], // Midnight Dagger
        [3110000, null], // Celestial Blade
        [3120000, null], // Sword of the Cyclops
        [5070000, null], // Thorn of the Guilty
        [5080000, null], // Foil of Caddock
        [5090000, null], // Quicksilver Rapier
        [7160000, null], // Blade of Scarlet Bloom
        [7180000, null], // Nomad's Kilij
        [8090000, null], // Three Finger Blade
        [10020000, null], // Sulien's Razors
        [10040000, null], // Frozen Twinshards
        [10070000, null], // Godwyn's Cragblades
        [11020000, null], // Leaden Maul
        [11160000, null], // Zamor Star Mace
        [12030000, null], // Underworld Greatmace
        [12040000, null], // Crimson Briar-Bough
        [13050000, null], // Mohgwyn Censer
        [13060000, null], // Seething Flail
        [14070000, null], // Glintstone Cleaver
        [14090000, null], // Axe of Epiphany
        [14130000, null], // Axe of Fell Prophecy
        [15090000, null], // Axe of Rust
        [18120000, null], // Glaive of the Ancients
        [22040000, null], // Stone Claws
        [1050000, "https://eldenring.wiki.fextralife.com/Crystal+Knife"], // Underworld Dagger
        [2070000, "https://eldenring.wiki.fextralife.com/Golden+Epitaph"], // Draconic Epitaph
        [2140000, "https://eldenring.wiki.fextralife.com/Sword+of+Night+and+Flame"], // Sword of the Cosmos
        [2150000, "https://eldenring.wiki.fextralife.com/Crystal+Sword"], // Molten Sword
        [2200000, "https://eldenring.wiki.fextralife.com/Miquellan+Knight's+Sword"], // Fell Flame Sword
        [2250000, "https://eldenring.wiki.fextralife.com/Lazuli+Glintstone+Sword"], // Dragonkin Seeker Sword
        [18140000, "https://eldenring.wiki.fextralife.com/Dragon+Halberd"], // Dragonkin Halberd
        [33050000, "https://eldenring.wiki.fextralife.com/Gelmir+Glintstone+Staff"], // Gelmir Lava Staff
        [33060000, "https://eldenring.wiki.fextralife.com/Demi-Human+Queen's+Staff"], // Blighted Branch
        [33200000, "https://eldenring.wiki.fextralife.com/Academy+Glintstone+Staff"], // Dragon Student Staff
        [33240000, "https://eldenring.wiki.fextralife.com/Lusat's+Glintstone+Staff"], // Lusat's Night Staff
      ] as const)
    : []),
]);

const attackElementCorrectParams = readCsv(join(dataDir, "AttackElementCorrectParam.csv"));
const calcCorrectGraphs = readCsv(join(dataDir, "CalcCorrectGraph.csv"));
const equipParamWeapons = readCsv(join(dataDir, "EquipParamWeapon.csv"));
const reinforceParamWeapons = readCsv(join(dataDir, "ReinforceParamWeapon.csv"));
const spEffectParams = readCsv(join(dataDir, "SpEffectParam.csv"));
const menuValueTableParams = readCsv(join(dataDir, "MenuValueTableParam.csv"));
const menuText = readFmgJson(join(dataDir, "Modern_MenuText.fmg.json"));
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
  // Hack: The Convergence allows these to be given affinities, but they don't do anything. They're
  // supposed to be unique weapons.
  if (
    isConvergence &&
    [
      1120000, // Surgeon's Catlinger
      1170000, // Midnight Dagger
      3110000, // Celestial Blade
      3120000, // Sword of the Cyclops
      5070000, // Thorn of the Guilty
      5080000, // Foil of Caddock
      5090000, // Quicksilver Rapier
      7160000, // Blade of Scarlet Bloom
      7180000, // Nomad's Kilij
      8090000, // Three Finger Blade
      10020000, // Sulien's Razors
      10040000, // Frozen Twinshards
      10070000, // Godwyn's Cragblades
      11020000, // Leaden Maul
      11160000, // Zamor Star Mace
      12030000, // Underworld Greatmace
      12040000, // Crimson Briar-Bough
      13050000, // Mohgwyn Censer
      13060000, // Seething Flail
      14070000, // Glintstone Cleaver
      14090000, // Axe of Epiphany
      14130000, // Axe of Fell Prophecy
      15090000, // Axe of Rust
      18120000, // Glaive of the Ancients
      22040000, // Stone Claws
    ].includes(data.ID)
  ) {
    return true;
  }

  // Hack: This weapon is allowed to have AoWs, but it doesn't actually support any AoWs and
  // can't have affinities
  if (
    isReforged &&
    [
      21050000, // Nox Flowing Fist
    ].includes(data.ID)
  ) {
    return true;
  }

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
    : // These aren't mentioned in the notes for the public alpha, likely WIP
    isConvergence
    ? [
        3230000, // Sword of Hadea
        6050000, // Estoc of the Serpent Priest
        7170000, // Matriarch's Shotel
        17030000, // Serpent-Hunter
        10060000, // Caimar's Battlestaff
        10060000, // Caimar's Battlestaff
        19030000, // Moon Breaker Scythe
        30300000, // Crest of the Dragon Cult
        33290000, // Dragonkin Scepter
        33300000, // Ranni's Staff
        33310000, // Snow Witch Staff
        33320000, // Staff of Briar
        33330000, // Lavastone Staff
        33340000, // Tempestcaller Staff
        33350000, // Stormcaller Staff
        34100000, // Godskin Seal
        34110000, // Fire Monk's Seal
        34120000, // Dragon Cult Seal
        34130000, // Earthbreaker Seal
        34140000, // Fingerprint Seal
        34150000, // Mohgwyn Seal
        34160000, // War Surgeon's Seal
        34170000, // Seal of Rot
        34180000, // Pest's Seal
        34190000, // Spiritshaper Seal
        34200000, // Mystic Seal
      ]
    : [],
);

const wepTypeOverrides = new Map([
  // Categorize unarmed as a fist weapon I guess
  [110000, WeaponType.FIST],
  ...(isReforged
    ? ([
        // Categorized Reforged hybrid casting tools by their melee movesets
        [1070000, WeaponType.DAGGER], // Glintstone Kris
        [2180000, WeaponType.STRAIGHT_SWORD], // Carian Knight's Sword
        [2250000, WeaponType.STRAIGHT_SWORD], // Lazuli Glintstone Sword
        [4110000, WeaponType.COLOSSAL_SWORD], // Troll Knight's Sword
        [11060000, WeaponType.HAMMER], // Varre's Bouquet
        [16100000, WeaponType.SPEAR], // Disciple's Rotten Branch
        [18100000, WeaponType.HALBERD], // Loretta's War Sickle
        [18170000, WeaponType.HALBERD], // Starcaller Spire
      ] as const)
    : []),
]);

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

  const weaponType = wepTypeOverrides.get(data.ID) ?? data.wepType;
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

  const attackPowerTypes = new Set<AttackPowerType>();

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
        attackPowerTypes.add(+statusType as AttackPowerType);
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

  const attack: (readonly [AttackPowerType, number])[] = (
    [
      [AttackPowerType.PHYSICAL, data.attackBasePhysics],
      [AttackPowerType.MAGIC, data.attackBaseMagic],
      [AttackPowerType.FIRE, data.attackBaseFire],
      [AttackPowerType.LIGHTNING, data.attackBaseThunder],
      [AttackPowerType.HOLY, data.attackBaseDark],
    ] as const
  ).filter(([attackPowerType, attackPower]) => {
    if (attackPower) {
      attackPowerTypes.add(attackPowerType);
      return true;
    }
    return false;
  });

  // Spell scaling uses the same correct graph as magic (staves) or holy (seals)
  let spellScalingCorrectType = -1;
  if (data.enableMagic) {
    spellScalingCorrectType = data.correctType_Magic;
  } else if (data.enableMiracle) {
    spellScalingCorrectType = data.correctType_Dark;
  }

  const calcCorrectGraphIds = {
    [AttackPowerType.PHYSICAL]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.PHYSICAL) ? data.correctType_Physics : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.MAGIC]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.MAGIC) ? data.correctType_Magic : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.FIRE]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.FIRE) ? data.correctType_Fire : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.LIGHTNING]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.LIGHTNING) ? data.correctType_Thunder : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.HOLY]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.HOLY) ? data.correctType_Dark : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.POISON]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.POISON) ? data.correctType_Poison : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.BLEED]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.BLEED) ? data.correctType_Blood : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.SLEEP]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.SLEEP) ? data.correctType_Sleep : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.MADNESS]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.MADNESS) ? data.correctType_Madness : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.SPELL_SCALING]: ifNotDefault(spellScalingCorrectType, -1),
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
    attributeScaling: (
      [
        ["str", data.correctStrength / 100],
        ["dex", data.correctAgility / 100],
        ["int", data.correctMagic / 100],
        ["fai", data.correctFaith / 100],
        ["arc", data.correctLuck / 100],
      ] as const
    ).filter(([, attributeScaling]) => attributeScaling),
    statusSpEffectParamIds,
    reinforceTypeId: data.reinforceTypeId,
    attackElementCorrectId: data.attackElementCorrectId,
    calcCorrectGraphIds,
    paired: ifNotDefault(data.isDualBlade === 1, false),
    spellTool: ifNotDefault(spellScalingCorrectType != -1, false),
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

function parseAttackElementCorrect({
  data,
}: CsvRow): Partial<Record<AttackPowerType, Attribute[]>> {
  function attributeArray(...args: (Attribute | 0)[]) {
    const attributes = args.filter((attribute): attribute is Attribute => !!attribute);
    return attributes.length ? attributes : undefined;
  }
  return {
    [AttackPowerType.PHYSICAL]: attributeArray(
      data.isStrengthCorrect_byPhysics && "str",
      data.isDexterityCorrect_byPhysics && "dex",
      data.isFaithCorrect_byPhysics && "fai",
      data.isMagicCorrect_byPhysics && "int",
      data.isLuckCorrect_byPhysics && "arc",
    ),
    [AttackPowerType.MAGIC]: attributeArray(
      data.isStrengthCorrect_byMagic && "str",
      data.isDexterityCorrect_byMagic && "dex",
      data.isFaithCorrect_byMagic && "fai",
      data.isMagicCorrect_byMagic && "int",
      data.isLuckCorrect_byMagic && "arc",
    ),
    [AttackPowerType.FIRE]: attributeArray(
      data.isStrengthCorrect_byFire && "str",
      data.isDexterityCorrect_byFire && "dex",
      data.isFaithCorrect_byFire && "fai",
      data.isMagicCorrect_byFire && "int",
      data.isLuckCorrect_byFire && "arc",
    ),
    [AttackPowerType.LIGHTNING]: attributeArray(
      data.isStrengthCorrect_byThunder && "str",
      data.isDexterityCorrect_byThunder && "dex",
      data.isFaithCorrect_byThunder && "fai",
      data.isMagicCorrect_byThunder && "int",
      data.isLuckCorrect_byThunder && "arc",
    ),
    [AttackPowerType.HOLY]: attributeArray(
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
      [AttackPowerType.PHYSICAL]: data.physicsAtkRate,
      [AttackPowerType.MAGIC]: data.magicAtkRate,
      [AttackPowerType.FIRE]: data.fireAtkRate,
      [AttackPowerType.LIGHTNING]: data.thunderAtkRate,
      [AttackPowerType.HOLY]: data.darkAtkRate,
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
): Partial<Record<AttackPowerType, number>> | null {
  const spEffectParam = spEffectParams.get(statusSpEffectParamId);
  if (!spEffectParam) {
    return null;
  }

  const statuses = {
    [AttackPowerType.POISON]: ifNotDefault(spEffectParam.data.poizonAttackPower, 0),
    [AttackPowerType.SCARLET_ROT]: ifNotDefault(spEffectParam.data.diseaseAttackPower, 0),
    [AttackPowerType.BLEED]: ifNotDefault(spEffectParam.data.bloodAttackPower, 0),
    [AttackPowerType.FROST]: ifNotDefault(spEffectParam.data.freezeAttackPower, 0),
    [AttackPowerType.SLEEP]: ifNotDefault(spEffectParam.data.sleepAttackPower, 0),
    [AttackPowerType.MADNESS]: ifNotDefault(spEffectParam.data.madnessAttackPower, 0),
    [AttackPowerType.DEATH_BLIGHT]: ifNotDefault(spEffectParam.data.curseAttackPower, 0),
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
  [spEffectParamId in number]?: Partial<Record<AttackPowerType, number>>;
} = {};
for (const spEffectParamId of spEffectParams.keys()) {
  if (statusSpEffectParamIds.has(spEffectParamId)) {
    statusSpEffectParamsJson[spEffectParamId] = parseStatusSpEffectParams(spEffectParamId)!;
  }
}

const scalingTiersJson: [number, string][] = [];
for (const [id, { data }] of menuValueTableParams) {
  // 1 = scaling labels
  if (data.compareType === 1 && id >= 100) {
    scalingTiersJson.push([data.value / 100, menuText.get(data.textId)!]);
  }
}

const regulationDataJson: EncodedRegulationDataJson = {
  calcCorrectGraphs: calcCorrectGraphsJson,
  attackElementCorrects: attackElementCorrectsJson,
  reinforceTypes: reinforceTypesJson,
  statusSpEffectParams: statusSpEffectParamsJson,
  scalingTiers: scalingTiersJson,
  weapons: weaponsJson,
};

writeFileSync(outputFile, JSON.stringify(regulationDataJson));
