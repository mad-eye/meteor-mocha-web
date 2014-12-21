//insert a fake mirror into the db
//this is necssary for CI to work correctly
//it will not cause a mirror process to be started
VelocityMirrors.upsert({name: "fakeMochaPackageMirror"}, {rootUrl: process.env.ROOT_URL})
TEST_FRAMEWORK_NAME = "mocha";

if (Velocity && Velocity.registerTestingFramework){
  Velocity.registerTestingFramework(TEST_FRAMEWORK_NAME, {
    regex: 'mocha/.+\\.(js|coffee|litcoffee|coffee\\.md)$',
  });

  var clientTestsComplete = false;
  var serverTestsComplete = false;

  var Mocha = Npm.require("mocha");
  var Fiber = Npm.require("fibers");
  var childProcess = Npm.require('child_process');
  var path = Npm.require('path');
  var mkdirp = Npm.require("mkdirp");

  ddpParentConnection = null;
  var parentUrl = null;
  var childUrl = null;

  function markTestsComplete(){
    //TODO use this function, ran into some issues w/ fibers when i
    //first tried
    Meteor.call("velocity/reports/completed", {framework: "mocha"}, function(err){
      if (err){
        console.error("error calling testsComplete function", err);
      }
    });
  }

  Meteor.methods({
    "mirrorInfo": function(){
      return {
        isMirror: process.env.IS_MIRROR,
        parentUrl: process.env.PARENT_URL
      }
    },

    "clientTestsComplete": function(){
      // console.log("client tests complete, now running server tests");
       mocha.run(Meteor.bindEnvironment(function(err, result){
         // console.log("server tests complete", err, result);
         markTestsComplete()
      }));
    }
  });

  setupMocha();

  function setupMocha(){
    global.chai = Npm.require("chai");
    // enable stack trace with line numbers with assertions
    global.chai.Assertion.includeStack = true;
    global.mocha = new Mocha({ui: "bdd", reporter: MochaWeb.MeteorCollectionTestReporter});
    setupGlobals();
  }

  function setupGlobals(){
    //basically a direct copy from meteor/packages/meteor/dynamics_nodejs.js
    //except the wrapped function has an argument (mocha distinguishes
    //asynchronous tests from synchronous ones by the "length" of the
    //function passed into it, before, etc.)
    var moddedBindEnvironment = function (func, onException, _this) {
      if (!Fiber.current)
        throw new Error(noFiberMessage);

      var boundValues = _.clone(Fiber.current._meteor_dynamics || []);

      if (!onException || typeof(onException) === 'string') {
        var description = onException || "callback of async function";
        onException = function (error) {
          Meteor._debug(
            "Exception in " + description + ":",
            error && error.stack || error
          );
        };
      }

      //note the callback variable present here
      return function (callback) {
        var args = _.toArray(arguments);

        var runWithEnvironment = function () {
          var savedValues = Fiber.current._meteor_dynamics;
          try {
            // Need to clone boundValues in case two fibers invoke this
            // function at the same time
            Fiber.current._meteor_dynamics = _.clone(boundValues);
            var ret = func.apply(_this, args);
          } catch (e) {
            onException(e);
          } finally {
            Fiber.current._meteor_dynamics = savedValues;
          }
          return ret;
        };

        if (Fiber.current)
          return runWithEnvironment();
        Fiber(runWithEnvironment).run();
      };
    };


    var mochaExports = {};
    //console.log(mochaExports);
    mocha.suite.emit("pre-require", mochaExports, null, mocha);

    //patch up describe function so it plays nice w/ fibers
    global.describe = function (name, func){
      mochaExports.describe(name, Meteor.bindEnvironment(func, function(err){throw err; }));
    };
    global.describe.skip = mochaExports.describe.skip;
    global.describe.only = mochaExports.describe.only;

    //In Meteor, these blocks will all be invoking Meteor code and must
    //run within a fiber. We must therefore wrap each with something like
    //bindEnvironment. The function passed off to mocha must have length
    //greater than zero if we want mocha to run it asynchronously. That's
    //why it uses the moddedBindEnivronment function described above instead

    //We're actually having mocha run all tests asynchronously. This
    //is because mocha cannot tell when a synchronous fiber test has
    //finished, because the test runner runs outside a fiber.

    //It is possible that the mocha test runner could be run from within a
    //fiber, but it was unclear to me how that could be done without
    //forking mocha itself.

    global['it'] = function (name, func){
      wrappedFunc = function(callback){
        if (func.length == 0){
          func();
          callback();
        }
        else {
          func(callback);
        }
      }

      boundWrappedFunction = moddedBindEnvironment(wrappedFunc, function(err){
        throw err;
      });

      mochaExports['it'](name, boundWrappedFunction);
    };
    global.it.skip = mochaExports.it.skip;
    global.it.only = mochaExports.it.only;

    ["before", "beforeEach", "after", "afterEach"].forEach(function(testFunctionName){
      global[testFunctionName] = function (func){
        wrappedFunc = function(callback){
          if (func.length == 0){
            func();
            callback();
          }
          else {
            func(callback);
          }
        }

        boundWrappedFunction = moddedBindEnvironment(wrappedFunc, function(err){
          throw err;
        });
        mochaExports[testFunctionName](boundWrappedFunction);
      }
    });
  }

  //add Metoer-specfiic describe.client, describe.server etc.
  describe.client = function(){};
  it.client = function(){};

  describe.server = describe;
  describe.it = it;
}

var addAggregateMetadata = function(data){
  VelocityAggregateReports.upsert({name: "mochaMetadata"}, {$set: data});
}

Meteor.methods({
  'mochaResetAll': function(){
    Meteor.call("velocity/reset", function(err){
      updateCounts();
      if (err){
        console.error("error calling testsComplete function", err);
      }
    });
  },

  addAggregateMetadata: function(data){
    addAggregateMetadata(data);
  },
});
