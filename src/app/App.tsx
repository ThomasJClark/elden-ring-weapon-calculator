import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  type Theme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import WeaponListSettings from "./WeaponListSettings";
import WeaponTable from "./weaponTable/WeaponTable";
import useWeaponTableRows from "./weaponTable/useWeaponTableRows";
import theme, { aprilFoolsTheme } from "./theme";
import regulationVersions, {
  canSeeAprilFools,
  type RegulationVersionName,
} from "./regulationVersions";
import useWeapons from "./useWeapons";
import useAppState from "./useAppState";
import AppBar from "./AppBar";
import RegulationVersionPicker from "./RegulationVersionPicker";
import WeaponTypePicker from "./WeaponTypePicker";
import AffinityPicker from "./AffinityPicker";
import Footer from "./Footer";
import MiscFilterPicker from "./MiscFilterPicker";
import WeaponPicker, { makeWeaponOptionsFromWeapon } from "./WeaponPicker";
import type { Weapon } from "../calculator/weapon";
import { WeaponType } from "../calculator/weaponTypes";

const useMenuState = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  // Open the menu by default on large viewports. On mobile-sized viewports, the menu is an overlay
  // that partially covers the rest of the screen.
  const [menuOpenMobile, setMenuOpenMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);

  /* eslint-disable no-restricted-globals */
  const onMenuOpenChanged = useCallback(
    (open: boolean) => {
      if (isMobile) {
        if (open) {
          history.replaceState(null, "");
          history.pushState(null, "");
          setMenuOpenMobile(true);
        } else {
          history.back();
          setMenuOpenMobile(false);
        }
      } else {
        setMenuOpen(open);
      }
    },
    [isMobile],
  );

  useEffect(() => {
    if (menuOpenMobile) {
      if (!isMobile) {
        history.back();
        setMenuOpenMobile(false);
      }

      const onPopState = (evt: PopStateEvent) => {
        setMenuOpenMobile(false);
        evt.stopPropagation();
      };

      window.addEventListener("popstate", onPopState, false);
      return () => window.removeEventListener("popstate", onPopState, false);
    }
  }, [isMobile, menuOpenMobile]);
  /* eslint-enable no-restricted-globals */

  return {
    isMobile,
    menuOpen,
    menuOpenMobile,
    onMenuOpenChanged,
  };
};

