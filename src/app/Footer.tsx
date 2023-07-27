import { memo } from "react";
import { Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Typography component="div" variant="body1" align="center">
      <h1 style={{ display: "inline", font: "inherit", margin: 0, padding: 0 }}>
        Elden Ring Weapon Attack Calculator - optimize any weapon or build for Elden Ring patch
        1.10, Elden Ring Reforged, or The Convergence Mod.
      </h1>
      <br />
      Made by Tom Clark (
      <Link href="mailto:tom@tclark.io" target="_blank" rel="noopener noreferer">
        tom@tclark.io
      </Link>
      ).
      <br />
      Found a bug or have a suggestion?{" "}
      <Link
        href="https://github.com/ThomasJClark/elden-ring-weapon-calculator/issues/new"
        target="_blank"
        rel="noopener noreferer"
      >
        Submit an issue
      </Link>
      .
      <br />
      Elden Ring is a trademark of FromSoftware and Bandai Namco Entertainment.
    </Typography>
  );
}

export default memo(Footer);
