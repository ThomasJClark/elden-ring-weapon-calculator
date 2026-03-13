import { memo } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  allAttributes,
  allDamageTypes,
  allStatusTypes,
  AttackPowerType,
  type Attribute,
  type Attributes,
} from "../calculator/calculator.ts";
import type { OptimizeMode, OptimizationWeights } from "../calculator/optimization.ts";
import NumberTextField from "./NumberTextField.tsx";
import {
  damageTypeLabels,
  getAttributeLabel,
  maxRegularUpgradeLevel,
  toSpecialUpgradeLevel,
} from "./uiUtils.ts";

interface AttributeInputProps {
  attribute: Attribute;
  value: number;
  onAttributeChanged(attribute: Attribute, value: number): void;
}

/**
 * Form control for picking the value of a single attribute (str/dex/int/fai/arc)
 */
const AttributeInput = memo(function AttributeInput({
  attribute,
  value,
  onAttributeChanged,
}: AttributeInputProps) {
  return (
    <NumberTextField
      key={attribute}
      label={getAttributeLabel(attribute)}
      size="small"
      variant="outlined"
      value={value}
      min={1}
      max={99}
      onChange={(newValue) => onAttributeChanged(attribute, newValue)}
    />
  );
});

interface WeaponLevelInputProps {
  upgradeLevel: number;
  maxUpgradeLevel?: number;
  onUpgradeLevelChanged(upgradeLevel: number): void;
}

/**
 * Form control for picking the weapon upgrade level (+1, +2, etc.)
 */
