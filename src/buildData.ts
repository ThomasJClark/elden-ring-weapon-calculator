/*
 * Usage: yarn rebuildWeaponData
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import { env } from "node:process";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import makeDebug from "debug";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";
import {
  type Attribute,
  WeaponType,
  AttackPowerType,
  allDamageTypes,
} from "./calculator/calculator";
import {
  type EncodedWeaponJson,
  type EncodedRegulationDataJson,
  type ReinforceParamWeapon,
  type CalcCorrectGraph,
  defaultStatusCalcCorrectGraphId,
  defaultDamageCalcCorrectGraphId,
} from "./regulationData";

const debug = makeDebug("buildData");

const envFile = "buildData.env";

// Read the local env file with buildData configuration, creating a new (probably initially wrong)
// file if it doesn't exist
if (!existsSync(envFile)) {
  writeFileSync(
    envFile,
    `WITCHY_PATH=C:\\Program Files (x86)\\WitchyBND\\
VANILLA_PATH=C:\\Program Files (x86)\\Steam\\steamapps\\common\\ELDEN RING\\Game\\
REFORGED_PATH=C:\\ERR\\
CONVERGENCE_PATH=C:\\ConvergenceER\\mod\\
SKIP_UNPACK=0`,
  );
}

dotenv.config({ path: envFile });

function getWitchyDir() {
  const witchyDir = env.WITCHY_PATH;
  console.log(witchyDir);
  if (!witchyDir || !existsSync(witchyDir)) {
    throw new Error(
      "Variable WITCHY_PATH must point to a folder. Please install WitchyBND " +
        `(https://github.com/ividyon/WitchyBND/releases/latest) and update your ${envFile} file.`,
    );
  }

  return witchyDir;
}

// The paths to each mod and the vanilla game are supplied in the env file, and the command like
// argument (specified in package.json) says which one to use
function getDataDir() {
  const dataEnvVariable = `${process.argv[2].toUpperCase()}_PATH`;
  const dataDir = process.env[dataEnvVariable];

  if (!dataDir || !existsSync(dataDir)) {
    throw new Error(
      `Variable ${dataEnvVariable} must point to a folder. Please update your ${envFile} file.`,
    );
  }

  return dataDir;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  attributeNamePrefix: "",
});

const dataDir = getDataDir();
const outputFile = process.argv[3];
const isReforged = outputFile.includes("reforged");
const isConvergence = outputFile.includes("convergence");
const isVanilla = !isReforged && !isConvergence;

const tmpDir = join(tmpdir(), "elden-ring-weapon-calculator", parse(outputFile).name);

const attackElementCorrectFile = join(tmpDir, "regulation-bin", "AttackElementCorrectParam.param");
const calcCorrectGraphFile = join(tmpDir, "regulation-bin", "CalcCorrectGraph.param");
const equipParamWeaponFile = join(tmpDir, "regulation-bin", "EquipParamWeapon.param");
const reinforceParamWeaponFile = join(tmpDir, "regulation-bin", "ReinforceParamWeapon.param");
const spEffectFile = join(tmpDir, "regulation-bin", "SpEffectParam.param");
const menuValueTableFile = join(tmpDir, "regulation-bin", "MenuValueTableParam.param");
const weaponNameFmgFile = join(tmpDir, "item-msgbnd-dcx", "WeaponName.fmg");
const dlcWeaponNameFmgFile = join(tmpDir, "item_dlc01-msgbnd-dcx", "WeaponName_dlc01.fmg");
const menuTextFmgFile = join(tmpDir, "menu-msgbnd-dcx", "GR_MenuText.fmg");

/**
 * Unpack the .param and .fmg files from the game or mod into an XML format we can read
 */
