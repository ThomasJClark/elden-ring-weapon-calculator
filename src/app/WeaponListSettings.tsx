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
import { getAttributeLabel, maxRegularUpgradeLevel, toSpecialUpgradeLevel } from "./uiUtils";

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
  onUpgradeLevelChanged(upgradeLevel: number): void;
}

/**
 * Form control for picking the weapon upgrade level (+1, +2, etc.)
 */
const WeaponLevelInput = memo(function WeaponLevelInput({
  upgradeLevel,
  onUpgradeLevelChanged,
}: WeaponLevelInputProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="upgradeLevelLabel">Weapon Level</InputLabel>
      <Select
        labelId="upgradeLevelLabel"
        label="Weapon Level"
        size="small"
        value={upgradeLevel}
        onChange={(evt) => onUpgradeLevelChanged(+evt.target.value)}
      >
        {Array.from({ length: maxRegularUpgradeLevel + 1 }, (_, upgradeLevelOption) => (
          <MenuItem key={upgradeLevelOption} value={upgradeLevelOption}>
            +{upgradeLevelOption} / +{toSpecialUpgradeLevel(upgradeLevelOption)}
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
      sx={{
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          [breakpoint]: "332px 128px auto auto 1fr",
        },
        alignItems: "start",
      }}
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

      <Box display="grid" sx={{ gap: 2 }}>
        <WeaponLevelInput
          upgradeLevel={upgradeLevel}
          onUpgradeLevelChanged={onUpgradeLevelChanged}
        />
      </Box>

      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <BooleanInput label="Two Handing" checked={twoHanding} onChange={onTwoHandingChanged} />
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
        <BooleanInput
          label="Group weapon types"
          checked={groupWeaponTypes}
          onChange={onGroupWeaponTypesChanged}
        />
      </Box>
    </Box>
  );
}

export default memo(WeaponListSettings);
