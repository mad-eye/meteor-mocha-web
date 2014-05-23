var system = require("system");
var page = require('webpage').create();

page.onConsoleMessage = function(msg){
  console.log("PHANTOM:", msg);
};

//TODO change this to an interval
//check to see if tests have completed each time..
//set a global false, change it to true when tests have finished

page.open(system.args[1], function() {
  setTimeout(function(){
    page.render('example.png');
    phantom.exit();    
  }, 2000);
});


