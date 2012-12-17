Package.describe({
  summary: "run mocha tests in the browser"
});

Package.on_use(function (api, where) {
  if (!process.env.METEOR_CLIENT_TEST || process.env.METEOR_CLIENT_TEST != "true")
    return;

  var path = require("path");
  var fs = require("fs");

  api.use("coffeescript", ["client"]);

  api.add_files(['mocha.js'], "client");
  api.add_files(["chai.js"], "client");
  api.add_files(['mocha.css'], "client");
  api.add_files(["preTest.js"], "client");

  process.chdir(process.env.METEOR_CLIENT_TEST_DIR);
  clientTestPath = ".";
  files = fs.readdirSync(clientTestPath)

  //TODO figure out something less ugly for adding these files
  //create symbolic link to from project client/tests? 

  files.forEach(function(file){
    api.add_files(["../../../../client/tests/" + file], "client");
  })

  //This runs the test
  //leaving this out for now so tests aren't run on every page
  //  api.add_files(["postTest.js"], "client");
;})
