# Deskreen

![Deskreen Logo](https://raw.githubusercontent.com/pavlobu/deskreen/master/resources/icon.png)

### Website: https://www.deskreen.com

![release all os -- no code signing](https://github.com/pavlobu/deskreen/workflows/release%20all%20os%20--%20no%20code%20signing/badge.svg)
![build-and-test](https://github.com/pavlobu/deskreen/workflows/build%20and%20test/badge.svg)
![codecov-generate](https://github.com/pavlobu/deskreen/workflows/codecov/badge.svg)
[![codecov](https://codecov.io/gh/pavlobu/deskreen/branch/master/graph/badge.svg?token=fqfBlyXT5O)](https://codecov.io/gh/pavlobu/deskreen)

## Deskreen turns any device with a web browser to a second screen for your computer

Deskreen is an `electron.js` based application that uses `WebRTC` to make a live stream of your
desktop to a web browser on any device.
It is built on top of [Electron React Boilerplate](https://github.com/electron-react-boilerplate)
For better security mechanism, end-to-end encryption is implemented, which is inspired by
[darkwire.io](https://github.com/darkwire/darkwire.io). The difference is that it is rewritten
in `Typescript` and transformed to use `node-forge` instead of `window.crypto.subtle`.
Why this was made? Because a client served with `http` without SSL, which makes `window.crypto.subtle` unavailable.

## NOTE: We are looking for a solution to get rid from Dummy Display Plugs while using Deskreen as a second screen. Your code support is highly valuable and welcome in Deskreen!

Display Dummy Plugs are good temporary solution, but it is not that good for everyone.
If you are a seasoned Windows or Linux or MacOS hacker with a knowledge of low level tweaks and tricks, you can help us to make Deskreen better!
On a long run Deskreen seeks for getting rid of Display Dummy Plugs, because most people don't like using them. Sometimes they can't use them because all available display ports are already taken.
**So we need to have native drivers for Win / Mac / Linux that will help to enable virtual display without Dummy Display Plugs.**
There are already working commercial solutions out there with their own drivers which they don't disclose, but this task is doable with a help of entire community.
The goal of Deskreen is to enable community power and knowledge to overcome these technical challenges and make it a go-to second screen solution that everyone will benefit from!

We plan on making virtual display driver support for each of three main operating systems and place all OS related codes in **[`./drivers`](drivers)** subdirectory of this project.
You can find brief requirements for driver API in **[`./drivers/README.md`](drivers)**.

Share your valuable knowledge on how to create virtual desktop **without a Dummy Display Plug [in this discussion thread.](https://github.com/pavlobu/deskreen/discussions/37#discussion-2016522)**

Thank you in advance!

## Installing with binaries

### Windows

- Get the .msi or .exe file from Releases

### Mac

- Get the .dmg file from Releases

### Linux

- Debian and Ubuntu based distributions (deb)

- Enterprise Linux based distributions (rpm)

- Arch Linux [AUR Package](https://aur.archlinux.org/packages/deskreen/)

- AppImage for other distributions

## Get Started for Developers

### Prerequisites

You will need to have `node` `npm` and `yarn` installed
globally on your machine.

1. git clone this repo
2. `cd app/client; yarn install ; cd ../../ ; yarn install`
3. `yarn dev` -- run in dev mode with live updates

### Useful yarn commands

`yarn start` -- run in production mode to test, without packaging
`yarn package` -- to package an app and make executables available in `release` folder

#### for more yarn commands look at `package.json`

### How to run tests

`yarn test` -- run all unit tests
`yarn build-ux && yarn test-ux` -- run User Experience tests (no tests for `app/client` yet)

### TODO: add e2e tests with host + client app interaction

#### run tests of host app

`yarn test-watch-not-silent` -- run tests in watch mode with console logs only for host app, excluding `app/client`
`yarn test -- -u` -- update snapshots

#### run tests for `app/client`

`yarn test` -- run client tests in watch mode
`test:nowatch` -- run client tests a single time
`yarn test -- -u` -- update snapshots

### Generate test coverage results

`yarn coverage` -- when run from project root, generates a coverage report for `host` and `app/client`

## Instruction for running a local Sonar Qube, community edition

### Prerequisites

You need to install Sonar Qube community edition for your machine.
And sonar-scanner. Then add sonar scanner to your PATH.

You need to run sonar-scanner separately on root directory
and on `app/client` directory.

Luckily for you sonar scanner is automatically triggered after `husky` checks.
So you only need to install and configure SonarCube locally and
create two separate projects in SonarCube panel.
First project for host app, and second project for client viewer app.
TODO: add how to get started with local SonarCube for Deskreen in details.

## Documentation

### High level architecture design

![high-level-design](./doc/architecture/deskreen-arch-pavlobu-21012021.svg)

### WebRTC Screen Sharing Session Initiation Step by Step

![sharng-session-init](./doc/init-sharing-session/deskreen-webrtc-screen-sharing-session-initiation-pavlobu-22012021.svg)

## Note on versioning:

- All versions git tags should start with `v` ex. `v1.0.0`
- Before making a new release with `git push <version-tagname>` set version
  to `<version-tagname>` ! without `v` in the beginning! (ex. `1.0.0` -- not start with `v`) in these three files:
  - `package.json` -- in `version` key ex. `1.0.0`
  - `app/package.json` -- in `version` key ex. `1.0.0`
  - `app/package-lock.json` -- in `version` key ex. `1.0.0`

## Maintainer

- [Pavlo (Paul) Buidenkov](https://www.linkedin.com/in/pavlobu)

## License

AGPL-3.0 License © [Pavlo (Paul) Buidenkov](https://github.com/pavlobu/deskreen)

## Copyright

Deskreen Logo PNG Image -- © [Nadiia Plaunova](https://www.artstation.com/nadiiia)

Apache 2.0 © [blueprintjs](https://github.com/palantir/blueprint)

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate)

simple-peer MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org/).

## Thanks

Thanks to Github workflows for enabling a robust CI pipeline for Deskreen creating needs.

Many thanks to all open source community members and maintainers of libraries used in this project.

## Donate

Click to donate on Deskreen's Patreon page: [DONATE!](https://patreon.com/deskreen)
