var Promise = require('bluebird');
var babel = require('babel-core');
var path = require('path');
var resolveModule = require('resolve');


var detective = require('babel-plugin-detective');

var options = {}


function findDeps(rootDir, name) {
  return new Promise(function(resolve, reject) {
    resolveModule(name, { basedir: rootDir }, function(err, filePath) {
      if (err) return reject(err);
      console.log(filePath);
      babel.transformFile(filePath, {
        plugins:[[detective, options]]
      }, function(err, result) {
        if ( err) throw err;
        var metadata = detective.metadata(result);
        if (metadata && metadata.strings) {
          var strings = metadata.strings.filter(str => {
            return str.match(/^\./);
          });
          resolve(
            Promise.map(strings, function(string) {
              return findDeps(rootDir, string)
            })
          )
        } else {
          resolve([]);
        }
      })
    })
  })
}

function findAllDeps(main) {
  var rootDir = path.dirname(main);
  return findDeps(rootDir, main).then(function(strings) {
    var initialPaths = [main].concat(
      strings.map(str=>resolveModule.sync(str, { basedir: rootDir }))
    )
    return Promise.reduce(strings, function(paths, string) {
      return findDeps(rootDir, string).then(function(strings) {
        return paths.concat(
          strings.map(str=>resolveModule.sync(str, { basedir: rootDir }))
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
  .then(function(strings) { console.log(strings);  })
.catch(function(err) {
  console.log(err);
});
