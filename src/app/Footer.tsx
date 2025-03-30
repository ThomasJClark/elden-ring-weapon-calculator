import { memo } from "react";
import { Link, Typography } from "@mui/material";

interface Props {
  aprilFools: boolean;
}

function Footer({ aprilFools }: Props) {
  return (
    <Typography component="div" variant="body1" align="center">
      <h1 style={{ display: "inline", font: "inherit", margin: 0, padding: 0 }}>
        {aprilFools ? (
          <>
            Sekiro Weapon Attack Calculator - optimize any weapon or build for Sekiro: Shadows Die
            Twice
          </>
        ) : (
          <>
            Elden Ring Weapon Attack Calculator - optimize any weapon or build for ELDEN RING Shadow
            of the Erdtree, ELDEN RING Reforged, or The Convergence Mod.
          </>
        )}
      </h1>
      <br />
      Found a bug?{" "}
      <Link
        href={
          aprilFools
            ? "https://youtu.be/dQw4w9WgXcQ"
            : "https://github.com/ThomasJClark/elden-ring-weapon-calculator/issues/new"
        }
        target="_blank"
        rel="noopener noreferer"
      >
        Submit an issue here
      </Link>
      .
      <br />
      Made by Tom Clark (
      <Link
        href={aprilFools ? "https://youtu.be/dQw4w9WgXcQ" : "mailto:tom@tclark.io"}
        target="_blank"
        rel="noopener noreferer"
      >
        tom@tclark.io
      </Link>
      ).{" "}
      {aprilFools ? (
        <>Sekiro: Shadows Die Twice is a trademark of FromSoftware and Activision.</>
      ) : (
        <>ELDEN RING is a trademark of FromSoftware.</>
      )}
    </Typography>
  );
}

export default memo(Footer);
