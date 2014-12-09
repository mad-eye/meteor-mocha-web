var MochaWebTests = null
var MochaWebTestReports = null

Meteor.startup(function(){
  MochaWebTests = new Mongo.Collection("mochaWebTests");
  MochaWebTestReports = new Mongo.Collection("mochaWebTestReports");
  MochaWebSuites = new Mongo.Collection("mochaWebSuites");

  Meteor.subscribe("mochaServerSideTests", {includeAll: true});
  Meteor.subscribe("mochaServerSideTestReports");
  Meteor.subscribe("mochaServerSideSuites");
});

Template.serverTestReport.helpers({
  failedTests: function(){
    return MochaWebTests.find({state: "failed"});
  },

  testReport: function(){
    return MochaWebTestReports.findOne();
  },

  rootSuites: function(){
    var rootSuites = [];
    //TODO add sort
    return MochaWebSuites.find({parentSuiteId: null});
  }
});

Template.mochaTestObject.helpers({
  children: function(){
    var suites = MochaWebSuites.find({parentSuiteId: this._id}).fetch();
    var tests = MochaWebTests.find({parentSuiteId: this._id}).fetch();
    return tests.concat(suites);
  },

  stateClass: function(){
    if (this.state == "passed")
      return "pass";
    if (this.state == "failed")
      return "fail";
    return this.state;
  }
})