function unpackFiles() {
  const regulationBinFile = join(tmpDir, "regulation.bin");
  const itemMsgFile = join(tmpDir, "item.msgbnd.dcx");
  const dlcItemMsgFile = join(tmpDir, "item_dlc01.msgbnd.dcx");
  const menuMsgFile = join(tmpDir, "menu.msgbnd.dcx");

  mkdirSync(tmpDir, { recursive: true });

  cpSync(join(dataDir, "regulation.bin"), regulationBinFile);
  cpSync(join(dataDir, "msg", "engus", "item.msgbnd.dcx"), itemMsgFile);
  cpSync(join(dataDir, "msg", "engus", "item_dlc01.msgbnd.dcx"), dlcItemMsgFile);
  cpSync(join(dataDir, "msg", "engus", "menu.msgbnd.dcx"), menuMsgFile);

  let { error } = spawnSync(
    join(getWitchyDir(), "WitchyBND.exe"),
    [regulationBinFile, itemMsgFile, dlcItemMsgFile, menuMsgFile],
    { stdio: "inherit", windowsHide: true },
  );

  if (error) {
    throw error;
  }

  ({ error } = spawnSync(
    join(getWitchyDir(), "WitchyBND.exe"),
    [
      attackElementCorrectFile,
      calcCorrectGraphFile,
      equipParamWeaponFile,
      reinforceParamWeaponFile,
      spEffectFile,
      menuValueTableFile,
      weaponNameFmgFile,
      dlcWeaponNameFmgFile,
      menuTextFmgFile,
    ],
    { stdio: "inherit", windowsHide: true },
  ));

  if (error) {
    throw error;
  }

  rmSync(regulationBinFile);
  rmSync(itemMsgFile);
  rmSync(dlcItemMsgFile);
  rmSync(menuMsgFile);
}

type ParamRow = Record<string, number>;

/**
 * Parse an XML param file extracted by unpackFiles()
 */
function readParam(filename: string): Map<number, ParamRow> {
  const data = xmlParser.parse(readFileSync(`${filename}.xml`, "utf-8"));

  const defaultValues = Object.fromEntries(
    (data.param.fields.field as { name: string; defaultValue: unknown }[])
      .filter(({ defaultValue }) => typeof defaultValue === "number")
      .map(({ name, defaultValue }) => [name, defaultValue]),
  );

  return new Map<number, ParamRow>(
    data.param.rows.row.map(({ name, ...data }: any) => [data.id, { ...defaultValues, ...data }]),
  );
}

/**
 * Parse an XML fmg file extracted by unpackFiles(), which contains translation strings displayed
 * in the game
 */
function readFmgXml(filename: string): Map<number, string | null> {
  const data = xmlParser.parse(readFileSync(`${filename}.xml`, "utf-8"));
  return new Map(data.fmg.entries.text.map((entry: any) => [entry.id, entry["#text"]]));
}

const reforgedWeaponsUrl = "https://err.fandom.com/wiki/Weapons#New_Weapons";
const convergence10NotesUrl =
  "https://docs.google.com/document/d/1JHX3bMxnIIct8MSZnXkyqpmhYKLPt8p8HY9FUcXKUNE/preview#heading=h.79qlt4tgl68h";
const convergence13NotesUrl =
  "https://docs.google.com/document/d/12q9PLwWQDZZfKfpu-MQD-QK7GfiAFw6YNYKrPYiDrUg/preview#heading=h.9jtgsttalig";
const convergence14NotesUrl =
  "https://docs.google.com/document/d/12q9PLwWQDZZfKfpu-MQD-QK7GfiAFw6YNYKrPYiDrUg/preview#heading=h.9jtgsttalig";
const convergence141NotesUrl =
  "https://docs.google.com/document/d/1HhTcVvPG1V9lK8AL90USQCCgc7Z4lBWrmCEmXV6XHHw/preview#heading=h.4qcy1ray1wky";
const convergence142NotesUrl =
  "https://docs.google.com/document/d/1G0aHybk5yH2h-9s8X0tEzriZTfYwLcE0ZGXKzAHo3XY/preview#heading=h.4qcy1ray1wky";

