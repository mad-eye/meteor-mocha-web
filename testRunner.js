Template.mochaTestReport.rendered = function(){
  if (window.mochaPhantomJS){
    var expect = chai.expect;
    mochaPhantomJS.run();
  } else {
    mocha.run();
  }
};
