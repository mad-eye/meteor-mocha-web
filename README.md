# velocity-mocha

`meteor add mike:mocha-package`

This meteor package allows you to easily and safely run [mocha](http://visionmedia.github.io/mocha/) package tests *within* [Meteor](https://www.meteor.com). It is built upon the [Velocity testing framework](https://github.com/meteor-velocity/velocity).


## Running with respondly:test-reporter
`meteor test-packages --driver-package respondly:test-reporter YOUR:PACKAGE`

## Running headless (for CI)
`meteor test-packages --velocity --driver-package respondly:test-reporter YOUR:PACKAGE`

*Still a WIP*
