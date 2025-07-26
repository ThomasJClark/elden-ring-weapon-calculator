/*
 * Usage: yarn rebuildWeaponData
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, join, parse } from "node:path";
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
  type AttackElementCorrect,
} from "./calculator/calculator.ts";
import {
  type EncodedWeaponJson,
  type EncodedRegulationDataJson,
  type ReinforceParamWeapon,
  type CalcCorrectGraph,
  defaultStatusCalcCorrectGraphId,
  defaultDamageCalcCorrectGraphId,
} from "./regulationData.ts";
import vanillaWeaponIds from "./vanillaWeaponIds.ts";

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
const isClevers = outputFile.includes("clevers");
const isVanilla = !isReforged && !isConvergence && !isClevers;

if (isClevers) {
  // Don't exclude vanilla weapons that are reworked in the mod
  vanillaWeaponIds.delete(3150000); // Marais Dancing Blade
  vanillaWeaponIds.delete(4050000); // Masterworked Starscourge Greatswords
  vanillaWeaponIds.delete(8100000); // Morgott's Holy Armaments
  vanillaWeaponIds.delete(9030000); // Voidwalker Meteoric Ore Blade
  vanillaWeaponIds.delete(9082200); // God-Hunting Nagamaki
  vanillaWeaponIds.delete(17500000); // Masterworked Spear of the Impaler
  vanillaWeaponIds.delete(23060000); // Awakened Dragon Greatclaw
}

const tmpDir = join(tmpdir(), "elden-ring-weapon-calculator", parse(outputFile).name);

const attackElementCorrectFile = "AttackElementCorrectParam.param";
const calcCorrectGraphFile = "CalcCorrectGraph.param";
const equipParamWeaponFile = "EquipParamWeapon.param";
const reinforceParamWeaponFile = "ReinforceParamWeapon.param";
const spEffectFile = "SpEffectParam.param";
const menuValueTableFile = "MenuValueTableParam.param";
const weaponNameFmgFile = "WeaponName.fmg";
const dlcWeaponNameFmgFile = "WeaponName_dlc01.fmg";
const menuTextFmgFile = "GR_MenuText.fmg";

/**
 * Unpack the .param and .fmg files from the game or mod into an XML format we can read
 */
function unpackFiles() {
  function witchy(paths: string[]) {
    const { error } = spawnSync(
      join(getWitchyDir(), "WitchyBND.exe"),
      ["--passive", "--parallel", ...paths],
      {
        stdio: "inherit",
        windowsHide: true,
      },
    );

    if (error) {
      throw error;
    }
  }

  const files = [
    attackElementCorrectFile,
    calcCorrectGraphFile,
    equipParamWeaponFile,
    reinforceParamWeaponFile,
    spEffectFile,
    menuValueTableFile,
    weaponNameFmgFile,
    dlcWeaponNameFmgFile,
    menuTextFmgFile,
  ];

  const bndPaths = [
    "regulation.bin",
    join("msg", "engus", "menu.msgbnd.dcx"),
    join("msg", "engus", "menu_dlc01.msgbnd.dcx"),
    join("msg", "engus", "menu_dlc02.msgbnd.dcx"),
    join("msg", "engus", "item.msgbnd.dcx"),
    join("msg", "engus", "item_dlc01.msgbnd.dcx"),
    join("msg", "engus", "item_dlc02.msgbnd.dcx"),
  ].filter((path) => existsSync(join(dataDir, path)));

  mkdirSync(tmpDir, { recursive: true });
  for (const path of bndPaths) {
    cpSync(join(dataDir, path), join(tmpDir, path));
  }

  witchy([...bndPaths.map((path) => join(tmpDir, path))]);

  // Extract any fmg/param files we need, delete the rest of the temporary files
  const filesToExtract: string[] = [];
  for (const path of bndPaths) {
    const bndDir = join(tmpDir, path.replaceAll(".", "-"));
    for (const file of readdirSync(bndDir)) {
      if (files.includes(file)) {
        filesToExtract.push(join(bndDir, file));
      }
    }
  }

  witchy(filesToExtract);

  for (const file of filesToExtract) {
    renameSync(`${file}.xml`, join(tmpDir, `${basename(file)}.xml`));
  }

  rmSync(join(tmpDir, "regulation.bin"));
  rmSync(join(tmpDir, "regulation-bin"), { recursive: true });
  rmSync(join(tmpDir, "msg"), { recursive: true });
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
  const { text } = data.fmg.entries;
  if (!Array.isArray(text)) {
    return new Map();
  }

  return new Map(text.map((entry) => [entry.id, entry["#text"]]));
}

