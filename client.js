//TODO allow user to specify if things are "ready" MochaWeb.clientReady()

ddpParentConnection = null;
window.mochaWebClientTestsComplete = false;

MochaWeb.testOnly = function(callback){
  //this could be cached on the client..
  Meteor.call("mirrorInfo", function(error, mirrorInfo){
    if (mirrorInfo.isMirror){
      ddpParentConnection = DDP.connect(mirrorInfo.parentUrl);
      //TODO allow ui to be customized with Meteor.settings
      mocha.setup({reporter: MochaWeb.MeteorCollectionTestReporter, ui: "bdd"});
      callback();
    }
    if (error){
      console.error(error);
    }
  })
};

Meteor.call("mirrorInfo", function(error, mirrorInfo){
  if (mirrorInfo.isMirror){
    Meteor.setTimeout(function(){
      // console.log("RUN THE CLIENT TESTS");
      mocha.run(function(){
        window.mochaWebClientTestsComplete = true;
      });
    }, 0);
  }
})
