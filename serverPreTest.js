var Mocha = Npm.require("mocha");

//Mocha Base Reporter
var Base = Npm.require("mocha/lib/reporters/base");

function MeteorCollectionTestReporter(runner){
  Base.call(this, runner);
  var self = this;

  //TODO move these into the bottom startup block
  var MochaWebTests = new Meteor.Collection("mochaWebTests");
  var MochaWebTestReports = new Meteor.Collection("mochaWebTestReports");

  //TODO should not bother publishing if autopublish is turned on
  Meteor.publish("mochaServerSideTests", function(options){
    if(options.includeAll)
      return MochaWebTests.find();
    else
      return MochaWebTests.find({state: "failed"});
  });

  Meteor.publish("mochaServerSideTestReports", function(){
    return MochaWebTestReports.find();
  });


  function saveTestResult(test){
    function getParents(node, parents){
      if (!node.parent || node.parent.title === ""){
        return parents;
      } else{
        parents.push(node.parent.title);
        return getParents(node.parent, parents);
      }
    }

    var err = null
    if (test.err){
      err = {message: test.err.message, stack: test.err.stack};
    }

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
      parents: getParents(test, []),
      err: err
    });
  }

  runner.on("start", Meteor.bindEnvironment(
    function(){
      MochaWebTestReports.remove({});
      MochaWebTests.remove({});
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

mocha = new Mocha({ui: "bdd", reporter: MeteorCollectionTestReporter});
var mochaExports = {};
//this line retrieves the describe, it, etc. functions and puts them
//into mochaExports
mocha.suite.emit("pre-require", mochaExports);
//console.log(mochaExports);

//patch up test description functions so they play nice w/ fibers
//TODO should export other test description functions here as well
describe = function (name, func){
  mochaExports.describe(name, Meteor.bindEnvironment(func, function(err){throw err; }));
};

it = function (name, func){
  mochaExports.it(name, Meteor.bindEnvironment(func, function(err){throw err; }));
};

Meteor.startup(function(){
  mocha.run();
});
