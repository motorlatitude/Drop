<p align="center">
 <br/>
 <img src="https://raw.githubusercontent.com/motorlatitude/Drop/master/src/assets/img/Drop%20Logo.png" alt="Drop Logo" width="50%">
 <br/><br/>
</p>

# Drop - Color Picker Tool

<p align="left">
    <img src="https://travis-ci.com/motorlatitude/Drop.svg?branch=master" alt="Build Status">
    <img src="https://david-dm.org/motorlatitude/drop.svg" alt="Dependency Version">
    <img src="https://img.shields.io/github/downloads/motorlatitude/Drop/total?color=green" alt="GitHub All Releases">
    <img src="https://img.shields.io/github/package-json/v/motorlatitude/drop" alt="Drop Version">
    <br/>
</p>

Drop is a color picker made for windows using electron. It's designed for developers and designers as a way to gather,
tweak and share colors, featuring a rich UI to support it along the way.

- Multi-level Magnification
- Customizable Shortcuts
- Different color formats that it can output (CSS RGB, RGBA, HSL, HSLA and Hex with more coming soon!!!)
- Create and share palettes to keep your different projects organized
- Automatically puts the clicked colour into your clipboard
- With more features on the way...

🏗️ **Development Stage**: Alpha

This project is still in its development stage so some aspects of it will not work as expected and will still contain
bugs.

<p align="center">
    <img src="https://raw.githubusercontent.com/motorlatitude/Drop/alpha.5/src/assets/img/thumbnail.png" alt="Drop Preview - Showing the history window" width="75%">
</p>

## Installation

Installation is simple, just run the setup executable from the latest release.

[🔽 Download Latest Release](https://github.com/motorlatitude/Drop/releases)

Once installed, drop will sit in your taskbar and wait for you to need it. It defaults to starting on system launch
so it will always be ready to use.

## Building

If you require your own custom built version of Drop, follow the below instructions and they should lead you to successfully
building Drop from source.

1.  Clone this repository, you can choose which branch to clone, master will contain the most stable version of Drop.

```bash
git clone https://github.com/motorlatitude/Drop.git && cd Drop
```

2.  Install RobotJS and target the electron version as defined in the package.json and make sure to have relevant build
    tools installed on your system as this is a native library.

```bash
npm install robotjs --target=7.1.12
```

3.  Install remaining dependencies.

```bash
npm install
```

4.  Building Drop

    - #### Building to run on your system

      If you wish to use your built version as if using the installer run:

      ```bash
      npm run build
      ```

      Once completed, a setup executable should be in the ./dist/ directory, run the installer to use the built version.

    - #### Build for development purposes

      If you are using the code to make your own changes/modify it, it is easier to not run the npm build command
      until you have finished development work. Use the start command to test your modified version

      ```bash
      npm start
      ```