const urlOverrides = new Map<number, string | null>([
  ...(isReforged
    ? ([
        [1120000, reforgedWeaponsUrl], // Iron Spike
        [1150000, "https://eldenring.fandom.com/wiki/Erdsteel_Dagger"], // Brass Dagger
        [1170000, "https://err.fandom.com/wiki/Nightmaiden%27s_Edge"], // Nightmaiden's Edge
        [2030000, reforgedWeaponsUrl], // Sun Realm Sword
        [2100000, reforgedWeaponsUrl], // Marionette Short Sword
        [2120000, reforgedWeaponsUrl], // Broken Straight Sword
        [7130000, reforgedWeaponsUrl], // Red Wolf's Fang
        [7160000, reforgedWeaponsUrl], // Avionette Scimitar
        [8090000, "https://err.fandom.com/wiki/Fury_of_Azash"], // Fury of Azash
        [8110000, reforgedWeaponsUrl], // Makar's Ceremonial Cleaver
        [10100000, reforgedWeaponsUrl], // Goldvine Branchstaff
        [12030000, reforgedWeaponsUrl], // Pumpkin Head Sledgehammer
        [14070000, reforgedWeaponsUrl], // Vulgar Militia Chain Sickle
        [16100000, reforgedWeaponsUrl], // Disciple's Rotten Branch
        [16170000, reforgedWeaponsUrl], // Grave Spear
        [16180000, reforgedWeaponsUrl], // Lordsworn's Spear
        [18120000, reforgedWeaponsUrl], // Avionette Pig Sticker
        [18170000, reforgedWeaponsUrl], // Starcaller Spire
        [21050000, reforgedWeaponsUrl], // Nox Flowing Fist
        [21140000, "https://err.fandom.com/wiki/Fellthorn_Clutches"], // Fellthorn Clutches
        [22040000, reforgedWeaponsUrl], // Crude Iron Claws
        [11110000, "https://eldenring.fandom.com/Scepter_of_the_All-Knowing"], // Scepter of the All-Knowing Staff
        [16140000, "https://eldenring.fandom.com/wiki/Spiked_Spear"], // Marionette Spiked Spear
        [18140000, "https://eldenring.fandom.com/wiki/Dragon_Halberd"], // Dragonscale Halberd
        [23150000, "https://eldenring.fandom.com/wiki/Rotten_Greataxe"], // Rotten Duelist Greataxe
        [33210000, "https://eldenring.fandom.com/Carian_Glintstone_Staff"], // Dark Glintstone Staff
      ] as const)
    : []),
  ...(isConvergence
    ? ([
        [1120000, convergence10NotesUrl], // Surgeon's Catlinger
        [1170000, convergence10NotesUrl], // Midnight Dagger
        [1180000, convergence14NotesUrl], // Deathrite Dagger
        [2030000, convergence13NotesUrl], // Yura's Kanabo
        [2120000, convergence14NotesUrl], // Blade of Valor
        [3110000, convergence10NotesUrl], // Celestial Blade
        [3120000, convergence10NotesUrl], // Sword of the Cyclops
        [3230000, convergence10NotesUrl], // Sword of Hadea
        [3240000, convergence142NotesUrl], // Dyru's Greatsword
        [4120000, convergence13NotesUrl], // Gravelstone Arcblades
        [4130000, convergence13NotesUrl], // Osian's Greatsword
        [5070000, convergence10NotesUrl], // Thorn of the Guilty
        [5080000, convergence10NotesUrl], // Foil of Caddock
        [5090000, convergence10NotesUrl], // Quicksilver Rapier
        [6030000, convergence13NotesUrl], // Carwyn's Épée
        [7090000, convergence13NotesUrl], // Zephyr Blades
        [7160000, convergence10NotesUrl], // Blade of Scarlet Bloom
        [7170000, convergence13NotesUrl], // Godskin Flayer
        [7170000, convergence10NotesUrl], // Matriarch's Shotel
        [7180000, convergence10NotesUrl], // Nomad's Kilij
        [8090000, convergence10NotesUrl], // Three Finger Blade
        [9050000, convergence14NotesUrl], // Star Shadow
        [10020000, convergence10NotesUrl], // Sulien's Razors
        [10040000, convergence10NotesUrl], // Frozen Twinshards
        [10070000, convergence10NotesUrl], // Godwyn's Cragblades
        [10100000, convergence13NotesUrl], // Palm-Ax Twinblades
        [10110000, convergence13NotesUrl], // Gilded Quarterstaff
        [11020000, convergence10NotesUrl], // Leaden Maul
        [11160000, convergence10NotesUrl], // Zamor Star Mace
        [11180000, convergence14NotesUrl], // Hammer of Virtue
        [12030000, convergence10NotesUrl], // Underworld Greatmace
        [12040000, convergence10NotesUrl], // Crimson Briar-Bough
        [12070000, convergence13NotesUrl], // Sigur's Greatmace
        [13050000, convergence10NotesUrl], // Mohgwyn Censer
        [13060000, convergence10NotesUrl], // Seething Flail
        [14070000, convergence10NotesUrl], // Glintstone Cleaver
        [14090000, convergence10NotesUrl], // Axe of Epiphany
        [14130000, convergence10NotesUrl], // Axe of Fell Prophecy
        [14150000, convergence13NotesUrl], // Bloodhound Hookblade
        [14160000, convergence14NotesUrl], // Rimeheart
        [14170000, convergence142NotesUrl], // Bloodflame Kamas
        [15090000, convergence10NotesUrl], // Axe of Rust
        [16100000, convergence13NotesUrl], // Spear of Tranquility
        [16170000, convergence141NotesUrl], // Phalanx Pike
        [18120000, convergence10NotesUrl], // Glaive of the Ancients
        [18170000, convergence13NotesUrl], // Reaver's Odachi
        [19040000, convergence13NotesUrl], // War Scythe
        [19050000, convergence14NotesUrl], // Rosus' Harvester
        [21020000, convergence14NotesUrl], // Daergraf's Opus
        [22040000, convergence10NotesUrl], // Stone Claws
        [22050000, convergence141NotesUrl], // Emyr's Great Talons
        [23090000, convergence141NotesUrl], // Greatstaff of Decay
        [23160000, convergence13NotesUrl], // Lodestone of Gelmir
        [30300000, convergence10NotesUrl], // Crest of the Dragon Cult
        [33060000, convergence10NotesUrl], // Blighted Branch
        [33290000, convergence10NotesUrl], // Dragonkin Scepter
        [33300000, convergence10NotesUrl], // Ranni's Staff
        [33310000, convergence10NotesUrl], // Snow Witch Staff
        [33320000, convergence10NotesUrl], // Staff of Briar
        [33330000, convergence10NotesUrl], // Lavastone Staff
        [33340000, convergence10NotesUrl], // Tempestcaller Staff
        [33350000, convergence10NotesUrl], // Stormcaller Staff
        [34100000, convergence10NotesUrl], // Godskin Seal
        [34110000, convergence10NotesUrl], // Fire Monk's Seal
        [34120000, convergence10NotesUrl], // Dragon Cult Seal
        [34130000, convergence10NotesUrl], // Earthbreaker Seal
        [34140000, convergence10NotesUrl], // Fingerprint Seal
        [34150000, convergence10NotesUrl], // Mohgwyn Seal
        [34160000, convergence10NotesUrl], // War Surgeon's Seal
        [34170000, convergence10NotesUrl], // Seal of Rot
        [34180000, convergence10NotesUrl], // Pest's Seal
        [34190000, convergence10NotesUrl], // Spiritshaper Seal
        [34200000, convergence10NotesUrl], // Mystic Seal
        [1050000, "https://eldenring.fandom.com/Crystal_Knife"], // Underworld Dagger
        [2070000, "https://eldenring.fandom.com/Golden_Epitaph"], // Draconic Epitaph
        [2140000, "https://eldenring.fandom.com/Sword_of_Night_and_Flame"], // Sword of the Cosmos
        [2150000, "https://eldenring.fandom.com/Crystal_Sword"], // Molten Sword
        [2200000, "https://eldenring.fandom.com/Miquellan_Knight's_Sword"], // Fell Flame Sword
        [2250000, "https://eldenring.fandom.com/Lazuli_Glintstone_Sword"], // Dragonkin Seeker Sword
        [3070000, "https://eldenring.fandom.com/Alabaster_Lord's_Sword"], // Alabaster Lord's Greatsword
        [18110000, "https://eldenring.fandom.com/Guardian's_Swordspear"], // Guardian Spearblade
        [18140000, "https://eldenring.fandom.com/Dragon_Halberd"], // Dragonkin Halberd
        [33050000, "https://eldenring.fandom.com/Gelmir_Glintstone_Staff"], // Gelmir Lava Staff
        [33200000, "https://eldenring.fandom.com/Academy_Glintstone_Staff"], // Dragon Student Staff
        [33240000, "https://eldenring.fandom.com/Lusat's_Glintstone_Staff"], // Lusat's Night Staff
      ] as const)
    : []),
]);