const urlOverrides = new Map<number, string | undefined>([
  [21530000, "https://eldenring.wiki.gg/wiki/Madding_Hand_(weapon)"],
]);
if (isReforged) {
  urlOverrides.set(1120000, "https://err.fandom.com/wiki/Iron_Spike"); // Iron Spike
  urlOverrides.set(1150000, "https://eldenring.wiki.gg/wiki/Erdsteel_Dagger"); // Brass Dagger
  urlOverrides.set(1170000, "https://err.fandom.com/wiki/Night%27s_Edge"); // Night's Edge
  urlOverrides.set(2030000, "https://err.fandom.com/wiki/Sun_Realm_Sword"); // Sun Realm Sword
  urlOverrides.set(2100000, "https://err.fandom.com/wiki/Marionette_Short_Sword"); // Marionette Short Sword
  urlOverrides.set(2120000, "https://err.fandom.com/wiki/Broken_Straight_Sword"); // Broken Straight Sword
  urlOverrides.set(4040000, "https://eldenring.wiki.gg/wiki/Zweihander"); // Zweihänder
  urlOverrides.set(4530000, "https://eldenring.wiki.gg/wiki/Remembrance_of_a_God_and_a_Lord"); // Greatswords of Radahn
  urlOverrides.set(7130000, "https://err.fandom.com/wiki/Red_Wolf%27s_Fang"); // Red Wolf's Fang
  urlOverrides.set(7160000, "https://err.fandom.com/wiki/Avionette_Scimitar"); // Avionette Scimitar
  urlOverrides.set(8090000, "https://err.fandom.com/wiki/Fury_of_Azash"); // Fury of Azash
  urlOverrides.set(8110000, "https://err.fandom.com/wiki/Makar%27s_Ceremonial_Cleaver"); // Makar's Ceremonial Cleaver
  urlOverrides.set(10100000, "https://err.fandom.com/wiki/Goldvine_Branchstaff"); // Goldvine Branchstaff
  urlOverrides.set(12030000, "https://err.fandom.com/wiki/Pumpkin_Sledge"); // Pumpkin Sledge
  urlOverrides.set(14070000, "https://err.fandom.com/wiki/Vulgar_Militia_Chain_Sickle"); // Vulgar Militia Chain Sickle
  urlOverrides.set(16100000, "https://err.fandom.com/wiki/Disciple%27s_Rotten_Branch"); // Disciple's Rotten Branch
  urlOverrides.set(16170000, "https://err.fandom.com/wiki/Grave_Spear"); // Grave Spear
  urlOverrides.set(16180000, "https://err.fandom.com/wiki/Lordsworn%27s_Spear"); // Lordsworn's Spear
  urlOverrides.set(18120000, "https://err.fandom.com/wiki/Avionette_Pig_Sticker"); // Avionette Pig Sticker
  urlOverrides.set(18170000, "https://err.fandom.com/wiki/Starcaller_Spire"); // Starcaller Spire
  urlOverrides.set(21050000, "https://err.fandom.com/wiki/Nox_Flowing_Fist"); // Nox Flowing Fist
  urlOverrides.set(21140000, "https://err.fandom.com/wiki/Fellthorn_Clutches"); // Fellthorn Clutches
  urlOverrides.set(22040000, "https://err.fandom.com/wiki/Crude_Iron_Claws"); // Crude Iron Claws
  urlOverrides.set(23090000, "https://err.fandom.com/wiki/Fellthorn_Stake"); // Fellthorn Stake
  urlOverrides.set(11110000, "https://eldenring.wiki.gg/Scepter_of_the_All-Knowing"); // Scepter of the All-Knowing Staff
  urlOverrides.set(16140000, "https://eldenring.wiki.gg/wiki/Spiked_Spear"); // Marionette Spiked Spear
  urlOverrides.set(18140000, "https://eldenring.wiki.gg/wiki/Dragon_Halberd"); // Dragonscale Halberd
  urlOverrides.set(23150000, "https://eldenring.wiki.gg/wiki/Rotten_Greataxe"); // Rotten Duelist Greataxe
  urlOverrides.set(33210000, "https://eldenring.wiki.gg/Carian_Glintstone_Staff"); // Dark Glintstone Staff
  urlOverrides.set(33300000, "https://err.fandom.com/wiki/Snow_Witch_Scepter"); // Snow Witch Scepter
} else if (isConvergence) {
  const convergenceAlphaNotes =
    "https://docs.google.com/document/d/1JHX3bMxnIIct8MSZnXkyqpmhYKLPt8p8HY9FUcXKUNE/preview?tab=t.0#heading=h.79qlt4tgl68h";
  const convergence21notes =
    "https://docs.google.com/document/d/1-5k899P5b3lo-4-EDYw9mkM2j4v62xSnnsxZEvwffXo/edit?tab=t.0#heading=h.4qcy1ray1wky";
  urlOverrides.set(110000, "https://eldenring.wiki.gg/wiki/Unarmed"); // Unarmed
  urlOverrides.set(
    3070000,
    "https://www.convergencemod.com/weapons/greatswords/alabaster-lords-sword/",
  ); // Alabaster Lord's Greatsword
  urlOverrides.set(8500000, "https://www.convergencemod.com/weapons/greataxes/putrescent-cleaver/"); // Putrescence Cleaver
  urlOverrides.set(
    10080000,
    "https://www.convergencemod.com/weapons/twinblades/gargoyles-twinblades/",
  ); // Gargoyle's Twinblade
  urlOverrides.set(10110000, "https://www.convergencemod.com/gilded-quarterstaff/"); // Gilded Quarterstaff
  urlOverrides.set(31350000, "https://www.convergencemod.com/spell-casting-tools/aegis-of-hadea/"); // Aegis of Hadea
  urlOverrides.set(
    34030000,
    "https://www.convergencemod.com/spell-casting-tools/grave-stone-seal/",
  ); // Gravel Stone Seal
  urlOverrides.set(34110000, "https://www.convergencemod.com/spell-casting-tools/fire-monk-seal/"); // Fire Monk's Seal
  urlOverrides.set(
    60530000,
    "https://www.convergencemod.com/weapons/hand-to-hand-arts/bracelets-of-shadow/",
  ); // Braetlet of Shadow
  urlOverrides.set(68500000, "https://www.convergencemod.com/weapons/beast-claws/beast-claws/"); // Beast Claw
  urlOverrides.set(
    10100000,
    "https://www.convergencemod.com/weapons/twinblades/palm-ax-twinblade/",
  ); // Palm-Ax Twinblades
  urlOverrides.set(30300000, convergenceAlphaNotes); // Crest of the Dragon Cult
  urlOverrides.set(21550000, undefined); // Shield of Night
  urlOverrides.set(30000000, undefined); // Buckler
  urlOverrides.set(30010000, undefined); // Perfumer's Shield
  urlOverrides.set(30020000, undefined); // Man-Serpent's Shield
  urlOverrides.set(30030000, undefined); // Rickety Shield
  urlOverrides.set(30040000, undefined); // Pillory Shield
  urlOverrides.set(30060000, undefined); // Beastman's Jar-Shield
  urlOverrides.set(30070000, undefined); // Red Thorn Roundshield
  urlOverrides.set(30080000, undefined); // Scripture Wooden Shield
  urlOverrides.set(30090000, undefined); // Riveted Wooden Shield
  urlOverrides.set(30100000, undefined); // Blue-White Wooden Shield
  urlOverrides.set(30110000, undefined); // Rift Shield
  urlOverrides.set(30120000, undefined); // Iron Roundshield
  urlOverrides.set(30130000, undefined); // Gilded Iron Shield
  urlOverrides.set(30140000, undefined); // Ice Crest Shield
  urlOverrides.set(30150000, undefined); // Smoldering Shield
  urlOverrides.set(30160000, convergence21notes); // Hermit's Buckler
  urlOverrides.set(30170000, convergence21notes); // Shield of Alacrity
  urlOverrides.set(30190000, undefined); // Spiralhorn Shield
  urlOverrides.set(30200000, undefined); // Coil Shield
  urlOverrides.set(30510000, undefined); // Smithscript Shield
  urlOverrides.set(31000000, undefined); // Kite Shield
  urlOverrides.set(31010000, undefined); // Marred Leather Shield
  urlOverrides.set(31020000, undefined); // Marred Wooden Shield
  urlOverrides.set(31030000, undefined); // Banished Knight's Shield
  urlOverrides.set(31040000, undefined); // Albinauric Shield
  urlOverrides.set(31050000, undefined); // Sun Realm Shield
  urlOverrides.set(31060000, undefined); // Silver Mirrorshield
  urlOverrides.set(31070000, undefined); // Round Shield
  urlOverrides.set(31080000, undefined); // Scorpion Kite Shield
  urlOverrides.set(31090000, undefined); // Twinbird Kite Shield
  urlOverrides.set(31100000, undefined); // Blue-Gold Kite Shield
  urlOverrides.set(31130000, undefined); // Brass Shield
  urlOverrides.set(31140000, undefined); // Great Turtle Shell
  urlOverrides.set(31170000, undefined); // Shield of the Guilty
  urlOverrides.set(31180000, convergence21notes); // Shield of Starlight
  urlOverrides.set(31190000, undefined); // Carian Knight's Shield
  urlOverrides.set(31230000, undefined); // Large Leather Shield
  urlOverrides.set(31240000, undefined); // Horse Crest Wooden Shield
  urlOverrides.set(31250000, undefined); // Candletree Wooden Shield
  urlOverrides.set(31260000, undefined); // Flame Crest Wooden Shield
  urlOverrides.set(31270000, undefined); // Hawk Crest Wooden Shield
  urlOverrides.set(31280000, undefined); // Beast Crest Heater Shield
  urlOverrides.set(31290000, undefined); // Red Crest Heater Shield
  urlOverrides.set(31300000, undefined); // Blue Crest Heater Shield
  urlOverrides.set(31310000, undefined); // Eclipse Crest Heater Shield
  urlOverrides.set(31320000, undefined); // Inverted Hawk Heater Shield
  urlOverrides.set(31330000, undefined); // Heater Shield
  urlOverrides.set(31340000, undefined); // Black Leather Shield
  urlOverrides.set(31500000, undefined); // Messmer Soldier Shield
  urlOverrides.set(31510000, undefined); // Wolf Crest Shield
  urlOverrides.set(31520000, undefined); // Serpent Crest Shield
  urlOverrides.set(31530000, undefined); // Golden Lion Shield
  urlOverrides.set(32000000, undefined); // Dragon Towershield
  urlOverrides.set(32020000, undefined); // Distinguished Greatshield
  urlOverrides.set(32030000, undefined); // Crucible Hornshield
  urlOverrides.set(32040000, undefined); // Dragonclaw Shield
  urlOverrides.set(32050000, undefined); // Briar Greatshield
  urlOverrides.set(32080000, undefined); // Erdtree Greatshield
  urlOverrides.set(32090000, undefined); // Golden Beast Crest Shield
  urlOverrides.set(32120000, undefined); // Jellyfish Shield
  urlOverrides.set(32130000, undefined); // Fingerprint Stone Shield
  urlOverrides.set(32140000, undefined); // Icon Shield
  urlOverrides.set(32150000, undefined); // One-Eyed Shield
  urlOverrides.set(32160000, undefined); // Visage Shield
  urlOverrides.set(32170000, undefined); // Spiked Palisade Shield
  urlOverrides.set(32190000, undefined); // Manor Towershield
  urlOverrides.set(32200000, undefined); // Crossed-Tree Towershield
  urlOverrides.set(32210000, undefined); // Inverted Hawk Towershield
  urlOverrides.set(32220000, undefined); // Ant's Skull Plate
  urlOverrides.set(32230000, undefined); // Redmane Greatshield
  urlOverrides.set(32240000, undefined); // Eclipse Crest Greatshield
  urlOverrides.set(32250000, undefined); // Cuckoo Greatshield
  urlOverrides.set(32260000, undefined); // Golden Greatshield
  urlOverrides.set(32270000, undefined); // Gilded Greatshield
  urlOverrides.set(32280000, undefined); // Haligtree Crest Greatshield
  urlOverrides.set(32290000, undefined); // Wooden Greatshield
  urlOverrides.set(32300000, undefined); // Lordsworn's Shield
  urlOverrides.set(32500000, undefined); // Black Steel Greatshield
  urlOverrides.set(32520000, undefined); // Verdigris Greatshield
  urlOverrides.set(62500000, undefined); // Dueling Shield
  urlOverrides.set(62510000, undefined); // Carian Thrusting Shield
} else if (isClevers) {
  urlOverrides.set(1550000, "https://www.nexusmods.com/eldenring/mods/2663"); // Storm Demon
  urlOverrides.set(1560000, "https://www.nexusmods.com/eldenring/mods/4649"); // Sacred Arsenal
  urlOverrides.set(2800000, "https://www.nexusmods.com/eldenring/mods/2896"); // Vengeance and Glory
  urlOverrides.set(3150000, "https://www.nexusmods.com/eldenring/mods/2340"); // Marais Dancing Blade
  urlOverrides.set(3650000, "https://www.nexusmods.com/eldenring/mods/2220"); // Deathborne Odachi
  urlOverrides.set(3710000, "https://www.nexusmods.com/eldenring/mods/3623"); // God's Bane
  urlOverrides.set(4050000, "https://www.nexusmods.com/eldenring/mods/2756"); // Masterworked Starscourge Greatswords
  urlOverrides.set(4800000, "https://www.nexusmods.com/eldenring/mods/3248"); // Deathwalker
  urlOverrides.set(8100000, "https://www.nexusmods.com/eldenring/mods/1506"); // Morgott's Holy Armaments
  urlOverrides.set(9030000, "https://www.nexusmods.com/eldenring/mods/1649"); // Voidwalker Meteoric Ore Blade
  urlOverrides.set(9082200, "https://www.nexusmods.com/eldenring/mods/1373"); // God-Hunting Nagamaki
  urlOverrides.set(9250000, "https://www.nexusmods.com/eldenring/mods/3661"); // Heaven Splitter
  urlOverrides.set(9270000, "https://www.nexusmods.com/eldenring/mods/3322"); // Hinokami
  urlOverrides.set(9280000, "https://www.nexusmods.com/eldenring/mods/3751"); // Tachikaze
  urlOverrides.set(9940000, "https://www.nexusmods.com/eldenring/mods/2268"); // Moon Lightblade
  urlOverrides.set(9950000, "https://www.nexusmods.com/eldenring/mods/2268"); // Blood Lightblade
  urlOverrides.set(9960000, "https://www.nexusmods.com/eldenring/mods/2268"); // Dual Blood Lightblade
  urlOverrides.set(9970000, "https://www.nexusmods.com/eldenring/mods/2268"); // Dual Moon Lightblade
  urlOverrides.set(10600000, "https://www.nexusmods.com/eldenring/mods/2182"); // Airbending Staff
  urlOverrides.set(10840000, "https://www.nexusmods.com/eldenring/mods/6805"); // Nonosama Bo
  urlOverrides.set(16680000, "https://www.nexusmods.com/eldenring/mods/4344"); // Bloodstarved Spear
  urlOverrides.set(17500000, "https://www.nexusmods.com/eldenring/mods/5307"); // Masterworked Spear of the Impaler
  urlOverrides.set(19800000, "https://www.nexusmods.com/eldenring/mods/2626"); // Frenzied Reaper
  urlOverrides.set(23060000, "https://www.nexusmods.com/eldenring/mods/1519"); // Awakened Dragon Greatclaw
  urlOverrides.set(33710000, "https://www.nexusmods.com/eldenring/mods/3833"); // Dark Moon Ring
  urlOverrides.set(60650000, "https://www.nexusmods.com/eldenring/mods/4215"); // Meteor Fists
  urlOverrides.set(60660000, "https://www.nexusmods.com/eldenring/mods/2051"); // Martial Arts
  urlOverrides.set(60670000, "https://www.nexusmods.com/eldenring/mods/1693"); // Firebending
  urlOverrides.set(60700000, "https://www.nexusmods.com/eldenring/mods/2464"); // Earthbending
  urlOverrides.set(66790000, "https://www.nexusmods.com/eldenring/mods/7154"); // Great Shinobi Blade
}

