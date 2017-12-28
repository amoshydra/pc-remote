<div align="center">
  <img src="https://raw.githubusercontent.com/amoshydra/remote-control-server/master/media/icons/workspace/icon-raw.png" width="160px"></img>
  <h1>PC Remote</h1>
  <p>A HTTP remote control server</p>
</div>


### Getting started
1. Download and install the server from the latest [release](https://github.com/amoshydra/remote-control-server/releases)
2. Connect your device browser to the server IP address
3. You can find the server IP address by clicking (right click on Windows) on app icon


### Development

#### Setting up
```
yarn
yarn start
```
This project uses robot.js and electron. Additional step is needed to install the dependency.
A postinstall script is provided to automatically rebuild the binary for robot.js after `yarn`.

/* yarn is not supported in this repo

#### Developing
```
yarn watch
```
Nodemon is used to monitor file changes and reload application.  

#### Building
To build the application run `npm run dist`. This will generate an executable file using `electron-builder`. The executable can be found under the `dist` folder.
This command has only been tested on a Windows 10 64bit machine.
