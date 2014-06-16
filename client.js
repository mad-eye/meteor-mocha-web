//TODO allow user to specify if things are "ready" MochaWeb.clientReady()

ddpParentConnection = null;
window.mochaWebClientTestsComplete = false;

var testSetupFunctions = []

MochaWeb.testOnly = function(callback){
  testSetupFunctions.push(callback);
};

Meteor.call("mirrorInfo", function(error, mirrorInfo){
  if (mirrorInfo.isMirror){
    Meteor.setTimeout(function(){
      ddpParentConnection = DDP.connect(mirrorInfo.parentUrl);
      //TODO allow ui to be customized with Meteor.settings
      mocha.setup({reporter: MochaWeb.MeteorCollectionTestReporter, ui: "bdd"});
      testSetupFunctions.forEach(function(testFunction){
        testFunction();
      });
      mocha.run(function(){
        window.mochaWebClientTestsComplete = true;
        //TODO INVOKE CALLBACK HERE
      });
    }, 0);
  }
})