const convergenceWikiWeaponTypePaths = new Map<WeaponType, string>([
  [WeaponType.DAGGER, "/weapons/daggers"],
  [WeaponType.STRAIGHT_SWORD, "/weapons/straight-swords"],
  [WeaponType.GREATSWORD, "/weapons/greatswords"],
  [WeaponType.COLOSSAL_SWORD, "/weapons/colossal-swords"],
  [WeaponType.CURVED_SWORD, "/weapons/curved-swords"],
  [WeaponType.CURVED_GREATSWORD, "/weapons/curved-greatswords"],
  [WeaponType.KATANA, "/weapons/katanas"],
  [WeaponType.TWINBLADE, "/weapons/twinblades"],
  [WeaponType.THRUSTING_SWORD, "/weapons/thrusting-swords"],
  [WeaponType.HEAVY_THRUSTING_SWORD, "/weapons/heavy-thrusting-swords"],
  [WeaponType.AXE, "/weapons/axes"],
  [WeaponType.GREATAXE, "/weapons/greataxes"],
  [WeaponType.HAMMER, "/weapons/hammers"],
  [WeaponType.GREAT_HAMMER, "/weapons/greathammers"],
  [WeaponType.FLAIL, "/weapons/flails"],
  [WeaponType.SPEAR, "/weapons/spears"],
  [WeaponType.GREAT_SPEAR, "/weapons/greatspears"],
  [WeaponType.HALBERD, "/weapons/halberds"],
  [WeaponType.REAPER, "/weapons/reapers"],
  [WeaponType.FIST, "/weapons/fist-weapons"],
  [WeaponType.CLAW, "/weapons/claws"],
  [WeaponType.WHIP, "/weapons/whips"],
  [WeaponType.COLOSSAL_WEAPON, "/weapons/colossal-weapons"],
  [WeaponType.LIGHT_BOW, "/weapons/lightbows"],
  [WeaponType.BOW, "/weapons/longbows"],
  [WeaponType.GREATBOW, "/weapons/greatbows"],
  [WeaponType.CROSSBOW, "/weapons/crossbows"],
  [WeaponType.BALLISTA, "/weapons/ballistas"],
  [WeaponType.GLINTSTONE_STAFF, "/spell-casting-tools"],
  [WeaponType.DUAL_CATALYST, "/spell-casting-tools"],
  [WeaponType.SACRED_SEAL, "/spell-casting-tools"],
  [WeaponType.SMALL_SHIELD, "/shields"],
  [WeaponType.MEDIUM_SHIELD, "/shields"],
  [WeaponType.GREATSHIELD, "/shields"],
  [WeaponType.TORCH, "/weapons/torches"],
  [WeaponType.HAND_TO_HAND, "/weapons/hand-to-hand-arts"],
  [WeaponType.PERFUME_BOTTLE, "/weapons/perfume-bottles"],
  [WeaponType.THRUSTING_SHIELD, "/shields"],
  [WeaponType.THROWING_BLADE, "/weapons/throwing-daggers"],
  [WeaponType.BACKHAND_BLADE, "/weapons/backhand-blades"],
  [WeaponType.LIGHT_GREATSWORD, "/weapons/light-greatswords"],
  [WeaponType.GREAT_KATANA, "/weapons/great-katanas"],
  [WeaponType.BEAST_CLAW, "/weapons/beast-claws"],
]);