// Allow skipping the unpack step (which is pretty slow) if it's already been done on a previous run.
if (env.SKIP_UNPACK && env.SKIP_UNPACK !== "0") {
  debug("Skipping unpack because environment variable SKIP_UNPACK is defined");
} else {
  unpackFiles();
}
const attackElementCorrectParams = readParam(attackElementCorrectFile);
const calcCorrectGraphs = readParam(calcCorrectGraphFile);
const equipParamWeapons = readParam(equipParamWeaponFile);
const reinforceParamWeapons = readParam(reinforceParamWeaponFile);
const spEffectParams = readParam(spEffectFile);
const menuValueTableParams = readParam(menuValueTableFile);
const menuText = readFmgXml(menuTextFmgFile);
const weaponNames = readFmgXml(weaponNameFmgFile);
const dlcWeaponNames = readFmgXml(dlcWeaponNameFmgFile);

// WeaponName_dlc02.fmg

function ifNotDefault<T>(value: T, defaultValue: T): T | undefined {
  return value === defaultValue ? undefined : value;
}

/**
 * @returns true if the weapon cannot have affinities applied. This definition of "unique" helps us
 * filter out invalid EquipParamWeapons like Fire Treespear, and is used as a special fake affinity
 * for filtering purposes.
 */
function isUniqueWeapon(row: ParamRow) {
  // Consider a weapon unique if it can't have Ashes of War (e.g. torches, moonveil) or can't have
  // affinities selected when applying Ashes of War (e.g. bows)
  return row.gemMountType === 0 || row.disableGemAttr === 1;
}

