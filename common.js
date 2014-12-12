//after all the tests have had a chance to load
updateCounts = function(){
  var count = 0;
  countTests = function(suite){
    if (suite.tests){
      count = count + suite.tests.length;
    }
    suite.suites.forEach(function(suite){
      countTests(suite);
    });
  }
  countTests(mocha.suite);
  if (Meteor.isServer){
    Meteor.call("addAggregateMetadata", {serverTestCount: count});
  }

  if (Meteor.isClient){
    Meteor.call("addAggregateMetadata", {clientTestCount: count});
  }
}