function getConvergenceWeaponUrl(weaponType: WeaponType, weaponName: string) {
  const weaponTypePath = convergenceWikiWeaponTypePaths.get(weaponType);
  if (!weaponTypePath) {
    return undefined;
  }
  const weaponNamePath = weaponName
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("é", "e")
    .replaceAll(/[^a-z0-9-]/g, "");
  return `https://www.convergencemod.com${weaponTypePath}/${weaponNamePath}/`;
}

// Allow skipping the unpack step (which is pretty slow) if it's already been done on a previous run.
if (env.SKIP_UNPACK && env.SKIP_UNPACK !== "0") {
  debug("Skipping unpack because environment variable SKIP_UNPACK is defined");
} else {
  unpackFiles();
}
const attackElementCorrectParams = readParam(join(tmpDir, attackElementCorrectFile));
const calcCorrectGraphs = readParam(join(tmpDir, calcCorrectGraphFile));
const equipParamWeapons = readParam(join(tmpDir, equipParamWeaponFile));
const reinforceParamWeapons = readParam(join(tmpDir, reinforceParamWeaponFile));
const spEffectParams = readParam(join(tmpDir, spEffectFile));
const menuValueTableParams = readParam(join(tmpDir, menuValueTableFile));
const menuText = readFmgXml(join(tmpDir, menuTextFmgFile));
const weaponNames = readFmgXml(join(tmpDir, weaponNameFmgFile));
const dlcWeaponNames = readFmgXml(join(tmpDir, dlcWeaponNameFmgFile));

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
        4550000, // Greatsword of Radahn (Dumb)
        17080000, // Vyke's War Spear
        33290000, // ST Staff
      ]
    : isConvergence
    ? [
        // These aren't mentioned in the notes for the public alpha, likely WIP
        6050000, // Estoc of the Serpent Priest
        19030000, // Moon Breaker Scythe

        // Removed vanilla
        4550000, // Greatsword of Radahn (Light)
        33040000, // Crystal Staff
        33090000, // Carian Regal Scepter
        33130000, // Astrologer's Staff
        33170000, // Carian Glintblade Staff
        33190000, // Albinauric Staff
        33210000, // Carian Glintstone Staff
        33270000, // Rotten Crystal Staff
        33520000, // Maternal Staff
        34070000, // Erdtree Seal
        34080000, // Dragon Communion Seal
        34500000, // Dryleaf Seal
        34510000, // Fire Knight's Seal
        34520000, // Spiraltree Seal
      ]
    : isClevers
    ? vanillaWeaponIds
    : [],
);

