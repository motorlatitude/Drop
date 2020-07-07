/* IMPORT */

const execa = require("execa"),
  fs = require("fs"),
  path = require("path");

/* HELPERS */

function isLinux(targets) {
  const re = /AppImage|snap|deb|rpm|freebsd|pacman/i;
  return !!targets.find(target => re.test(target.name));
}

/* FIX LINUX SANDBOX */

// Disabling the sandbox on Linux
//TODO: Remove this once the upstream bug has been fixed //URL: https://github.com/electron/electron/issues/17972

async function fixLinuxSandbox(context) {
  console.log("Applying Linux AppImage/Snap chrome-sandbox permission fix");
  const targets = context.targets;
  const cwd = context.appOutDir;
  if (!isLinux(targets)) return;

  const scriptPath = path.join(cwd, "drop"),
    script = '#!/bin/bash\n"${BASH_SOURCE%/*}"/drop.bin "$@" --no-sandbox';

  await execa("mv", ["drop", "drop.bin"], { cwd });

  fs.writeFileSync(scriptPath, script);

  await execa("chmod", ["+x", "drop"], { cwd });
}

/* EXPORT */

module.exports = fixLinuxSandbox;
