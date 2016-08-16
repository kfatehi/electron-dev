# electron-dev

**note this is not for reloading your BrowserWindow -- tools exist for that already, this is for code related to the main process**

it's like [node-dev](https://github.com/fgnass/node-dev) except for electron apps 

like node-dev, electron-dev wraps your program, however where node-dev actually hooks into `require()`,
electron-dev uses [babel-plugin-detective](https://github.com/avajs/babel-plugin-detective) to acquire a list of all the javascript files your app uses.

we then use [chokidar](https://github.com/paulmillr/chokidar) to watch for changes to to these files, restarting electron if any happen to change.

## usage

`electron-dev --dir . --script .` (defaults)

if you are happy with those defaults you can just run `electron-dev` from your project root