function RegulationVersionAlert({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  if (!children || dismissed) {
    return null;
  }

  return (
    <Alert icon={false} severity="info" onClose={() => setDismissed(true)}>
      {children}
    </Alert>
  );
}

const aprilFoolsWeapons: Weapon[] = [
  {
    name: "Kusabimaru",
    weaponName: "Kusabimaru",
    affinityId: 0,
    weaponType: 13,
    requirements: {},
    paired: true,
    url: "https://youtu.be/dQw4w9WgXcQ",
    attack: [
      {
        "0": 80,
      },
    ],
    attributeScaling: [
      {
        str: 1,
      },
    ],
    attackElementCorrect: {
      "0": {
        str: true,
      },
      "5": {
        arc: true,
      },
      "7": {
        arc: true,
      },
      "9": {
        arc: true,
      },
      "10": {
        arc: true,
      },
    },
    calcCorrectGraphs: {
      "0": [
        null,
        0,
        0.25,
        0.5,
        0.75,
        1,
        1.25,
        1.5,
        1.75,
        2,
        2.25,
        2.5,
        2.75,
        3,
        3.25,
        3.35,
        3.45,
        3.55,
        3.65,
        3.75,
        3.85,
        3.95,
        4.05,
        4.15,
        4.25,
        4.35,
        4.45,
        4.55,
        4.6,
        4.65,
        4.7,
        4.75,
        4.8,
        4.85,
        4.9,
        4.95,
        5,
        5.05,
        5.1,
        5.15,
        5.2,
        5.25,
        5.3,
        5.35,
        5.4,
        5.45,
        5.5,
        5.55,
        5.6,
        5.65,
        5.7,
        5.75,
        5.775,
        5.77,
        5.78,
        5.79,
        5.8,
        5.81,
        5.82,
        5.83,
        5.84,
        5.85,
        5.86,
        5.87,
        5.88,
        5.89,
        5.9,
        5.91,
        5.92,
        5.93,
        5.94,
        5.95,
        5.96,
        5.97,
        5.98,
        5.99,
        6,
        6.01,
        6.02,
        6.03,
        6.04,
        6.05,
        6.06,
        6.07,
        6.08,
        6.09,
        6.1,
        6.11,
        6.12,
        6.13,
        6.14,
        6.15,
        6.16,
        6.17,
        6.18,
        6.19,
        6.2,
        6.21,
        6.22,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
        6.23,
      ],
    },
    scalingTiers: [[0.01, "S"]],
    dlc: false,
  },
];

export default function App() {
  const {
    regulationVersionName: actualRegulationVersionName,
    affinityIds,
    weaponTypes,
    attributes,
    includeDLC,
    effectiveOnly,
    splitDamage,
    twoHanding,
    upgradeLevel,
    groupWeaponTypes,
    numericalScaling,
    sortBy,
    reverse,
    selectedWeapons,
    setRegulationVersionName: actualSetRegulationVersionName,
    setAffinityIds,
    setWeaponTypes,
    setAttribute,
    setIncludeDLC,
    setEffectiveOnly,
    setSplitDamage,
    setTwoHanding,
    setUpgradeLevel,
    setGroupWeaponTypes,
    setNumericalScaling,
    setSortBy,
    setReverse,
    setSelectedWeapons,
  } = useAppState();

  const [sawAprilFools, setSawAprilFools] = useState(() => !!localStorage.getItem("sawAprilFools"));
  const [aprilFools, setIsAprilFools] = useState(canSeeAprilFools && !sawAprilFools);
  const regulationVersionName = aprilFools ? "sekiro" : actualRegulationVersionName;
  useEffect(() => {
    document.title = aprilFools ? "Sekiro Weapon Calculator" : "Elden Ring Weapon Calculator";
  }, [aprilFools]);

  const setRegulationVersionName = useCallback(
    (newRegulationVersionName: RegulationVersionName) => {
      setIsAprilFools(newRegulationVersionName === "sekiro");
      actualSetRegulationVersionName(
        newRegulationVersionName !== "sekiro" ? newRegulationVersionName : "latest",
      );

      if (canSeeAprilFools && newRegulationVersionName !== "sekiro") {
        localStorage.setItem("sawAprilFools", "true");
        setSawAprilFools(true);
      }
    },
    [actualSetRegulationVersionName],
  );

  const { isMobile, menuOpen, menuOpenMobile, onMenuOpenChanged } = useMenuState();

  // TODO pagination if there are >200 results
  const offset = 0;
  const limit = 200;
  const { weapons: actualWeapons, loading, error } = useWeapons(actualRegulationVersionName);

  const weapons = aprilFools ? aprilFoolsWeapons : actualWeapons;

  const regulationVersion = regulationVersions[regulationVersionName];

  const { rowGroups, attackPowerTypes, spellScaling, total } = useWeaponTableRows({
    aprilFools,
    weapons,
    regulationVersion,
    offset,
    limit,
    sortBy,
    reverse,
    affinityIds,
    weaponTypes,
    attributes,
    includeDLC,
    effectiveOnly,
    twoHanding,
    upgradeLevel,
    groupWeaponTypes,
    selectedWeapons,
  });

  const tablePlaceholder = useMemo(
    () =>
      loading ? (
        <>
          <Typography variant="body1" align="center" sx={{ alignSelf: "end" }}>
            Loading weapon data
          </Typography>
          <Box display="grid" sx={{ alignSelf: "start", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        </>
      ) : (
        <Typography variant="body1" align="center" sx={{ alignSelf: "center" }}>
          No weapons match your selections
        </Typography>
      ),
    [loading],
  );

  const tableFooter = useMemo(
    () =>
      total > limit ? (
        <Typography variant="body1" align="center" sx={{ alignSelf: "center" }}>
          {total} weapons match your selections - showing the first {limit}
        </Typography>
      ) : undefined,
    [total, limit],
  );

  let mainContent: ReactNode;
  if (error) {
    mainContent = (
      <Alert severity="error" sx={{ my: 3 }}>
        Oops, something went wrong loading weapons ({error.message})
      </Alert>
    );
  } else {
    mainContent = (
      <WeaponTable
        rowGroups={rowGroups}
        placeholder={tablePlaceholder}
        footer={tableFooter}
        sortBy={sortBy}
        reverse={reverse}
        splitDamage={splitDamage}
        splitSpellScaling={!!regulationVersion.splitSpellScaling}
        numericalScaling={numericalScaling}
        attackPowerTypes={attackPowerTypes}
        spellScaling={spellScaling}
        onSortByChanged={setSortBy}
        onReverseChanged={setReverse}
      />
    );
  }

  // The Convergence and Reforged don't separate DLC content, so this option is only relevant to
  // vanilla
  const showIncludeDLC = regulationVersionName === "latest";
  const includeDLCWeaponTypes = includeDLC || !showIncludeDLC;

  const weaponPickerOptions = useMemo(() => {
    const dedupedWeaponsByWeaponName = [
      ...weapons
        .reduce((acc, weapon) => {
          return acc.set(weapon.weaponName, weapon);
        }, new Map<string, Weapon>())
        .values(),
    ].filter((weapon) => (includeDLC ? true : !weapon.dlc));

    return makeWeaponOptionsFromWeapon(dedupedWeaponsByWeaponName);
  }, [weapons, includeDLC]);

  const drawerContent = (
    <>
      <RegulationVersionPicker
        aprilFools={aprilFools}
        regulationVersionName={regulationVersionName}
        onRegulationVersionNameChanged={setRegulationVersionName}
      />
      {!aprilFools && (
        <>
          <MiscFilterPicker
            showIncludeDLC={showIncludeDLC}
            includeDLC={includeDLC}
            effectiveOnly={effectiveOnly}
            onIncludeDLCChanged={setIncludeDLC}
            onEffectiveOnlyChanged={setEffectiveOnly}
          />
          <WeaponPicker
            selectedWeapons={selectedWeapons}
            onSelectedWeaponsChanged={setSelectedWeapons}
            weaponOptions={weaponPickerOptions}
          />
          <AffinityPicker
            affinityOptions={regulationVersion.affinityOptions}
            selectedAffinityIds={affinityIds}
            onAffinityIdsChanged={setAffinityIds}
          />
        </>
      )}
      <WeaponTypePicker
        includeDLCWeaponTypes={includeDLCWeaponTypes}
        weaponTypes={aprilFools ? [WeaponType.KATANA] : weaponTypes}
        onWeaponTypesChanged={
          aprilFools
            ? () => {
                /* empty */
              }
            : setWeaponTypes
        }
      />
    </>
  );

  return (
    <ThemeProvider theme={aprilFools ? aprilFoolsTheme : theme}>
      <CssBaseline />

      <AppBar
        aprilFools={aprilFools}
        menuOpen={isMobile ? menuOpenMobile : menuOpen}
        onMenuOpenChanged={onMenuOpenChanged}
      />

      <Divider />

      <Box
        display="grid"
        sx={(theme) => ({
          px: 2,
          py: 3,
          [theme.breakpoints.up("sm")]: {
            px: 3,
          },
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: menuOpen ? `320px 1fr` : "1fr",
            alignContent: "start",
            alignItems: "start",
            gap: 2,
            px: 3,
          },
        })}
      >
        {menuOpen && (
          <Box
            display="grid"
            sx={(theme) => ({
              [theme.breakpoints.down("md")]: {
                display: "none",
              },
              gap: 2,
            })}
          >
            {drawerContent}
          </Box>
        )}

        <Drawer
          variant="temporary"
          open={menuOpenMobile}
          onClose={() => onMenuOpenChanged(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: "368px", maxWidth: "100vw" },
          }}
        >
          <Toolbar>
            <IconButton
              size="large"
              color="inherit"
              edge="start"
              role="checkbox"
              aria-label="Close Menu"
              sx={{ mr: 1 }}
              onClick={() => onMenuOpenChanged(false)}
            >
              <ArrowBackIcon />
            </IconButton>
          </Toolbar>

          <Divider />

          <Box display="grid" sx={{ gap: 2, p: 3 }}>
            {drawerContent}
          </Box>
        </Drawer>

        <Box display="grid" sx={{ gap: 2 }}>
          <WeaponListSettings
            aprilFools={aprilFools}
            breakpoint={menuOpen ? "lg" : "md"}
            attributes={attributes}
            twoHanding={twoHanding}
            upgradeLevel={upgradeLevel}
            maxUpgradeLevel={regulationVersion.maxUpgradeLevel}
            splitDamage={splitDamage}
            groupWeaponTypes={groupWeaponTypes}
            numericalScaling={numericalScaling}
            onAttributeChanged={setAttribute}
            onTwoHandingChanged={setTwoHanding}
            onUpgradeLevelChanged={setUpgradeLevel}
            onSplitDamageChanged={setSplitDamage}
            onGroupWeaponTypesChanged={setGroupWeaponTypes}
            onNumericalScalingChanged={setNumericalScaling}
          />

          <RegulationVersionAlert key={regulationVersionName}>
            {regulationVersion.info}
          </RegulationVersionAlert>

          {mainContent}

          <Footer aprilFools={aprilFools} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
