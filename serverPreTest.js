var Mocha = Npm.require("mocha");
mocha = new Mocha({ui: "bdd"});
//this mysterious line brings in all the functions used to describe tests
var mochaExports = {}
//this line brings captures describe, it, etc.
mocha.suite.emit("pre-require", mochaExports);
//console.log(mochaExports);

//patch up test description fucntions so they play nice w/ fibers
describe = function (name, func){
  mochaExports.describe(name, Meteor.bindEnvironment(func, function(err){throw err; }));
};

it = function (name, func){
  mochaExports.it(name, Meteor.bindEnvironment(func, function(err){throw err; }));
};

//TODO move into a Meteor method
//TODO use JSON test reporter or something similar
Meteor.setTimeout(function(){
  mocha.run();
}, 4000);
