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
  const { weapons, loading, error } = useWeapons(regulationVersionName);

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