const unobtainableWeapons = new Set(
  isReforged
    ? [
        1910000, // Reduvia (Esgar- Priest of Blood)
        11170000, // Gideon's Scepter of the All-Knowing
        17080000, // Vyke's War Spear NXE
        17080100, // Vyke's War Spear NXE [Heavy]
        17080200, // Vyke's War Spear NXE [Keen]
        17080300, // Vyke's War Spear NXE [Quality]
        17080400, // Vyke's War Spear NXE [Fire]
        17080500, // Vyke's War Spear NXE [Fell]
        17080600, // Vyke's War Spear NXE [Lightning]
        17080700, // Vyke's War Spear NXE [Sacred]
        17080800, // Vyke's War Spear NXE [Magic]
        17080900, // Vyke's War Spear NXE [Cold]
        17081000, // Vyke's War Spear NXE [Poison]
        17081100, // Vyke's War Spear NXE [Blood]
        17081200, // Vyke's War Spear NXE [Occult]
        17081300, // Vyke's War Spear NXE [Bolt]
        17081400, // Vyke's War Spear NXE [Soporific]
        17081500, // Vyke's War Spear NXE [Frenzied]
        17081600, // Vyke's War Spear NXE [Magma]
        17081700, // Vyke's War Spear NXE [Rotten]
        17081800, // Vyke's War Spear NXE [Cursed]
        17081900, // Vyke's War Spear NXE [Night]
        17082000, // Vyke's War Spear NXE [Gravitational]
        17082100, // Vyke's War Spear NXE [Blessed]
        17082200, // Vyke's War Spear NXE [Bestial]
        17082300, // Vyke's War Spear NXE [Fated]
      ]
    : isConvergence
    ? [
        // These aren't mentioned in the notes for the public alpha, likely WIP
        6050000, // Estoc of the Serpent Priest
        10060000, // Caimar's Battlestaff
        19030000, // Moon Breaker Scythe

        // Removed vanilla
        33040000, // Crystal Staff
        33090000, // Carian Regal Scepter
        33130000, // Astrologer's Staff
        33170000, // Carian Glintblade Staff
        33190000, // Albinauric Staff
        33210000, // Carian Glintstone Staff
        33270000, // Rotten Crystal Staff
        34070000, // Erdtree Seal
        34080000, // Dragon Communion Seal
      ]
    : [],
);

