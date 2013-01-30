Package.describe({
  summary: "run mocha tests in the browser"
});

Package.on_use(function (api, where) {
  if (!process.env.METEOR_CLIENT_TEST || process.env.METEOR_CLIENT_TEST != "true")
    return;

  var path = require("path");
  var fs = require("fs");
  var util = require("util");

  api.use("coffeescript", ["client"]);

  api.add_files(['mocha.js', "chai.js", "mocha.css", "pretest.js"], "client");
  files = fs.readdirSync(process.env.METEOR_CLIENT_TEST_DIR)

  var self = this;
  files.forEach(function(file){
    var filePath = path.join(process.env.METEOR_CLIENT_TEST_DIR, file);
    var relativePath = path.relative(self.source_root, filePath)
    api.add_files([relativePath], "client");
  })
;})
