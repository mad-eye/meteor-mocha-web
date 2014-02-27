var MochaWebTests = null
var MochaWebTestReports = null

Meteor.startup(function(){
  MochaWebTests = new Meteor.Collection("mochaWebTests");
  MochaWebTestReports = new Meteor.Collection("mochaWebTestReports");
  MochaWebSuites = new Meteor.Collection("mochaWebSuites");

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
    return suites.concat(tests);
  },

  stateClass: function(){
    if (this.state == "passed")
      return "pass";
    if (this.state == "failed")
      return "fail";
    return this.state;
  }
})
