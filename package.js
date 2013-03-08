Package.describe({
  summary: "run mocha tests in the browser"
});

Package.on_use(function (api, where) {
  //coffeescript included here in case you want to write your tests in it
  api.use(["coffeescript", "templating"], ["client"]);

  //always include test report template (it will be just be an empty
  //div if not tests/framework are added)
  api.add_files(["testReport.html"], "client");

  //for environments like production METEOR_MOCHA_TEST_DIR should be
  //undefined and the test framework will not be included
  if (!process.env.METEOR_MOCHA_TEST_DIR){
    console.log("METEOR_MOCHA_TEST_DIR undefined, not including meteor-mocha-web files");
    return;
  }
  var path = require("path");
  var fs = require("fs");
  var util = require("util");

  api.add_files(["mochastub.js", "chai.js"], ["server"]);
  api.add_files(['mocha.js', "chai.js", "mocha.css", "preTest.js", "testRunner.js"], "client");

  //XXX this should search recursively for test files
  //XXX this should only include js or coffee files
  //XXX should be changed to colon separated METEOR_MOCHA_TEST_DIRS
  files = fs.readdirSync(process.env.METEOR_MOCHA_TEST_DIR)

  var self = this;
  files.forEach(function(file){
    var filePath = path.join(process.env.METEOR_MOCHA_TEST_DIR, file);
    var relativePath = path.relative(self.source_root, filePath)
    stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      //TODO: Recursively enter this and find tests.
    } else if (stats.isFile()) {
      api.add_files([relativePath], ["client", "server"]);
    }
  })
;})
