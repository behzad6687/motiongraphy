import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { theme } from "./theme";

// Brand fonts from esolutify.com (variable woff2, bundled locally so renders
// never depend on the network). loadFont() blocks rendering until loaded.
loadFont({
  family: theme.fonts.display,
  url: staticFile("fonts/RedHatDisplay-Variable.woff2"),
  weight: "300 900",
});
loadFont({
  family: theme.fonts.body,
  url: staticFile("fonts/DMSans-Variable.woff2"),
  weight: "100 1000",
});
// Caveat (SIL OFL, latin subset): the hand-drawn sketch in the app reel.
loadFont({
  family: theme.fonts.hand,
  url: staticFile("fonts/Caveat-Variable.woff2"),
  weight: "400 700",
});
// Bodoni Moda (SIL OFL, latin subset): editorial serif for beauty-site Stories.
loadFont({
  family: theme.fonts.serif,
  url: staticFile("fonts/BodoniModa-Variable.woff2"),
  weight: "400 900",
});
loadFont({
  family: theme.fonts.serif,
  url: staticFile("fonts/BodoniModa-Italic-Variable.woff2"),
  weight: "400 900",
  style: "italic",
});
// Cormorant Garamond + Pinyon Script (SIL OFL, latin subset): the Samantha
// Story, matching the salon's gilded serif-and-script look.
loadFont({
  family: theme.fonts.garamond,
  url: staticFile("fonts/CormorantGaramond-Variable.woff2"),
  weight: "300 700",
});
loadFont({
  family: theme.fonts.garamond,
  url: staticFile("fonts/CormorantGaramond-Italic-Variable.woff2"),
  weight: "300 700",
  style: "italic",
});
loadFont({
  family: theme.fonts.script,
  url: staticFile("fonts/PinyonScript-Regular.woff2"),
  weight: "400",
});
// DM Mono (SIL OFL, latin subset): the Crown Story's spec labels.
loadFont({
  family: theme.fonts.mono,
  url: staticFile("fonts/DMMono-Regular.woff2"),
  weight: "400",
});
// Newsreader (SIL OFL, latin subset): the N.H.F Clinics Story.
loadFont({
  family: theme.fonts.news,
  url: staticFile("fonts/Newsreader-Variable.woff2"),
  weight: "300 700",
});
loadFont({
  family: theme.fonts.news,
  url: staticFile("fonts/Newsreader-Italic-Variable.woff2"),
  weight: "300 700",
  style: "italic",
});
// Archivo, Figtree and Bangers (SIL OFL, latin subset): the Dental Defenders
// before/after, set in the new site's own type.
loadFont({
  family: theme.fonts.archivo,
  url: staticFile("fonts/Archivo-Variable.woff2"),
  weight: "400 900",
});
loadFont({
  family: theme.fonts.archivo,
  url: staticFile("fonts/Archivo-Italic-Variable.woff2"),
  weight: "700 900",
  style: "italic",
});
loadFont({
  family: theme.fonts.figtree,
  url: staticFile("fonts/Figtree-Variable.woff2"),
  weight: "400 700",
});
loadFont({
  family: theme.fonts.comic,
  url: staticFile("fonts/Bangers-Regular.woff2"),
  weight: "400",
});
