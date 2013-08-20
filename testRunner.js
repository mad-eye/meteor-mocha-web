Template.mochaTestReport.rendered = function(){
  if (window.mochaPhantomJS){
    var expect = chai.expect;
    window.mochaPhantomJS.run();
  } else {
    mocha.run();
  }
};
