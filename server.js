TEST_FRAMEWORK_NAME = "mocha";

if (!process.env.NODE_ENV === "development"){
  console.log("process.env.NODE ENV != DEVELOPMENT, TESTS WILL NOT BE RAN");
}
else {
  if (Velocity && Velocity.registerTestingFramework){
    Velocity.registerTestingFramework(TEST_FRAMEWORK_NAME, {
      regex: 'mocha/.+\\.(js|coffee|litcoffee|coffee\\.md)$'
    });
  }

  var clientTestsComplete = false;
  var serverTestsComplete = false;

  var Mocha = Npm.require("mocha");
  var Fiber = Npm.require("fibers");
  var _ = Npm.require("underscore");
  var childProcess = Npm.require('child_process');
  var path = Npm.require('path');
  var mkdirp = Npm.require("mkdirp");

  ddpParentConnection = null;
  var parentUrl = null;
  var childUrl = null;

  Meteor.startup(function(){
    if (process.env.IS_MIRROR) {
      console.log("MOCHA-WEB MIRROR LISTENING AT", process.env.ROOT_URL);
      parentUrl = process.env.PARENT_URL;
      console.log("PARENT URL", process.env.PARENT_URL);
      ddpParentConnection = DDP.connect(parentUrl);
      console.log("Running mocha server tests");
      mocha.run(function(err){
        serverTestsComplete = true;
        if (clientTestsComplete){
          markTestsComplete();
        }
      });
    }
  });

  function markTestsComplete(){
    ddpParentConnection.call("completed", {framework: "mocha"}, function(err){
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
      // console.log("CLIENT TESTS COMPLETE");
      clientTestsComplete = true;
      if (serverTestsComplete){
        markTestsComplete();
      }
    }
  })

  //if not a mirror don't do anything
  MochaWeb.testOnly = function(callback){
    // console.log("NO OP", mirror.isMirror);
  };

  setupMocha();

  function setupMocha(){
    if (! process.env.IS_MIRROR)
      return;
    // console.log("Enabling MochaWeb.testOnly");
    //only when mocha has been explicity enabled (in a mirror)
    //do we run the tests
    MochaWeb.testOnly = function(callback){
      callback();
    }

    global.chai = Npm.require("chai");

    global.mocha = new Mocha({ui: "bdd", reporter: MochaWeb.MeteorCollectionTestReporter});
    console.log("SETUP GLOBALS");
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
    mocha.suite.emit("pre-require", mochaExports);
    //console.log(mochaExports);

    //patch up describe function so it plays nice w/ fibers
    global.describe = function (name, func){
      mochaExports.describe(name, Meteor.bindEnvironment(func, function(err){throw err; }));
    };

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
  function copyTestsToMirror(file){
    Meteor.call("resetReports", {framework: "mocha"}, function(){
      var relativeDest = file.relativePath.split(path.sep).splice(1).join(path.sep);
      var mirrorPath = path.join(process.env.PWD, ".meteor", "local", ".mirror");
      var dest = path.join(mirrorPath, relativeDest);
      mkdirp.sync(dest);
      var cmd = "cp " +  file.absolutePath + " " + dest;
      childProcess.exec(cmd, function(err){
        if (err) {
          console.error(err);
        }
      });
    });
  }

  Meteor.startup(function(){
    VelocityTestFiles.find({targetFramework: 'mocha'}).observe({
      added: copyTestsToMirror,
      changed: copyTestsToMirror,
      removed: copyTestsToMirror
    });
  })
}