const affinityOverrides = new Map(
  isClevers
    ? [
        [9082200, 0], // God-Hunting Nagamaki
      ]
    : [],
);

const nameOverrides = new Map(
  isClevers
    ? [
        [3150000, "Marais Dancing Blade"],
        [4050000, "Masterworked Starscourge Greatswords"],
        [8100000, "Morgott's Holy Armaments"],
        [9030000, "Voidwalker Meteoric Ore Blade"],
        [17500000, "Masterworked Spear of the Impaler"],
        [23060000, "Awakened Dragon Greatclaw"],
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
        [2200000, WeaponType.STRAIGHT_SWORD], // Miquellan Knight's Sword
        [2250000, WeaponType.STRAIGHT_SWORD], // Lazuli Glintstone Sword
        [2530000, WeaponType.THRUSTING_SWORD], // Carian Sorcery Sword
        [4110000, WeaponType.COLOSSAL_SWORD], // Troll Knight's Sword
        [11060000, WeaponType.HAMMER], // Varre's Bouquet
        [16100000, WeaponType.SPEAR], // Disciple's Rotten Branch
        [18100000, WeaponType.HALBERD], // Loretta's War Sickle
        [18170000, WeaponType.HALBERD], // Starcaller Spire
        [21140000, WeaponType.FIST], // Fellthorn Clutches
        [34500000, WeaponType.HAND_TO_HAND], // Dryleaf Seal
      ] as const)
    : []),
]);

