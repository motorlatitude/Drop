<p align="center">
 <br/>
 <img src="https://raw.githubusercontent.com/motorlatitude/Drop/master/src/assets/img/Drop%20Logo.png" alt="Drop Logo" width="50%">
 <br/><br/>
</p>

# Drop - Color Picker Tool

<p align="left">
    <a href="https://github.com/motorlatitude/Drop/actions?query=workflow%3ACI">
        <img src="https://github.com/motorlatitude/Drop/workflows/CI/badge.svg" alt="Build Status">
    </a>
    <a href="https://app.codacy.com/manual/lenny.glk/Drop?utm_source=github.com&utm_medium=referral&utm_content=motorlatitude/Drop&utm_campaign=Badge_Grade_Dashboard">
      <img src="https://api.codacy.com/project/badge/Grade/65116691e5154f60b6c1ac2912607fb3" alt="Codacy Quality Badge">
    </a>
    <a href="https://depfu.com/github/motorlatitude/Drop?project_id=15240">
      <img src="https://badges.depfu.com/badges/74935b78548f6153328ee87d8e08318b/count.svg" alt="Dependency Version">
    </a>
    <img src="https://img.shields.io/github/downloads/motorlatitude/Drop/total?color=green" alt="GitHub All Releases">
    <img src="https://img.shields.io/github/package-json/v/motorlatitude/drop" alt="Drop Version">
    <br/>
</p>
Drop is a cross platform color picker/eye dropper using electron. It's designed for developers and designers as a way to gather,
tweak and share colors and color palettes, featuring a rich UI to support it along the way.

- Multi-level magnification
- Customizable shortcuts
- Different color formats that it can output (CSS RGB, RGBA, HSL, HSLA, Hex, .NET ARGB, Java RGB, etc.)
- Ability to add custom color formats if the presets are not enough
- Create and share palettes to keep your different projects organized
- Automatically puts the picked color into your clipboard
- With more features on the way... (and open to suggestions)

🏗️ **Development Stage**: Alpha

This project is still in its development stage so some aspects of it will not work as expected and will still contain
bugs. If you stumble across a bug please open an issue, or make a PR.

<p align="center">
    <img src="https://raw.githubusercontent.com/motorlatitude/Drop/master/src/assets/img/thumbnail.png" alt="Drop Preview - Showing the history window" width="75%">
</p>

## Installation

You can download the latest release from the github release page

[⬇️ Download Latest Release](https://github.com/motorlatitude/Drop/releases)

- #### Windows Install

  Installation is simple, just run the setup executable from the latest release for Windows.

  Once installed, drop will sit in your taskbar and wait for you to need it. It defaults to starting on system launch so it will always be ready to use.

- #### Linux Install

  Linux users can use the provided `.AppImage` or `.snap` to install it on their system, otherwise build instructions are listed below. Linux users will also have to make sure that they have the `libxtst-dev` and `libpng++-dev` packages installed.

## Contribute

This is an open source project, feel free to contribute by making a pull request or posting an issue for bugs or feature-requests. If you would like to
support my work directly, please consider buying me a coffee ☕.

<a href="https://www.buymeacoffee.com/motorlatitude" target="_blank">
    <img src="https://raw.githubusercontent.com/motorlatitude/misc/master/assets/img/bmac.png" alt="Buy Me A Coffee" height="50">
</a>

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

    If building on linux, you may require the following packages;

    ```bash
    sudo apt-get -y install libxtst-dev libpng++-dev
    ```

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

## License

[![FOSSA Status](https://app.fossa.com/api/projects/custom%2B16971%2Fgit%40github.com%3Amotorlatitude%2FDrop.git.svg?type=large)](https://app.fossa.com/projects/custom%2B16971%2Fgit%40github.com%3Amotorlatitude%2FDrop.git?ref=badge_large)
