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
import {
  allAttributes,
  Attribute,
  Attributes,
  maxRegularUpgradeLevel,
} from "../calculator/calculator";
import { toSpecialUpgradeLevel } from "../search/filterWeapons";
import NumberTextField from "./NumberTextField";
import { getAttributeLabel } from "./uiUtils";

interface AttributeInputProps {
  attribute: Attribute;
  value: number;
  onAttributeChanged(attribute: Attribute, value: number): void;
}

/**
 * Form control for picking the value of a single attribute (str/dex/int/fai/arc)
 */
const AttributeInput = memo(({ attribute, value, onAttributeChanged }: AttributeInputProps) => (
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
));

interface WeaponLevelInputProps {
  upgradeLevel: number;
  onUpgradeLevelChanged(upgradeLevel: number): void;
}

/**
 * Form control for picking the weapon upgrade level (+1, +2, etc.)
 */
const WeaponLevelInput = memo(({ upgradeLevel, onUpgradeLevelChanged }: WeaponLevelInputProps) => (
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
));

interface BooleanInputProps {
  label: string;
  checked: boolean;
  onChange(checked: boolean): void;
}

/**
 * Form control for one of the weapon list checkboxes (two hadning, effective only, show split damage)
 */
const BooleanInput = memo(({ label, checked, onChange }: BooleanInputProps) => (
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
));

interface Props {
  breakpoint: "md" | "lg";
  attributes: Attributes;
  twoHanding: boolean;
  upgradeLevel: number;
  effectiveOnly: boolean;
  splitDamage: boolean;
  onAttributeChanged(attribute: Attribute, value: number): void;
  onTwoHandingChanged(twoHanding: boolean): void;
  onUpgradeLevelChanged(upgradeLevel: number): void;
  onEffectiveOnlyChanged(effectiveOnly: boolean): void;
  onSplitDamageChanged(splitDamage: boolean): void;
}

/**
 * Form controls for entering player attributes, basic filters, and display options
 */
const WeaponListSettings = ({
  breakpoint,
  attributes,
  twoHanding,
  upgradeLevel,
  effectiveOnly,
  splitDamage,
  onAttributeChanged,
  onTwoHandingChanged,
  onUpgradeLevelChanged,
  onEffectiveOnlyChanged,
  onSplitDamageChanged,
}: Props) => (
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
          attribute={attribute}
          value={attributes[attribute]}
          onAttributeChanged={onAttributeChanged}
        />
      ))}
    </Box>

    <Box display="grid" sx={{ gap: 2 }}>
      <WeaponLevelInput upgradeLevel={upgradeLevel} onUpgradeLevelChanged={onUpgradeLevelChanged} />
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
    </Box>
  </Box>
);

export default memo(WeaponListSettings);
