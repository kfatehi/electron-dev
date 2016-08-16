var Promise = require('bluebird');
var babel = require('babel-core');
var path = require('path');
var resolveModule = require('resolve');
var detective = require('babel-plugin-detective');
var options = {}

module.exports = findDeps;

function findDeps(rootDir, name, list) {
  if ( ! list ) list = [];
  var filePath = resolveModule.sync(name, { basedir: rootDir })
  list.push(filePath);
  return parseRequires(filePath).then(function(strings) {
    return Promise.map(strings, function(string) {
      return findDeps(path.dirname(filePath), string, list)
    })
  }).then(function() {
    return list.filter(function(elem, pos,arr) {
      return arr.indexOf(elem) == pos;
    });
  });
}

function parseRequires(filePath) {
  return new Promise(function(resolve, reject) {
    babel.transformFile(filePath, {
      plugins:[[detective, options]],
      sourceRoot: path.dirname(filePath)
    }, function(err, result) {
      if (err)
        return reject(err);

      var metadata = detective.metadata(result);
      if (metadata && metadata.strings) {
        var strings = metadata.strings.filter(str => {
          return str.match(/^\./);
        });
        resolve(strings)
      } else {
        resolve([]);
      }
    });
  })
}
