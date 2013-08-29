Package.describe({
  summary: "Run mocha tests in the browser"
});

Package.on_use(function (api, where) {
  //coffeescript included here in case you want to write your tests in it
  api.use(["coffeescript", "templating"], ["client"]);

  //always include test report template (it will be just be an empty
  //div if not tests/framework are added)
  api.add_files(["testReport.html"], "client");

  //for environments like production METEOR_MOCHA_TEST_DIR should be
  //undefined and the test framework will not be included
  if (!process.env.METEOR_MOCHA_TEST_DIR && !process.env.METEOR_MOCHA_TEST_DIRS){
    console.log("METEOR_MOCHA_TEST_DIRS is undefined, not including meteor-mocha-web files");
    return;
  }

  api.add_files(["mocha.js", "chai.js", "mocha.css", "preTest.js", "testRunner.js"], "client");
  api.add_files(["mochastub.js", "chai.js"], ["server"]);

  var path = Npm.require("path");
  var fs = Npm.require("fs");
  var util = Npm.require("util");

  var isTestFile = function(filePath) {
    return ( path.extname(filePath) == '.js'
            || path.extname(filePath) == '.coffee'
            || path.extname(filePath) == '.litcoffee'
           );
  };

  var self = this;
  var addFiles = function(dir){
    files = fs.readdirSync(dir);
    files.forEach(function(file){
      var filePath = path.join(dir, file);
      var relativePath = path.relative(self.source_root, filePath);
      stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        addFiles((filePath));
      } else if (stats.isFile()) {
        if ( isTestFile(filePath) ){
          api.add_files([filePath], ["client", "server"]);
        }
      }
    });
  };
  if (process.env.METEOR_MOCHA_TEST_DIR){
    addFiles(fs.realpathSync(process.env.METEOR_MOCHA_TEST_DIR));
  }
  if (process.env.METEOR_MOCHA_TEST_DIRS){
    process.env.METEOR_MOCHA_TEST_DIRS.split(":").forEach(function(testDir){
      addFiles(fs.realpathSync(testDir));
    });
  }
});
