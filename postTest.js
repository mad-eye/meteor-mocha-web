console.log("running post test");
//TODO something better for detecting once we're ready,
//$(document).rady and Meter.startup are invoked before the div is
//rendered on the page

setTimeout(function(){
  console.log("running mocha");
  mocha.run();
}, 2000);
