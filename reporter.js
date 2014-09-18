MochaWeb = {};

if (Meteor.isServer)
  var Base = Npm.require("mocha/lib/reporters").Base;
else
  Base = Mocha.reporters.Base

function getAncestors(testObject, ancestors){
  if (!ancestors)
    ancestors = []
  if (testObject.parent && testObject.parent.title !== ""){
    ancestors.push(testObject.parent.title)
    return getAncestors(testObject.parent, ancestors);
  }
  else{
    return ancestors;
  }
};

MochaWeb.MeteorCollectionTestReporter = function(runner){
  Base.call(this, runner);
  var self = this;

  function saveTestResult(test){
    if (test.state === "failed"){
      console.log(test.err.message);
      console.log(test.err.stack);
    }

    // console.log("SAVE TEST RESULT", test);

    var result = {
      id: "mocha:" + Meteor.uuid(),
      async: !!test.async,
      framework: "mocha",
      name: test.title,
      pending: test.pending,
      result: test.state,
      time: test.duration,
      timeOut: test._timeout,
      timedOut: test.timedOut,
      ancestors: getAncestors(test),
      timestamp: new Date()
    };
    if (test.err){
      result.failureMessage = test.err.message;
      result.failureStackTrace = test.err.stack;
    }
    // console.log("POSTING RESULT", result);

    ddpParentConnection.call("postResult", result, function(error, result){
      if (error){
        console.error("ERROR WRITING TEST", error);
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
