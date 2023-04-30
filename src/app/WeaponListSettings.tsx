import { memo } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { allAttributes, type Attribute, type Attributes } from "../calculator/calculator";
import NumberTextField from "./NumberTextField";
import {
  getAttributeLabel,
  maxRegularUpgradeLevel,
  maxSpecialUpgradeLevel,
  toRegularUpgradeLevel,
  toSpecialUpgradeLevel,
} from "./uiUtils";

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
        value={
          maxUpgradeLevel === maxSpecialUpgradeLevel
            ? toSpecialUpgradeLevel(upgradeLevel)
            : upgradeLevel
        }
        onChange={(evt) =>
          maxUpgradeLevel === maxSpecialUpgradeLevel
            ? onUpgradeLevelChanged(toRegularUpgradeLevel(+evt.target.value))
            : onUpgradeLevelChanged(+evt.target.value)
        }
      >
        {Array.from({ length: maxUpgradeLevel + 1 }, (_, upgradeLevelOption) => (
          <MenuItem key={upgradeLevelOption} value={upgradeLevelOption}>
            {maxUpgradeLevel === maxSpecialUpgradeLevel
              ? `+${upgradeLevelOption}`
              : `+${upgradeLevelOption} / +${toSpecialUpgradeLevel(upgradeLevelOption)}`}
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
 * Form control for one of the weapon list checkboxes (two hadning, effective only, show split damage)
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
  twoHanding: boolean;
  upgradeLevel: number;
  maxUpgradeLevel?: number;
  effectiveOnly: boolean;
  splitDamage: boolean;
  groupWeaponTypes: boolean;
  onAttributeChanged(attribute: Attribute, value: number): void;
  onTwoHandingChanged(twoHanding: boolean): void;
  onUpgradeLevelChanged(upgradeLevel: number): void;
  onEffectiveOnlyChanged(effectiveOnly: boolean): void;
  onSplitDamageChanged(splitDamage: boolean): void;
  onGroupWeaponTypesChanged(groupWeaponTypes: boolean): void;
}

/**
 * Form controls for entering player attributes, basic filters, and display options
 */
function WeaponListSettings({
  breakpoint,
  attributes,
  twoHanding,
  upgradeLevel,
  maxUpgradeLevel,
  effectiveOnly,
  splitDamage,
  groupWeaponTypes,
  onAttributeChanged,
  onTwoHandingChanged,
  onUpgradeLevelChanged,
  onEffectiveOnlyChanged,
  onSplitDamageChanged,
  onGroupWeaponTypesChanged,
}: Props) {
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
          label="Effective only"
          checked={effectiveOnly}
          onChange={onEffectiveOnlyChanged}
        />
        <BooleanInput
          label="Show damage split"
          checked={splitDamage}
          onChange={onSplitDamageChanged}
        />
      </Box>
    </Box>
  );
}

export default memo(WeaponListSettings);
