import { IconButton, Toolbar, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/MenuRounded";
import { memo } from "react";

interface Props {
  aprilFools: boolean;
  menuOpen: boolean;
  onMenuOpenChanged(menuOpen: boolean): void;
}

/**
 * The main toolbar that has the app name, dark mode toggle, and a link to the GitHub repository
 */
function AppBar({ aprilFools, menuOpen, onMenuOpenChanged }: Props) {
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
        {aprilFools ? "Sekiro" : "Elden Ring"}
        &nbsp;Weapon&nbsp;Calculator
      </Typography>

      <IconButton
        size="large"
        color="inherit"
        edge="end"
        aria-label="GitHub Repository"
        href={
          aprilFools
            ? "https://youtu.be/dQw4w9WgXcQ"
            : "https://github.com/ThomasJClark/elden-ring-weapon-calculator"
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubIcon />
      </IconButton>
    </Toolbar>
  );
}

export default memo(AppBar);
