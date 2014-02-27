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
  //TODO coffeescript should be a weak dependency
  api.use(["coffeescript"], ["client", "server"]);
  api.use(["templating", "less"], ["client"]);

  //always include test report template (it will be just be an empty
  //div if not tests/framework are added)
  api.add_files(["testReport.html", "testReport.js"], "client");

  //for environments like production METEOR_MOCHA_TEST_DIR should be
  //undefined and the test framework will not be included
  if (!process.env.METEOR_MOCHA_TEST_DIR && !process.env.METEOR_MOCHA_TEST_DIRS){
    console.log("METEOR_MOCHA_TEST_DIRS is undefined, not including meteor-mocha-web files");
    return;
  }

  api.add_files(["mocha.js", "chai.js", "mocha.less", "preTest.js", "testRunner.js"], "client");
  api.add_files(["serverPreTest.js"], "server");


  api.export("webTests", "client");
  api.export("webTestReports", "client");

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

  var addFiles = function(dir, where){
    files = fs.readdirSync(dir);
    files.forEach(function(file){
      if (file == 'client') {
        where = ['client'];
      } else if (file == 'server') {
        where = ['server'];
      } //Else keep the parent's where
      var filePath = path.join(dir, file);
      var sourceRoot = self.source_root || "";
      var relativePath = path.relative(sourceRoot, filePath);
      stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        addFiles(filePath, where);
      } else if (stats.isFile()) {
        if ( isTestFile(filePath) ){
          api.add_files([filePath], where);
        }
      }
    });
  };

  if (process.env.METEOR_MOCHA_TEST_DIR){
    addFiles(fs.realpathSync(process.env.METEOR_MOCHA_TEST_DIR), ["client", "server"]);
  }
  if (process.env.METEOR_MOCHA_TEST_DIRS){
    process.env.METEOR_MOCHA_TEST_DIRS.split(":").forEach(function(testDir){
      addFiles(fs.realpathSync(testDir), ["client", "server"]);
    });
  }
});