// TODO: add DLC weapon IDs when DLC releases
const dlcWeapons = new Set<number>([]);

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
        [21140000, WeaponType.FIST], // Fellthorn Clutches
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
  WeaponType.DUAL_CATALYST,
  WeaponType.SACRED_SEAL,
  WeaponType.SMALL_SHIELD,
  WeaponType.MEDIUM_SHIELD,
  WeaponType.GREATSHIELD,
  WeaponType.TORCH,
  WeaponType.HAND_TO_HAND,
  WeaponType.PERFUME_BOTTLE,
  WeaponType.THRUSTING_SHIELD,
  WeaponType.THROWING_BLADE,
  WeaponType.BACKHAND_BLADE,
  WeaponType.LIGHT_GREATSWORD,
  WeaponType.GREAT_KATANA,
  WeaponType.BEAST_CLAW,
]);

function isSupportedWeaponType(wepType: number): wepType is WeaponType {
  return supportedWeaponTypes.has(wepType);
}

function parseWeapon(row: ParamRow): EncodedWeaponJson | null {
  let name: string;
  let dlc = false;

  if (weaponNames.has(row.id)) {
    name = weaponNames.get(row.id)!;
  } else if (dlcWeaponNames.has(row.id)) {
    name = dlcWeaponNames.get(row.id)!;
    dlc = true;
  } else {
    debug(`No weapon title found for ${row.id}, ignoring`);
    return null;
  }
  if (name.includes("[ERROR]") || name.includes("%null%")) {
    debug(`Excluded weapon title "${name}" for ${row.id}, ignoring`);
    return null;
  }

  const weaponType = wepTypeOverrides.get(row.id) ?? row.wepType;
  if (!isSupportedWeaponType(weaponType)) {
    // Log a message if this is something other than ammunition or other placeholder weapon types
    if (![0, 81, 83, 85, 86].includes(weaponType)) {
      debug(`Unknown weapon type ${weaponType} on "${name}", ignoring`);
    }
    return null;
  }

  if (unobtainableWeapons.has(row.id)) {
    return null;
  }

  if (!reinforceParamWeapons.has(row.reinforceTypeId)) {
    debug(`Unknown reinforceTypeId ${row.reinforceTypeId} on "${name}", ignoring`);
    return null;
  }

  if (!attackElementCorrectParams.has(row.attackElementCorrectId)) {
    debug(`Unknown AttackElementCorrectParam ${row.attackElementCorrectId} on "${name}, ignoring`);
    return null;
  }

  const affinityId = (row.id % 10000) / 100;
  const uninfusedWeapon = equipParamWeapons.get(row.id - 100 * affinityId)!;
  if (!uninfusedWeapon) {
    throw new Error(`No uninfused weapon ${row.id - 100 * affinityId} for ${row.id} ${name}`);
  }

  if (affinityId !== Math.floor(affinityId)) {
    debug(`Unknown affinity for ID ${row.id} on "${name}", ignoring`);
    return null;
  }

  // Some weapons have infused versions in EquipParamWeapon even though ashes of war can't be
  // applied to them, e.g. Magic Great Club. Exclude these fake weapons from the list.
  if (affinityId !== 0 && isUniqueWeapon(uninfusedWeapon)) {
    debug(`Cannot apply affinity ${affinityId} on unique weapon "${name}", ignoring`);
    return null;
  }

  const attackPowerTypes = new Set<AttackPowerType>();

  let statusSpEffectParamIds: number[] | undefined = [
    row.spEffectBehaviorId0,
    row.spEffectBehaviorId1,
    row.spEffectBehaviorId2,
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
  if (isVanilla && row.id === 32131200) {
    statusSpEffectParamIds = [0, 0, 0];
  }

  const attack: (readonly [AttackPowerType, number])[] = (
    [
      [AttackPowerType.PHYSICAL, row.attackBasePhysics],
      [AttackPowerType.MAGIC, row.attackBaseMagic],
      [AttackPowerType.FIRE, row.attackBaseFire],
      [AttackPowerType.LIGHTNING, row.attackBaseThunder],
      [AttackPowerType.HOLY, row.attackBaseDark],
    ] as const
  ).filter(([attackPowerType, attackPower]) => {
    if (attackPower) {
      attackPowerTypes.add(attackPowerType);
      return true;
    }
    return false;
  });

  // Spells use a CalcCorrectGraph based on the type of damage they deal. These are normally the
  // same, but The Convergence has different CalcCorrectGraphs to give spell tools varying
  // effectiveness with different damage types.
  if (row.enableMagic || row.enableMiracle) {
    allDamageTypes.forEach((damageType) => attackPowerTypes.add(damageType));
  }

  const calcCorrectGraphIds = {
    [AttackPowerType.PHYSICAL]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.PHYSICAL) ? row.correctType_Physics : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.MAGIC]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.MAGIC) ? row.correctType_Magic : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.FIRE]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.FIRE) ? row.correctType_Fire : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.LIGHTNING]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.LIGHTNING) ? row.correctType_Thunder : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.HOLY]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.HOLY) ? row.correctType_Dark : undefined,
      defaultDamageCalcCorrectGraphId,
    ),
    [AttackPowerType.POISON]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.POISON) ? row.correctType_Poison : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.BLEED]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.BLEED) ? row.correctType_Blood : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.SLEEP]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.SLEEP) ? row.correctType_Sleep : undefined,
      defaultStatusCalcCorrectGraphId,
    ),
    [AttackPowerType.MADNESS]: ifNotDefault(
      attackPowerTypes.has(AttackPowerType.MADNESS) ? row.correctType_Madness : undefined,
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
    name,
    weaponName: (weaponNames.get(uninfusedWeapon.id) ?? dlcWeaponNames.get(uninfusedWeapon.id))!,
    url: urlOverrides.get(uninfusedWeapon.id),
    affinityId: isUniqueWeapon(row) ? -1 : affinityId,
    weaponType,
    requirements: {
      str: ifNotDefault(row.properStrength, 0),
      dex: ifNotDefault(row.properAgility, 0),
      int: ifNotDefault(row.properMagic, 0),
      fai: ifNotDefault(row.properFaith, 0),
      arc: ifNotDefault(row.properLuck, 0),
    },
    attack,
    attributeScaling: (
      [
        ["str", row.correctStrength / 100],
        ["dex", row.correctAgility / 100],
        ["int", row.correctMagic / 100],
        ["fai", row.correctFaith / 100],
        ["arc", row.correctLuck / 100],
      ] as const
    ).filter(([, attributeScaling]) => attributeScaling),
    statusSpEffectParamIds,
    reinforceTypeId: row.reinforceTypeId,
    attackElementCorrectId: row.attackElementCorrectId,
    calcCorrectGraphIds,
    paired: ifNotDefault(row.isDualBlade === 1, false),
    sorceryTool: ifNotDefault(row.enableMagic === 1, false),
    incantationTool: ifNotDefault(row.enableMiracle === 1, false),
    dlc: dlc,
  };
}

