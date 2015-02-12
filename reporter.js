MochaWeb = this.MochaWeb = {};

if (Meteor.isServer)
  var Base = Npm.require("mocha/lib/reporters").Base;
else
  Base = Mocha.reporters.Base

MochaWeb.MeteorCollectionTestReporter = function(runner){
  Base.call(this, runner);
  var self = this;

  function saveTestResult(test){
    if (test.state === "failed"){
      console.log(test.err.message);
      console.log(test.err.stack);
    }

    // console.log("SAVE TEST RESULT", test);

    var ancestors = getAncestors(test);
    var suffix = null;
    if (Meteor.isClient)
      suffix = "_client";
    if (Meteor.isServer)
      suffix = "_server";
    var id = "mocha:" + ancestors.join(":") + ":" + test.title + suffix;
    var fullName = "mocha:" + ancestors.join(":") + ":" + test.title;

    var result = {
      id: id,
      fullName: fullName,
      async: !!test.async,
      framework: "mocha",
      name: test.title,
      pending: test.pending,
      result: test.state,
      duration: test.duration || 0,
      timeOut: test._timeout,
      timedOut: test.timedOut,
      ancestors: ancestors,
      isClient: Meteor.isClient,
      isServer: Meteor.isServer,
      timestamp: new Date()
    };

    if (typeof test.state === "undefined" && test.pending === true) {
      result.result = "pending";
    }
    if (test.err){
      result.failureMessage = test.err.message;
      result.failureStackTrace = test.err.stack;
    }
    // console.log("POSTING RESULT", result);

    Meteor.call("velocity/reports/submit", result, function(error, result){
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
