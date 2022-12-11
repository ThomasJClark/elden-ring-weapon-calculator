import { Link, Typography } from "@mui/material";

const Footer = () => (
  <Typography component="div" variant="body1" align="center">
    <h1 style={{ display: "inline", font: "inherit", margin: 0, padding: 0 }}>
      Elden Ring Weapon Calculator - optimize any weapon or build for Elden Ring patch 1.08.
    </h1>
    <br />
    Made by Tom Clark (
    <Link href="https://twitter.com/thechewanater" target="_blank" rel="noopener noreferer">
      @thechewanater
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

export default Footer;
