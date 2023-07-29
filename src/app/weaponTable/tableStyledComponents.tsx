/*
 * All of the  styled components used by WeaponTable.tsx
 */
import { styled } from "@mui/system";

/**
 * The grid container for the whole table
 */
export const WeaponTableBody = styled("div", { skipSx: true, skipVariantsResolver: true })(
  ({ theme }) => ({
    display: "grid",
    overflowX: "auto",
    [theme.breakpoints.only("xs")]: {
      marginLeft: theme.spacing(-2),
      marginRight: theme.spacing(-2),
    },
    [theme.breakpoints.only("sm")]: {
      marginLeft: theme.spacing(-3),
      marginRight: theme.spacing(-3),
    },
    [theme.breakpoints.down("md")]: {
      borderTop: `solid 1px ${theme.palette.divider}`,
      borderBottom: `solid 1px ${theme.palette.divider}`,
    },
    [theme.breakpoints.up("md")]: {
      border: `solid 1px ${theme.palette.divider}`,
      borderRadius: `${theme.shape.borderRadius}px`,
    },
  }),
);

/**
 * The first row in the table containing the names of column groups, such as "Attack Power"
 * and "Attribute Scaling"
 */
export const WeaponTableColumnGroupHeaderRow = styled("div", {
  skipSx: true,
  skipVariantsResolver: true,
})(({ theme }) => ({
  display: "flex",
  alignItems: "stretch",
  minHeight: 37,
  borderBottom: `solid 1px ${theme.palette.divider}`,
}));

/**
 * The seond row in the table containing column names or icons, such as physical attack, bleed
 * buildup, and strength scaling
 */
export const WeaponTableColumnHeaderRow = styled("div", {
  skipSx: true,
  skipVariantsResolver: true,
})(({ theme }) => ({
  display: "flex",
  alignItems: "stretch",
  minHeight: 41,
  borderBottom: `solid 1px ${theme.palette.divider}`,
}));

/**
 * A header that just contains the name of a group of rows, if "Group by type" is on
 */
export const WeaponTableGroupHeaderRow = styled("div", {
  skipSx: true,
  skipVariantsResolver: true,
})(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minHeight: 37,
  paddingLeft: 13,
  paddingRight: 13,
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
  borderBottom: `solid 1px ${theme.palette.divider}`,
}));

/**
 * A wrapper around a group of data rows
 */
export const WeaponTableGroup = styled("div", {
  skipSx: true,
  skipVariantsResolver: true,
})(({ theme }) => ({
  ":not(:last-of-type)": {
    borderBottom: `solid 1px ${theme.palette.divider}`,
  },
}));

/**
 * A row containing the status of a weapon
 */
export const WeaponTableDataRow = styled("div", {
  skipSx: true,
  skipVariantsResolver: true,
})(({ theme }) => ({
  display: "flex",
  alignItems: "stretch",
  minHeight: 36,
  ":nth-of-type(2n+1)": {
    backgroundColor:
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
  },
  ":hover": {
    backgroundColor:
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
  },
}));

/**
 * A group of related columns within a row, such as Attribute Scaling
 */
export const WeaponTableColumnGroup = styled("div", {
  skipVariantsResolver: true,
})(({ theme }) => ({
  display: "flex",
  paddingLeft: 13,
  paddingRight: 13,
  alignItems: "stretch",
  ":not(:first-of-type)": {
    borderLeft: `solid 1px ${theme.palette.divider}`,
  },
}));

/**
 * A single data cell in the table
 */
export const WeaponTableColumn = styled("div", {
  skipVariantsResolver: true,
})({
  display: "grid",
  flex: "1 1 0",
  alignItems: "center",
  justifyContent: "center",
});
