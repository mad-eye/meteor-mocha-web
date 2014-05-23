MochaWeb = {};

if (Meteor.isServer)
  var Base = Npm.require("mocha/lib/reporters").Base;  
else
  Base = Mocha.reporters.Base

MochaWeb.MeteorCollectionTestReporter = function(runner){
  Base.call(this, runner);
  var self = this;

  function saveTestResult(test){
    // console.log("TEST", test)
    ddpParentConnection.call("postResult", {
      id: Meteor.uuid(),
      name: test.title,
      framework: "mocha-web",
      result: test.state
    }, function(error, result){
      if (error){
        console.error("ERROR SAVING TEST", error);
      }
    });
  }

  runner.on("start", Meteor.bindEnvironment(
    function(){
      //TODO tell testRunner that mocha tests have started
    },
    function(err){
      throw err;
    }
  ));

  ["pass", "fail", "pending"].forEach(function(testEvent){
    runner.on(testEvent, Meteor.bindEnvironment(
      function(test){
        saveTestResult(test);
      },
      function(err){
        throw err;
      }
    ));
  });

  runner.on('end', Meteor.bindEnvironment(function(){
    //TODO tell testRunner all mocha web tests have finished
  }, function(err){
    throw err;
  }));
};
