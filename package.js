Package.describe({
  name: 'mike:mocha-package',
  summary: "Run mocha tests in the browser",
  version: "0.5.5",
  git: "https://github.com/mad-eye/meteor-mocha-web"
});

Npm.depends({
  mocha: "1.17.1",
  chai: "1.9.0",
  mkdirp: "0.5.0"
});

//TODO break this out into a separate package and depend weakly
//Require npm assertion library if it doesn't exist..
//Npm.depends({chai: "1.9.0"});


Package.on_use(function (api, where) {
  api.use(['underscore@1.0.1'], ['server', 'client']);
  api.use(['velocity:core@0.4.5'], "server");
  api.use(['templating@1.0.6'], "client");

  api.add_files(["reporter.js", "server.js"], "server");
  api.add_files(["client.html", "mocha.js", "reporter.js", "chai.js", "client.js"], "client");
  api.add_files(["common.js"], ["client", "server"]);

  api.add_files(["sample-tests/client.js","sample-tests/server.js"], "server", {isAsset: true});

  api.export("MochaWeb", ["client", "server"]);
  api.export("MeteorCollectionTestReporter", ["client", "server"]);
});

Package.on_test(function(api, where){
  api.export("describe", ["client", "server"]);
  api.export("it", ["client", "server"]);
});
