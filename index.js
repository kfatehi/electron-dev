var Promise = require('bluebird');
var babel = require('babel-core');
var path = require('path');
var resolve = require('resolve');


var detective = require('babel-plugin-detective');

var options = {}


function findDeps(rootDir, name) {
  var filePath = resolve.sync(name, { basedir: rootDir })
  console.log(filePath);
  return new Promise(function(resolve, reject) {
    babel.transformFile(filePath, {
      plugins:[[detective, options]]
    }, function(err, result) {
      if ( err) throw err;
      var metadata = detective.metadata(result);
      var strings = metadata.strings.filter(str => {
        return str.match(/^\./);
      });
      resolve(strings);
    });
  });
}

function findAllDeps(main) {
  var rootDir = path.dirname(main);
  return findDeps(rootDir, main).then(function(strings) {
    var initialPaths = [main].concat(
      strings.map(str=>resolve.sync(str, { basedir: rootDir }))
    )
    return Promise.reduce(strings, function(paths, string) {
      return findDeps(rootDir, string).then(function(strings) {
        return paths.concat(
          strings.map(str=>resolve.sync(str, { basedir: rootDir }))
        ).uniq()
      });
    }, initialPaths);
  });
}

Array.prototype.uniq = function() {
  return this.filter(function(elem, pos,arr) {
    return arr.indexOf(elem) == pos;
  });
};

findAllDeps('/Users/keyvan/Workspace/pm-shell/main.js')
  .then(function(strings) { console.log(strings);  });
