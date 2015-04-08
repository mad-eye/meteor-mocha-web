//TODO allow user to specify if things are "ready" MochaWeb.clientReady()

ddpParentConnection = null;
window.mochaWebClientTestsComplete = false;

var testSetupFunctions = [];

MochaWeb.testOnly = function(callback){
  testSetupFunctions.push(callback);
};

window.MirrorURLs = new Meteor.Collection("mirrorUrls");

Meteor.startup(function(){
  //TODO this method should probably live in the Velocity namespace velocity/mirrorInfo?
  Meteor.call("mirrorInfo", function(error, mirrorInfo){
    if (mirrorInfo.isMirror){
      Session.set("mochaWebMirror", true);
      Meteor.setTimeout(function(){
        ddpParentConnection = DDP.connect(mirrorInfo.parentUrl);
        // enable stack trace with line numbers with assertions
        chai.Assertion.includeStack = true;
        //TODO allow ui to be customized with Meteor.settings
        mocha.setup({reporter: MochaWeb.MeteorCollectionTestReporter, ui: "bdd"});
        testSetupFunctions.forEach(function(testFunction){
          testFunction();
        });
        mocha.run(function(){
          window.mochaWebClientTestsComplete = true;
          Meteor.call("clientTestsComplete", function(err, result){
            if (err){
              console.error("ERROR INVOKING CLIENT TESTS COMPLETE", err);
            }
          });
        });
      }, 0);
    } else {
      Session.set("mochaWebMirror", false);
      Meteor.subscribe("mirrorUrls");
    }
  });
});

Template.mochaweb.helpers({
  mochaWebIFrameURL: function(){
    var mirror = VelocityMirrors.findOne({framework: "mocha", state: "ready"});
    if (mirror && mirror.rootUrl){
      return mirror.rootUrl + mirror.rootUrlPath + "&lastModified=" + mirror.lastModified;
    }
    return null;
  }
});
