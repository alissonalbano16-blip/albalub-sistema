import { Config } from "@remotion/cli/config";
import fs from "fs";

// Ambiente na nuvem do Claude Code: o download do Chrome do Remotion é bloqueado,
// então usa o Chromium headless já instalado na máquina, se existir.
const CHROMIUM_LOCAL =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(CHROMIUM_LOCAL)) {
  Config.setBrowserExecutable(CHROMIUM_LOCAL);
}
