/*
 * Components used to render certain data cells in the weapon table
 *
 * These are implemented as memozied components because they often don't update when the rest
 * of the table does, so it's performant to be able to skip over them when e.g. only attack
 * power changes.
 */
import { memo } from "react";
import { Box, Link, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { type Weapon, type Attribute } from "../../calculator/calculator";
import { getAttributeLabel } from "../uiUtils";

export const blankIcon = <RemoveIcon color="disabled" fontSize="small" />;

/**
 * Component that displays the weapon name as a wiki link.
 */
export const WeaponNameRenderer = memo(function WeaponNameRenderer({
  weapon,
  upgradeLevel,
}: {
  weapon: Weapon;
  upgradeLevel: number;
}) {
  const text = `${weapon.name}${upgradeLevel > 0 ? ` +${upgradeLevel}` : ""}`;
  return (
    <Box>
      {weapon.url ? (
        <Link
          variant="button"
          underline="hover"
          href={weapon.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </Link>
      ) : (
        <Typography variant="button">{text}</Typography>
      )}
    </Box>
  );
});

/**
 * Component that displays the name of a scaling tier for an attribute on a weapon.
 */
export const ScalingTierRenderer = memo(function ScalingTierRenderer({
  weapon: { attributeScaling, scalingTiers },
  upgradeLevel,
  attribute,
}: {
  weapon: Weapon;
  upgradeLevel: number;
  attribute: Attribute;
}) {
  const scalingValue = attributeScaling[upgradeLevel][attribute];
  const scalingTier = scalingValue && scalingTiers.find(([value]) => scalingValue >= value);
  return scalingTier ? (
    <span title={`${Math.round(scalingValue * 100000) / 1000}%`}>{scalingTier[1]}</span>
  ) : (
    blankIcon
  );
});

/**
 * Component that displays an attribute of a weapon.
 */
export const AttributeRequirementRenderer = memo(function AttributeRequirementRenderer({
  weapon: { requirements },
  attribute,
  ineffective,
}: {
  weapon: Weapon;
  attribute: Attribute;
  ineffective: boolean;
}) {
  const requirement = requirements[attribute] ?? 0;
  if (requirement === 0) {
    return blankIcon;
  }

  if (ineffective) {
    return (
      <Typography
        sx={{ color: (theme) => theme.palette.error.main }}
        aria-label={
          `${requirement}. Unable to wield this weapon effectively with present` +
          ` ${getAttributeLabel(attribute)} stat`
        }
      >
        {requirement}
      </Typography>
    );
  }

  return <>{requirement}</>;
});