function parseCalcCorrectGraph(row: ParamRow): CalcCorrectGraph {
  return [
    {
      maxVal: row.stageMaxVal0,
      maxGrowVal: row.stageMaxGrowVal0 / 100,
      adjPt: row.adjPt_maxGrowVal0,
    },
    {
      maxVal: row.stageMaxVal1,
      maxGrowVal: row.stageMaxGrowVal1 / 100,
      adjPt: row.adjPt_maxGrowVal1,
    },
    {
      maxVal: row.stageMaxVal2,
      maxGrowVal: row.stageMaxGrowVal2 / 100,
      adjPt: row.adjPt_maxGrowVal2,
    },
    {
      maxVal: row.stageMaxVal3,
      maxGrowVal: row.stageMaxGrowVal3 / 100,
      adjPt: row.adjPt_maxGrowVal3,
    },
    {
      maxVal: row.stageMaxVal4,
      maxGrowVal: row.stageMaxGrowVal4 / 100,
      adjPt: row.adjPt_maxGrowVal4,
    },
  ];
}

function parseAttackElementCorrect(row: ParamRow): Partial<Record<AttackPowerType, Attribute[]>> {
  function attributeArray(...args: (Attribute | 0)[]) {
    const attributes = args.filter((attribute): attribute is Attribute => !!attribute);
    return attributes.length ? attributes : undefined;
  }
  return {
    [AttackPowerType.PHYSICAL]: attributeArray(
      row.isStrengthCorrect_byPhysics && "str",
      row.isDexterityCorrect_byPhysics && "dex",
      row.isFaithCorrect_byPhysics && "fai",
      row.isMagicCorrect_byPhysics && "int",
      row.isLuckCorrect_byPhysics && "arc",
    ),
    [AttackPowerType.MAGIC]: attributeArray(
      row.isStrengthCorrect_byMagic && "str",
      row.isDexterityCorrect_byMagic && "dex",
      row.isFaithCorrect_byMagic && "fai",
      row.isMagicCorrect_byMagic && "int",
      row.isLuckCorrect_byMagic && "arc",
    ),
    [AttackPowerType.FIRE]: attributeArray(
      row.isStrengthCorrect_byFire && "str",
      row.isDexterityCorrect_byFire && "dex",
      row.isFaithCorrect_byFire && "fai",
      row.isMagicCorrect_byFire && "int",
      row.isLuckCorrect_byFire && "arc",
    ),
    [AttackPowerType.LIGHTNING]: attributeArray(
      row.isStrengthCorrect_byThunder && "str",
      row.isDexterityCorrect_byThunder && "dex",
      row.isFaithCorrect_byThunder && "fai",
      row.isMagicCorrect_byThunder && "int",
      row.isLuckCorrect_byThunder && "arc",
    ),
    [AttackPowerType.HOLY]: attributeArray(
      row.isStrengthCorrect_byDark && "str",
      row.isDexterityCorrect_byDark && "dex",
      row.isFaithCorrect_byDark && "fai",
      row.isMagicCorrect_byDark && "int",
      row.isLuckCorrect_byDark && "arc",
    ),
  };
}

