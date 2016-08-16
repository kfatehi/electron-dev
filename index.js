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

  findDeps(workingDir, script).then(function(strings) {
    // Initialize watcher.
    var watcher = watch(strings, { persistent: true });
    watcher.on('change', function(path) {
      proc.removeAllListeners('exit');
      proc.on('exit', function() {
        proc = null;
        proc = spawn(electron, [script], spawnOpts);
      });
      proc.kill('SIGINT');
    });

  }).catch(function(err) {
    console.error(err.stack);
  });
}

