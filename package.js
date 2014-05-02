Package.describe({
  summary: "Run mocha tests in the browser"
});

Npm.depends({
  mocha: "1.17.1",
  chai: "1.9.0"
});

//TODO break this out into a separate package and depend weakly
//Require npm assertion library if it doesn't exist..
//Npm.depends({chai: "1.9.0"});

Package.on_use(function (api, where) {
  api.use(['velocity']);
  api.add_files(["serverPreTest.js"], "server");
});
