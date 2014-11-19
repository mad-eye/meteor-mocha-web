//TODO allow user to specify if things are "ready" MochaWeb.clientReady()

mocha.setup({reporter: MochaWeb.MeteorCollectionTestReporter, ui: "bdd"});
chai.Assertion.includeStack = true;

var subscribeToReports = function(){
  Meteor.subscribe("VelocityTestReports");
  Meteor.subscribe('VelocityTestFiles');
  Meteor.subscribe('VelocityFixtureFiles');
  Meteor.subscribe('VelocityTestReports');
  Meteor.subscribe('VelocityAggregateReports');
  Meteor.subscribe('VelocityLogs');
  Meteor.subscribe('VelocityMirrors');
};

window.mochaWebClientTestsComplete = false;

var testSetupFunctions = []

window.MirrorURLs = new Meteor.Collection("mirrorUrls");

Meteor.startup(function(){
  //try and figure out why this timeout is necessary; remove if possible
  Meteor.setTimeout(function(){
    subscribeToReports();
  }, 1000);
});
