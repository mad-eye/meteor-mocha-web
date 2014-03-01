var Mocha = Npm.require("mocha");
var Fiber = Npm.require("fibers");
var _ = Npm.require("underscore");
chai = Npm.require("chai");

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


//Mocha Base Reporter
var Base = Npm.require("mocha/lib/reporters").Base;

function MeteorCollectionTestReporter(runner){
  Base.call(this, runner);
  var self = this;

  //TODO move these into the bottom startup block
  var MochaWebTests = new Meteor.Collection("mochaWebTests");
  var MochaWebSuites = new Meteor.Collection("mochaWebSuites");
  var MochaWebTestReports = new Meteor.Collection("mochaWebTestReports");


  //TODO should not bother publishing if autopublish is turned on
  Meteor.publish("mochaServerSideTests", function(options){
    check(options, {includeAll: Boolean});
    if(options && options.includeAll)
      return MochaWebTests.find();
    else
      return MochaWebTests.find({state: "failed"});
  });

  Meteor.publish("mochaServerSideTestReports", function(){
    return MochaWebTestReports.find();
  });

  Meteor.publish("mochaServerSideSuites", function(){
    return MochaWebSuites.find();
  });

  function saveTestResult(test){

    //node can be a test or a suite
    //returns the ID of the node's immediate parent
    function findOrInsertParents(node){
      var bloodline = getParents(node, []);
      //no parents to insert
      if (bloodline.length == 0)
        return null;
      parent = MochaWebSuites.findOne({bloodline: bloodline});
      if (!parent) {
        grandparentSuiteId = findOrInsertParents(node.parent);
      }
      else {
        return parent._id;
      }
      return MochaWebSuites.insert({
        title: node.parent.title,
        bloodline: bloodline,
        suite: true,
        parentSuiteId: grandparentSuiteId
      });
    }

    function getParents(node, parents){
      if (!node.parent || node.parent.title === ""){
        return parents;
      } else{
        parents.unshift(node.parent.title);
        return getParents(node.parent, parents);
      }
    }

    var err = null
    if (test.err){
      err = {message: test.err.message, stack: test.err.stack};
      console.log(err.message, err.stack);
    }

    var parentSuiteId = findOrInsertParents(test);

    MochaWebTests.insert({
      title: test.title,
      async: test.async,
      sync: test.sync,
      timedOut: test.timedOut,
      pending: test.pending,
      type: test.type,
      duration: test.duration,
      state: test.state,
      speed: test.speed,
      parentSuiteId: parentSuiteId,
      err: err
    });
  }

  runner.on("start", Meteor.bindEnvironment(
    function(){
      MochaWebTestReports.remove({});
      MochaWebTests.remove({});
      MochaWebSuites.remove({});
      self.testReportId = MochaWebTestReports.insert({started: Date.now()})
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
    MochaWebTestReports.update(self.testReportId, {$set: {
      tests: self.stats.tests,
      passes: self.stats.passes,
      pending: self.stats.pending,
      failures: self.stats.failures,
      ended: Date.now()
    }});
  }, function(err){
    throw err;
  }));
}


var mochaExports = {};
//this line retrieves the describe, it, etc. functions and puts them
//into mochaExports (mochaExports = {it: func, desc: func,...})
mocha = new Mocha({ui: "bdd", reporter: MeteorCollectionTestReporter});
mocha.suite.emit("pre-require", mochaExports);
//console.log(mochaExports);

//patch up describe function so it plays nice w/ fibers
describe = function (name, func){
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
//fiber, but it was unclear to me ow that could be done without
//forking mocha itself.

["it", "before", "beforeEach", "after", "afterEach"].forEach(function(testFunctionName){
  global[testFunctionName] = function (name, func){
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

    mochaExports[testFunctionName](name, boundWrappedFunction);
  }
});

Meteor.startup(function(){
  mocha.run();
});
