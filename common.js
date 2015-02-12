getAncestors = function(testObject, ancestors){
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

//after all the tests have had a chance to load
updateCounts = function(){
  var flattenedTests = [];
  flattenTests = function(suite){
    if (suite.tests){
      suite.tests.forEach(function(test){
        var ancestors = getAncestors(test, []);
        // would it make more sense to pass objects?
        // flattenedTests.push({ancestors: ancestors, title: test.title, isClient: Meteor.isClient})
        if (!mocha.options.grep || mocha.options.grep.test(test.fullTitle()))
          flattenedTests.push("mocha:" + ancestors.join(":") + ":" + test.title)
      });
    }
    suite.suites.forEach(function(suite){
      flattenTests(suite);
    });
  }
  flattenTests(mocha.suite);
  if (Meteor.isServer){
    Meteor.call("addAggregateMetadata", {serverTests: flattenedTests, start: Date.now()});
  }

  if (Meteor.isClient){
    Meteor.call("addAggregateMetadata", {clientTests: flattenedTests});
  }
}
