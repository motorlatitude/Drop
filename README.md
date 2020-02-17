<p align="center">
 <br/>
 <img src="https://raw.githubusercontent.com/motorlatitude/Drop/master/src/assets/img/Drop%20Logo.png" alt="Drop Logo" width="50%">
 <br/><br/>
</p>

# Drop - Color Picker Tool

<p align="left">
    <img src="https://travis-ci.com/motorlatitude/Drop.svg?branch=master" alt="Build Status">
    <a href="https://app.codacy.com/manual/lenny.glk/Drop?utm_source=github.com&utm_medium=referral&utm_content=motorlatitude/Drop&utm_campaign=Badge_Grade_Dashboard">
      <img src="https://api.codacy.com/project/badge/Grade/65116691e5154f60b6c1ac2912607fb3" alt="Codacy Quality Badge">
    </a>
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

Since Drop uses native dependencies it is required that you have the correct build tools installed for your system in order
to successfully build the application.

1.  ### Clone Repository

    Clone this repository, you can choose which branch to clone, master will contain the most stable version of Drop.

    ```bash
    git clone https://github.com/motorlatitude/Drop.git && cd Drop
    ```

    Alpha and Beta branches will follow the format `alpha.x` and `beta.x` where `x` is the iteration number.

2.  ### Install Native Dependencies

    Install RobotJS and target the electron version as defined in the package.json and make sure to have relevant build
    tools installed on your system as this is a native library.

    ```bash
    npm install robotjs@0.6.0 --target=7.1.12
    ```

3.  ### Install NPM Dependencies

    Install the remaining npm dependencies before building.

    ```bash
    npm install
    ```

4.  ### Building Drop

    You are now ready to build Drop, choose for what you plan on using your custom built version of Drop.

    - #### Building to run on your system

      If you wish to use your built version as if using the installer run:

      ```bash
      npm run build
      ```

      This step can take a couple of minutes, best grab a coffee. Once completed, a setup executable should be in
      the `./dist/` directory, run the installer to use the built version.

    - #### Build for development purposes

      If you are using the code to make your own changes/modify it, it is easier to not run the npm build command
      until you have finished development work. Use the start command to test your modified version

      ```bash
      npm start
      ```
