Package.describe({
  summary: "Run mocha tests in the browser"
});

Package.on_use(function (api, where) {

  var fs = Npm.require("fs");
  var path = Npm.require("path");
  var util = Npm.require("util");

  //coffeescript included here in case you want to write your tests in it
  api.use(["coffeescript", "templating"], ["client"]);
  //always include test report template (it will be just be an empty
  //div if not tests/framework are added)
  api.add_files(["testReport.html"], ["client"]);
  //write out filenameHas if it doens't exist so there's no error..

  //dummy file to force package reload when files are added or env
  //variable changes
  var testFileHashFilename = "packages/mocha-web/testFileHash";
  if (! fs.existsSync(testFileHashFilename)){
    fs.writeFileSync(testFileHashFilename, "");
  }
  api.add_files(["createHash.js"], ["server"]);
  api.add_files(["testFileHash"], ["server"]);
  //for environments like production METEOR_MOCHA_TEST_DIR should be
  //undefined and the test framework will not be included
  if (!process.env.METEOR_MOCHA_TEST_DIR && !process.env.METEOR_MOCHA_TEST_DIRS){
    console.log("METEOR_MOCHA_TEST_DIRS is undefined, not including meteor-mocha-web files");
    return;
  }
  api.add_files(["mocha.js", "chai.js", "mocha.css", "preTest.js", "testRunner.js"], "client");
  api.add_files(["mochastub.js", "chai.js"], ["server"]);


  var isTestFile = function(filePath) {
    return ( path.extname(filePath) == '.js'
            || path.extname(filePath) == '.coffee'
            || path.extname(filePath) == '.litcoffee'
           );
  };

  var self = this;
  var addFiles = function(dir){
    dir = path.resolve(dir);
    var files = fs.readdirSync(dir);
    files.forEach(function(file){
      var filePath = path.join(dir, file);
      var packagePath = path.join(path.resolve("."), "packages", "mocha-web");

      var relativePath = path.relative(packagePath, filePath);
      stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        addFiles((filePath));
      } else if (stats.isFile()) {
        if ( isTestFile(filePath) ){
          api.add_files([relativePath], ["client", "server"]);
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
