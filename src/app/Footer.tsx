import { memo } from "react";
import { Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Typography component="div" variant="body1" align="center">
      <h1 style={{ display: "inline", font: "inherit", margin: 0, padding: 0 }}>
        Elden Ring Weapon Attack Calculator - optimize any weapon or build for ELDEN RING patch
        1.10, ELDEN RING Reforged, or The Convergence Mod.
      </h1>
      <br />
      Found a bug?{" "}
      <Link
        href="https://github.com/ThomasJClark/elden-ring-weapon-calculator/issues/new"
        target="_blank"
        rel="noopener noreferer"
      >
        Submit an issue here
      </Link>
      .
      <br />
      Made by Tom Clark (
      <Link href="mailto:tom@tclark.io" target="_blank" rel="noopener noreferer">
        tom@tclark.io
      </Link>
      ). ELDEN RING is a trademark of FromSoftware.
    </Typography>
  );
}

export default memo(Footer);
