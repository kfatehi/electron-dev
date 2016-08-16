var findDeps = require('./find-deps');
var watch = require('chokidar').watch;
var spawn = require('cross-spawn');
var path = require('path');
var electron = require('electron');

module.exports = main;

function main(args) {
  var workingDir = args.dir || process.cwd();
  var script = args.script || '.';

  var spawnOpts = {
    cwd: workingDir,
    stdio: 'inherit'
  }
  var proc = spawn(electron, [script], spawnOpts);

  proc.on('exit', function() {
    process.exit(0);
  });

  findDeps(workingDir, script).then(function(deps) {
    var watcher = watch(deps, { persistent: true });
    watcher.on('change', function(path) {
      watcher.close();
      watcher = null;
      proc.removeAllListeners('exit');
      proc.on('exit', function() {
        proc = null;
        main(args);
      });
      proc.kill('SIGINT');
    });

  }).catch(function(err) {
    console.error(err.stack);
  });
}

