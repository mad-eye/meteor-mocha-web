Package.describe({
  name: 'mike:mocha',
  summary: "Run mocha tests in the browser",
  version: "0.6.0",
  debugOnly: true,
  git: "https://github.com/mad-eye/meteor-mocha-web"
});

Npm.depends({
  mocha: "1.17.1",
  mkdirp: "0.5.0"
});


Package.on_use(function (api, where) {
  api.use(['underscore@1.0.3'], ['client', 'server']);
  api.use(['velocity:core@0.6.0-rc.5'], "server");
  api.use(['velocity:html-reporter@0.5.0'], "client");
  api.use('practicalmeteor:chai@2.1.0_1');

  api.use(['templating@1.0.6'], "client");
  api.use(['velocity:shim@0.1.0'], ["client", "server"]);
  api.use(['mike:mocha-core@0.1.0'], ["client", "server"]);

  api.add_files(["reporter.js", "server.js"], "server");
  api.add_files(["client.html", "mocha.js", "reporter.js", "client.js"], "client");

  api.add_files(["sample-tests/client.js","sample-tests/server.js"], "server", {isAsset: true});
  api.export("MochaWeb", ["client", "server"]);
});
