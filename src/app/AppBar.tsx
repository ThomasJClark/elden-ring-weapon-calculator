import { IconButton, Toolbar, Typography } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkModeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import LightModeIcon from "@mui/icons-material/LightModeRounded";
import MenuIcon from "@mui/icons-material/MenuRounded";
import { memo } from "react";

interface Props {
  menuOpen: boolean;
  darkMode: boolean;
  onMenuOpenChanged(menuOpen: boolean): void;
  onDarkModeChanged(darkMode: boolean): void;
}

/**
 * The main toolbar that has the app name, dark mode toggle, and a link to the GitHub repository
 */
function AppBar({ menuOpen, darkMode, onMenuOpenChanged, onDarkModeChanged }: Props) {
  return (
    <Toolbar>
      <IconButton
        size="large"
        color="inherit"
        edge="start"
        role="checkbox"
        aria-label="Show Menu"
        aria-checked={menuOpen}
        sx={{ mr: 1 }}
        onClick={() => onMenuOpenChanged(!menuOpen)}
      >
        <MenuIcon />
      </IconButton>

      <Typography variant="h1" component="span" sx={{ flexGrow: 1 }}>
        Elden&nbsp;Ring Weapon&nbsp;Calculator
      </Typography>

      <IconButton
        size="large"
        color="inherit"
        role="checkbox"
        aria-label="Dark Mode"
        aria-checked={darkMode}
        onClick={() => onDarkModeChanged(!darkMode)}
      >
        {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>

      <IconButton
        size="large"
        color="inherit"
        edge="end"
        aria-label="GitHub Repository"
        href="https://github.com/ThomasJClark/elden-ring-weapon-calculator"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubIcon />
      </IconButton>
    </Toolbar>
  );
}

export default memo(AppBar);
