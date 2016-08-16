# electron-dev

it's like node-dev except for electron apps 

node-dev hooks `require()` but we don't do that; here we pre-parse the AST

and then watch for changes, restarting electron if any of those paths change.

## usage

`electron-dev --dir . --script .` (defaults)

if you are happy with those defaults you can just run it like `electron-dev`
