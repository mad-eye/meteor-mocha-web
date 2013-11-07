Package.describe({
  summary: "run mocha tests in the browser"
});

Package.on_use(function (api, where) {
  //coffeescript included here in case you want to write your tests in it
  api.use(["coffeescript", "templating"], ["client"]);

  //always include test report template (it will be just be an empty
  //div if not tests/framework are added)
  api.add_files(["testReport.html"], "client");
  api.add_files(["mochastub.js", "chai.js"], ["server"]);
  api.add_files(['mocha.js', "chai.js", "mocha.css", "preTest.js", "testRunner.js"], "client");
;})
