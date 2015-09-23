// Do not run tests if Velocity is not enabled
if (process.env.VELOCITY === "0") {
  return;
}

//register the testing framework if this is the main app (not a mirror)
if (!process.env.IS_MIRROR){
  Velocity.registerTestingFramework("mocha", {
    regex: '^tests/mocha/.*$',
    sampleTestGenerator: function(){
      return [
        { path: "mocha/client/sampleClientTest.js",
          contents: Assets.getText("sample-tests/client.js")
        },
        { path: "mocha/server/sampleServerTest.js",
          contents: Assets.getText("sample-tests/server.js")}
      ];
    }
  });
}

var clientTestsComplete = false;
var serverTestsComplete = false;

var Mocha = Npm.require("mocha");
var childProcess = Npm.require('child_process');
var path = Npm.require('path');
var mkdirp = Npm.require("mkdirp");

ddpParentConnection = null;
var parentUrl = null;

Meteor.startup(function(){
  if (process.env.IS_MIRROR) {
    console.log("MOCHA MIRROR LISTENING AT", process.env.ROOT_URL);
    parentUrl = process.env.PARENT_URL;
    ddpParentConnection = DDP.connect(parentUrl);

    runServerTests = Meteor.bindEnvironment(function() {
      console.log("Running mocha server tests");
      mocha.run(Meteor.bindEnvironment(function(err){
        if (err){
          console.log("Error running server tests", err);
        }
        markTestsComplete();
      }));
    });
  } else {
    mirrorPort = process.env.MOCHA_MIRROR_PORT;
    opt = {
      framework: 'mocha',
      testsPath: "mocha",
      rootUrlPath: '?mocha=true',
    }
    if(mirrorPort) {
      opt['port'] = parseInt(mirrorPort);
    }

    Meteor.call("velocity/mirrors/request", opt, function(err, msg){
      if (err){
        console.log("error requesting mirror", err);
      }
    });
  }
});

var markTestsComplete = function(){
  ddpParentConnection.call("velocity/reports/completed", {framework: "mocha"}, function(err){
    if (err){
      console.error("error calling testsComplete function", err);
    }
  });
};

Meteor.methods({
  "mirrorInfo": function(){
    return {
      isMirror: process.env.IS_MIRROR,
      parentUrl: process.env.PARENT_URL
    };
  },
  "clientTestsComplete": function(){
    runServerTests();
  }
});

//if not a mirror don't do anything
MochaWeb.testOnly = function(callback){
  // console.log("NO OP", mirror.isMirror);
};

function setupMocha(){
  if (! process.env.IS_MIRROR)
    return;

  MochaWeb.testOnly = function(callback){
    callback();
  }

  global.chai = Package['practicalmeteor:chai'].chai;
  global.mocha = new Mocha({ui: "bdd", reporter: MochaWeb.MeteorCollectionTestReporter});
  Package['mike:mocha-core'].setupGlobals(mocha);
}
setupMocha();
