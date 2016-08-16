var findDeps = require('./find-deps');

findDeps('/Users/keyvan/Workspace/pm-shell', './main')
  .then(function(strings) { console.log(strings);  })
.catch(function(err) {
  console.error(err.stack);
});
