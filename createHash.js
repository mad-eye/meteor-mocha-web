var crypto = Npm.require("crypto");
var path = Npm.require('path');
var fs = Npm.require("fs");

var testFiles = listTestFiles();
writeHash(hash(JSON.stringify(testFiles)));

function listTestFiles(){
  var testFiles = [];
  if (process.env.METEOR_MOCHA_TEST_DIR){
    testFiles = lsDirs([process.env.METEOR_MOCHA_TEST_DIR]);
  }
  if (process.env.METEOR_MOCHA_TEST_DIRS){
    testFiles.concat(lsDirs(process.env.MOCHA_MOCHA_TEST_DIRS.split(":")));
  }
  return testFiles;
}

function lsDirs(dirs){
  var files = [];
  dirs.forEach(function(dir){
    files = files.concat(fs.readdirSync(dir));
  });
  return files;
}

function packageDirectory(){
  //in straight node.js we could just say
  //return __dirname
  //but fibers make that impossible for some reason..

  var basePath = path.resolve('.');
  var projectDirectory = basePath.split('.meteor')[0];
  return path.join(projectDirectory, "packages/mocha-web");
}

//write out the hash to #{packageDirectory}/testFileHash
function writeHash(hash){
  fs.writeFileSync(path.join(packageDirectory(), "testFileHash"), hash);
}

function hash(string){
  var sha = crypto.createHash("sha1");
  sha.update(string, "utf-8");
  var hash = sha.digest("base64");
  return hash;
}
