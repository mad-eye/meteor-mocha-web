Package.describe({
  summary: "run mocha tests in the browser"
});

Package.on_use(function (api, where) {
  if (!process.env.METEOR_CLIENT_TEST || process.env.METEOR_CLIENT_TEST != "true")
    return;

  var path = require("path");
  var fs = require("fs");

  api.add_files(['mocha.js'], "client");
  api.add_files(['mocha.css'], "client");
  api.add_files(["preTest.js"], "client");

  clientTestPath = path.join(process.cwd(), "client", "tests");
  files = fs.readdirSync(clientTestPath)

  //TODO figure out something less ugly for adding these files
  //create symbolic link to from project client/tests? 
  files.forEach(function(file){
    api.add_files(["../../../../client/tests/" + file], "client");
  })

  api.add_files(["postTest.js"], "client");
;})
