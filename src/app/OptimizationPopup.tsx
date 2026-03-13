import { useMemo } from "react";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { AttackPowerType } from "../calculator/calculator.ts";
import type { OptimizeMode } from "../calculator/optimization.ts";

function usePopupImagesByKey() {
  return useMemo(() => {
    const modules = import.meta.glob("./popup_imagery/*.{png,webp,jpg,jpeg,svg}", {
      eager: true,
      import: "default",
    }) as Record<string, string>;

    const byKey: Record<string, string> = {};
    for (const [path, src] of Object.entries(modules)) {
      const filename = path.split("/").at(-1) ?? path;
      const stem = filename.replace(/\.[^.]+$/, "").toLowerCase();
      byKey[stem] = src;
    }
    return byKey;
  }, []);
}

function pickRuneKey(optimizeMode: OptimizeMode, optimizeAttackPowerType: AttackPowerType): string {
  if (optimizeMode === "totalAttackPower" || optimizeMode === "weighted") {
    return "godrick";
  }

  if (optimizeMode === "spellScaling") {
    return "renalla";
  }

  if (optimizeMode === "specificAttackPower") {
    switch (optimizeAttackPowerType) {
      case AttackPowerType.PHYSICAL:
        return "radahn";
      case AttackPowerType.MAGIC:
        return "renalla";
      case AttackPowerType.FIRE:
      case AttackPowerType.LIGHTNING:
        return "rykard";
      case AttackPowerType.HOLY:
        return "goldmask";
      default:
        return "godrick";
    }
  }

  if (optimizeMode === "statusBuildup") {
    switch (optimizeAttackPowerType) {
      case AttackPowerType.MADNESS:
        return "radahn";
      case AttackPowerType.FROST:
        return "renalla";
      case AttackPowerType.BLEED:
        return "mohg";
      case AttackPowerType.POISON:
        return "dungeater";
      case AttackPowerType.SCARLET_ROT:
        return "malenia";
      case AttackPowerType.SLEEP:
        return "miquella";
      case AttackPowerType.DEATH_BLIGHT:
        return "fia";
      default:
        return "godrick";
    }
  }

  return "godrick";
}

export default function OptimizationPopup({
  open,
  optimizeMode,
  optimizeAttackPowerType,
}: {
  open: boolean;
  optimizeMode: OptimizeMode;
  optimizeAttackPowerType: AttackPowerType;
}) {
  const imagesByKey = usePopupImagesByKey();
  const runeKey = pickRuneKey(optimizeMode, optimizeAttackPowerType);
  const runeSrc = imagesByKey[runeKey];

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 10,
        bgcolor: "rgba(0,0,0,0.55)",
        color: "common.white",
      }}
    >
      <Box
        sx={{
          display: "grid",
          justifyItems: "center",
          gap: 4,
          px: 6,
          py: 5,
          borderRadius: 4,
          bgcolor: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(4px)",
          minWidth: 520,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 280,
            height: 280,
            display: "grid",
            placeItems: "center",
            overflow: "visible",
          }}
        >
          {runeSrc ? (
            <Box
              component="img"
              src={runeSrc}
              alt={runeKey}
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%) scale(1.3)",
                transformOrigin: "center",
                opacity: 0.6,
                animation: "runePulse 2.5s ease-in-out infinite",
                filter: "drop-shadow(0 0 24px rgba(255,255,255,0.18))",
                "@keyframes runePulse": {
                  "0%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.6 },
                },
              }}
            />
          ) : (
            <CircularProgress />
          )}
        </Box>

        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Optimizing…
        </Typography>
      </Box>
    </Backdrop>
  );
}
