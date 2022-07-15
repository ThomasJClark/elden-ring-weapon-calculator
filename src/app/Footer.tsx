import { Link, Typography } from "@mui/material";

const App = () => (
  <Typography variant="body1" align="center">
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

export default App;