const supportedWeaponTypes = new Set<number>(Object.values(WeaponType));

function isSupportedWeaponType(wepType: number): wepType is WeaponType {
  return supportedWeaponTypes.has(wepType);
}

function parseWeapon(row: ParamRow): EncodedWeaponJson | null {
  let name: string;
  let dlc = false;

  const affinityId = affinityOverrides.get(row.id) ?? (row.id % 10000) / 100;
  const uninfusedWeaponId = row.id - 100 * affinityId;
  if (unobtainableWeapons.has(row.id) || unobtainableWeapons.has(uninfusedWeaponId)) {
    return null;
  }

  if (weaponNames.has(row.id)) {
    name = weaponNames.get(row.id)!;
  } else if (dlcWeaponNames.has(row.id)) {
    name = dlcWeaponNames.get(row.id)!;
    dlc = isVanilla;
  } else {
    return null;
  }
  if (name.includes("[ERROR]") || name.includes("%null%")) {
    return null;
  }

  const weaponType = wepTypeOverrides.get(row.id) ?? row.wepType;
  if (!isSupportedWeaponType(weaponType)) {
    // Log a message if this is something other than ammunition or other placeholder weapon types
    if (![0, 81, 83, 85, 86].includes(weaponType)) {
      debug(`Unknown weapon type ${weaponType} on "${name}" ${row.id}, ignoring`);
    }
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

  const uninfusedWeapon = equipParamWeapons.get(uninfusedWeaponId);
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

  const weaponName = (weaponNames.get(uninfusedWeaponId) ?? dlcWeaponNames.get(uninfusedWeaponId))!;

  return {
    name,
    weaponName,
    url: urlOverrides.has(uninfusedWeaponId)
      ? urlOverrides.get(uninfusedWeaponId)
      : isConvergence
      ? getConvergenceWeaponUrl(weaponType, weaponName)
      : undefined,
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
    dlc: ifNotDefault(dlc, false),
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

function parseAttackElementCorrect(row: ParamRow): AttackElementCorrect {
  function buildAttackElementCorrect(...args: [Attribute, boolean, number][]) {
    const entries = args
      .filter(([, isCorrect]) => isCorrect)
      .map(([attribute, , overwriteCorrect]): [Attribute, number | true] => [
        attribute,
        overwriteCorrect === -1 ? true : overwriteCorrect / 100,
      ]);
    return entries.length
      ? (Object.fromEntries(entries) as AttackElementCorrect[AttackPowerType])
      : undefined;
  }

  return {
    [AttackPowerType.PHYSICAL]: buildAttackElementCorrect(
      ["str", !!row.isStrengthCorrect_byPhysics, row.overwriteStrengthCorrectRate_byPhysics],
      ["dex", !!row.isDexterityCorrect_byPhysics, row.overwriteDexterityCorrectRate_byPhysics],
      ["fai", !!row.isFaithCorrect_byPhysics, row.overwriteFaithCorrectRate_byPhysics],
      ["int", !!row.isMagicCorrect_byPhysics, row.overwriteMagicCorrectRate_byPhysics],
      ["arc", !!row.isLuckCorrect_byPhysics, row.overwriteLuckCorrectRate_byPhysics],
    ),
    [AttackPowerType.MAGIC]: buildAttackElementCorrect(
      ["str", !!row.isStrengthCorrect_byMagic, row.overwriteStrengthCorrectRate_byMagic],
      ["dex", !!row.isDexterityCorrect_byMagic, row.overwriteDexterityCorrectRate_byMagic],
      ["fai", !!row.isFaithCorrect_byMagic, row.overwriteFaithCorrectRate_byMagic],
      ["int", !!row.isMagicCorrect_byMagic, row.overwriteMagicCorrectRate_byMagic],
      ["arc", !!row.isLuckCorrect_byMagic, row.overwriteLuckCorrectRate_byMagic],
    ),
    [AttackPowerType.FIRE]: buildAttackElementCorrect(
      ["str", !!row.isStrengthCorrect_byFire, row.overwriteStrengthCorrectRate_byFire],
      ["dex", !!row.isDexterityCorrect_byFire, row.overwriteDexterityCorrectRate_byFire],
      ["fai", !!row.isFaithCorrect_byFire, row.overwriteFaithCorrectRate_byFire],
      ["int", !!row.isMagicCorrect_byFire, row.overwriteMagicCorrectRate_byFire],
      ["arc", !!row.isLuckCorrect_byFire, row.overwriteLuckCorrectRate_byFire],
    ),
    [AttackPowerType.LIGHTNING]: buildAttackElementCorrect(
      ["str", !!row.isStrengthCorrect_byThunder, row.overwriteStrengthCorrectRate_byThunder],
      ["dex", !!row.isDexterityCorrect_byThunder, row.overwriteDexterityCorrectRate_byThunder],
      ["fai", !!row.isFaithCorrect_byThunder, row.overwriteFaithCorrectRate_byThunder],
      ["int", !!row.isMagicCorrect_byThunder, row.overwriteMagicCorrectRate_byThunder],
      ["arc", !!row.isLuckCorrect_byThunder, row.overwriteLuckCorrectRate_byThunder],
    ),
    [AttackPowerType.HOLY]: buildAttackElementCorrect(
      ["str", !!row.isStrengthCorrect_byDark, row.overwriteStrengthCorrectRate_byDark],
      ["dex", !!row.isDexterityCorrect_byDark, row.overwriteDexterityCorrectRate_byDark],
      ["fai", !!row.isFaithCorrect_byDark, row.overwriteFaithCorrectRate_byDark],
      ["int", !!row.isMagicCorrect_byDark, row.overwriteMagicCorrectRate_byDark],
      ["arc", !!row.isLuckCorrect_byDark, row.overwriteLuckCorrectRate_byDark],
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

let additionalWeaponsJson: EncodedWeaponJson[] = [];

// The Convergence has a weapon that dynamically updates. Manually add each possible variation as a
// separate weapon.
if (isConvergence) {
  const triciasPomander = 11190000;

  const row = equipParamWeapons.get(triciasPomander)!;
  const { attackBaseFire: attack } = row;
  row.attackBaseFire = 0;

  for (const { variant, ...overrides } of [
    { variant: "Fire", attackBaseFire: attack, correctLuck: 100, spEffectBehaviorId0: 108501 },
    { variant: "Lightning", attackBaseThunder: attack, correctLuck: 105, spEffectBehaviorId0: -1 },
    { variant: "Cold", attackBaseMagic: attack, correctLuck: 95, spEffectBehaviorId0: 6701 },
    { variant: "Frenzy", attackBaseFire: attack, correctLuck: 95, spEffectBehaviorId0: 6751 },
  ] as const) {
    const weaponJson = parseWeapon({ ...row, ...overrides })!;
    weaponJson.variant = variant;
    additionalWeaponsJson.push(weaponJson);
  }

  equipParamWeapons.delete(triciasPomander);
}

for (const [id, name] of nameOverrides) {
  weaponNames.set(id, name);
}

const weaponsJson = [...equipParamWeapons.values()]
  .map(parseWeapon)
  .filter((w): w is EncodedWeaponJson => w != null);

weaponsJson.push(...additionalWeaponsJson);

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
const reinforceTypesJson: { [reinforceTypeId in number]?: ReinforceParamWeapon[] } = {};

for (const { reinforceTypeId } of weaponsJson) {
  if (reinforceTypesJson[reinforceTypeId] != null) {
    continue;
  }

  const reinforceType: ReinforceParamWeapon[] = (reinforceTypesJson[reinforceTypeId] = []);

  let nextReinforceParamId = reinforceTypeId;
  for (const [reinforceParamId, reinforceParamWeapon] of reinforceParamWeapons) {
    if (reinforceParamId === nextReinforceParamId) {
      reinforceType.push(parseReinforceParamWeapon(reinforceParamWeapon));
      nextReinforceParamId++;
    } else if (reinforceType.length) {
      break;
    }
  }
}

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
