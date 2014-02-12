var MochaWebTests = null
var MochaWebTestReports = null

Meteor.startup(function(){
  MochaWebTests = new Meteor.Collection("mochaWebTests");
  MochaWebTestReports = new Meteor.Collection("mochaWebTestReports");

  Meteor.subscribe("mochaServerSideTests");
  Meteor.subscribe("mochaServerSideTestReports");
});

Template.serverTestReport.helpers({
  failedTests: function(){
    return MochaWebTests.find({state: "failed"});
  },

  testReport: function(){
    return MochaWebTestReports.findOne();
  }
});