function parseReinforceParamWeapon(row: ParamRow): ReinforceParamWeapon {
  return {
    attack: {
      [AttackPowerType.PHYSICAL]: row.physicsAtkRate,
      [AttackPowerType.MAGIC]: row.magicAtkRate,
      [AttackPowerType.FIRE]: row.fireAtkRate,
      [AttackPowerType.LIGHTNING]: row.thunderAtkRate,
      [AttackPowerType.HOLY]: row.darkAtkRate,
    },
    attributeScaling: {
      str: row.correctStrengthRate,
      dex: row.correctAgilityRate,
      int: row.correctMagicRate,
      fai: row.correctFaithRate,
      arc: row.correctLuckRate,
    },
    statusSpEffectId1: ifNotDefault(row.spEffectId1, 0),
    statusSpEffectId2: ifNotDefault(row.spEffectId2, 0),
    statusSpEffectId3: ifNotDefault(row.spEffectId3, 0),
  };
}

function parseStatusSpEffectParams(
  statusSpEffectParamId: number,
): Partial<Record<AttackPowerType, number>> | null {
  const spEffectRow = spEffectParams.get(statusSpEffectParamId);
  if (!spEffectRow) {
    return null;
  }

  const statuses = {
    [AttackPowerType.POISON]: ifNotDefault(spEffectRow.poizonAttackPower, 0),
    [AttackPowerType.SCARLET_ROT]: ifNotDefault(spEffectRow.diseaseAttackPower, 0),
    [AttackPowerType.BLEED]: ifNotDefault(spEffectRow.bloodAttackPower, 0),
    [AttackPowerType.FROST]: ifNotDefault(spEffectRow.freezeAttackPower, 0),
    [AttackPowerType.SLEEP]: ifNotDefault(spEffectRow.sleepAttackPower, 0),
    [AttackPowerType.MADNESS]: ifNotDefault(spEffectRow.madnessAttackPower, 0),
    [AttackPowerType.DEATH_BLIGHT]: ifNotDefault(spEffectRow.curseAttackPower, 0),
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
for (const [id, row] of menuValueTableParams) {
  // 1 = scaling labels
  if (row.compareType === 1 && id >= 100) {
    scalingTiersJson.push([row.value / 100, menuText.get(row.textId)!]);
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
