Package.describe({
  name: 'mike:mocha',
  summary: "Run mocha tests in the browser",
  version: "0.5.2",
  debugOnly: true,
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
  api.use(['velocity:core@0.4.5'], "server");
//   api.use(['respondly:test-reporter'], 'client');
  api.use(['velocity:html-reporter@0.3.2'], "client");
  api.use(['templating@1.0.6'], "client");
  api.use(['velocity:shim@0.1.0'], ["client", "server"]);
  api.use("velocity:node-soft-mirror@0.3.1", {unordered: true});

  api.add_files(["reporter.js", "server.js"], "server");
  api.add_files(["client.html", "mocha.js", "reporter.js", "client.js", "chai.js"], "client");

  api.add_files(["sample-tests/client.js","sample-tests/server.js"], "server", {isAsset: true});

  api.export("MochaWeb", ["client", "server"]);
  api.export("MeteorCollectionTestReporter", ["client", "server"]);
});