const WeaponLevelInput = memo(function WeaponLevelInput({
  upgradeLevel,
  maxUpgradeLevel = maxRegularUpgradeLevel,
  onUpgradeLevelChanged,
}: WeaponLevelInputProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="upgradeLevelLabel">Weapon Level</InputLabel>
      <Select
        labelId="upgradeLevelLabel"
        label="Weapon Level"
        size="small"
        value={Math.min(upgradeLevel, maxUpgradeLevel)}
        onChange={(evt) => onUpgradeLevelChanged(+evt.target.value)}
      >
        {Array.from({ length: maxUpgradeLevel + 1 }, (_, upgradeLevelOption) => (
          <MenuItem key={upgradeLevelOption} value={upgradeLevelOption}>
            {maxUpgradeLevel === maxRegularUpgradeLevel
              ? `+${upgradeLevelOption} / +${toSpecialUpgradeLevel(upgradeLevelOption)}`
              : `+${upgradeLevelOption}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

interface BooleanInputProps {
  label: string;
  checked: boolean;
  onChange(checked: boolean): void;
}

/**
 * Form control for one of the weapon list checkboxes (two handing, show split damage)
 */
const BooleanInput = memo(function BooleanInput({ label, checked, onChange }: BooleanInputProps) {
  return (
    <FormControlLabel
      label={label}
      sx={{ mr: 0 }}
      control={
        <Checkbox
          size="small"
          checked={checked}
          name={label}
          onChange={(evt) => onChange(evt.currentTarget.checked)}
        />
      }
    />
  );
});

interface Props {
  breakpoint: "md" | "lg";
  attributes: Attributes;
  freeStatPoints: number;
  freeStatPointsMax: number;
  optimizeMode: OptimizeMode;
  optimizeAttackPowerType: AttackPowerType;
  optimizationWeights: OptimizationWeights;
  spellScalingWeight: number;
  showOptimizedAttributes: boolean;
  twoHanding: boolean;
  upgradeLevel: number;
  maxUpgradeLevel?: number;
  splitDamage: boolean;
  groupWeaponTypes: boolean;
  numericalScaling: boolean;
  onAttributeChanged(attribute: Attribute, value: number): void;
  onFreeStatPointsChanged(value: number): void;
  onOptimizeModeChanged(mode: OptimizeMode): void;
  onOptimizeAttackPowerTypeChanged(attackPowerType: AttackPowerType): void;
  onOptimizationWeightChanged(attackPowerType: AttackPowerType, weight: number): void;
  onSpellScalingWeightChanged(weight: number): void;
  onShowOptimizedAttributesChanged(value: boolean): void;
  onTwoHandingChanged(twoHanding: boolean): void;
  onUpgradeLevelChanged(upgradeLevel: number): void;
  onSplitDamageChanged(splitDamage: boolean): void;
  onGroupWeaponTypesChanged(groupWeaponTypes: boolean): void;
  onNumericalScalingChanged(numericalScaling: boolean): void;
}

/**
 * Form controls for entering player attributes, basic filters, and display options
 */
function WeaponListSettings({
  breakpoint,
  attributes,
  freeStatPoints,
  freeStatPointsMax,
  optimizeMode,
  optimizeAttackPowerType,
  optimizationWeights,
  spellScalingWeight,
  showOptimizedAttributes,
  twoHanding,
  upgradeLevel,
  maxUpgradeLevel,
  splitDamage,
  groupWeaponTypes,
  numericalScaling,
  onAttributeChanged,
  onFreeStatPointsChanged,
  onOptimizeModeChanged,
  onOptimizeAttackPowerTypeChanged,
  onOptimizationWeightChanged,
  onSpellScalingWeightChanged,
  onShowOptimizedAttributesChanged,
  onTwoHandingChanged,
  onUpgradeLevelChanged,
  onSplitDamageChanged,
  onGroupWeaponTypesChanged,
  onNumericalScalingChanged,
}: Props) {
  const showSpecificAttackPower = optimizeMode === "specificAttackPower";
  const showStatusBuildup = optimizeMode === "statusBuildup";
  const showWeights = optimizeMode === "weighted";

  return (
    <Box
      display="grid"
      sx={(theme) => ({
        gap: 2,
        gridTemplateColumns: "1fr",
        alignItems: "start",
        [theme.breakpoints.up(breakpoint)]: {
          gridTemplateColumns: "320px 120px auto",
        },
      })}
    >
      <Box display="grid" sx={{ gap: 2, gridTemplateColumns: "1fr 1fr 1fr" }}>
        {allAttributes.map((attribute) => (
          <AttributeInput
            key={attribute}
            attribute={attribute}
            value={attributes[attribute]}
            onAttributeChanged={onAttributeChanged}
          />
        ))}
        <NumberTextField
          label="Free Stat Points"
          size="small"
          variant="outlined"
          value={freeStatPoints}
          min={0}
          max={freeStatPointsMax}
          onChange={(newValue) => onFreeStatPointsChanged(newValue)}
        />
      </Box>

      <WeaponLevelInput
        upgradeLevel={upgradeLevel}
        maxUpgradeLevel={maxUpgradeLevel}
        onUpgradeLevelChanged={onUpgradeLevelChanged}
      />

      <Box
        display="grid"
        sx={(theme) => ({
          mt: -1,
          columnGap: 2,
          gridTemplateColumns: "1fr auto",
          [theme.breakpoints.up("sm")]: {
            gridTemplateColumns: "1fr 1fr",
          },
          [theme.breakpoints.up(breakpoint)]: {
            gridTemplateColumns: "1fr auto",
            justifySelf: "start",
          },
        })}
      >
        <BooleanInput label="Two handing" checked={twoHanding} onChange={onTwoHandingChanged} />
        <BooleanInput
          label="Group by type"
          checked={groupWeaponTypes}
          onChange={onGroupWeaponTypesChanged}
        />
        <BooleanInput
          label="Numeric scaling"
          checked={numericalScaling}
          onChange={onNumericalScalingChanged}
        />
        <BooleanInput
          label="Show damage split"
          checked={splitDamage}
          onChange={onSplitDamageChanged}
        />
        <BooleanInput
          label="Show optimized stats"
          checked={showOptimizedAttributes}
          onChange={onShowOptimizedAttributesChanged}
        />
      </Box>

      <Box
        sx={{
          mt: 1,
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
          gridColumn: "1 / -1",
        }}
      >
        <Box
          display="grid"
          sx={{
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="optimizeModeLabel">Optimize</InputLabel>
            <Select
              labelId="optimizeModeLabel"
              label="Optimize"
              value={optimizeMode}
              onChange={(evt) => onOptimizeModeChanged(evt.target.value as OptimizeMode)}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="totalAttackPower">Total Attack Power</MenuItem>
              <MenuItem value="specificAttackPower">Specific Attack Power</MenuItem>
              <MenuItem value="statusBuildup">Status Buildup</MenuItem>
              <MenuItem value="spellScaling">Spell Scaling</MenuItem>
              <MenuItem value="weighted">Weighted</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            size="small"
            disabled={!showSpecificAttackPower && !showStatusBuildup}
            sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
          >
            <InputLabel id="optimizationTypeLabel">Type</InputLabel>
            <Select
              labelId="optimizationTypeLabel"
              label="Type"
              value={optimizeAttackPowerType}
              onChange={(evt) => onOptimizeAttackPowerTypeChanged(+evt.target.value as AttackPowerType)}
            >
              {(showSpecificAttackPower ? allDamageTypes : allStatusTypes).map((type) => (
                <MenuItem key={type} value={type}>
                  {damageTypeLabels.get(type) ?? `Type ${type}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {showWeights && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Weights
            </Typography>

            <Box
              sx={{
                display: "grid",
                // Make weight fields ~2x narrower than stat fields:
                // stats use 3 columns; weights use 6 columns (damage + spell scaling).
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(6, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {allDamageTypes.map((type) => (
                <NumberTextField
                  key={type}
                  label={damageTypeLabels.get(type) ?? `Type ${type}`}
                  size="small"
                  variant="outlined"
                  value={optimizationWeights[type] ?? 1}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={(newValue) => onOptimizationWeightChanged(type, newValue)}
                />
              ))}
              <NumberTextField
                label="Spell Scaling"
                size="small"
                variant="outlined"
                value={spellScalingWeight}
                min={0}
                max={100}
                step={0.1}
                onChange={(newValue) => onSpellScalingWeightChanged(newValue)}
              />
            </Box>

            <Box
              sx={{
                mt: 1.5,
                display: "grid",
                // Status has 7 fields; use 7 columns to avoid horizontal scrolling.
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(7, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {allStatusTypes.map((type) => (
                <NumberTextField
                  key={type}
                  label={damageTypeLabels.get(type) ?? `Type ${type}`}
                  size="small"
                  variant="outlined"
                  value={optimizationWeights[type] ?? 1}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={(newValue) => onOptimizationWeightChanged(type, newValue)}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default memo(WeaponListSettings);
