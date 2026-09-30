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
