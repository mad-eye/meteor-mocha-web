# meteor-mocha-web

meteor-mocha-web allows you to easily and safely run mocha tests within the Meteor framework.  This means you can write tests that use and examine Meteor collections.

*CODE_SAMPLE*

Tests are only included when `METEOR_MOCHA_TEST_DIR` is defined, so they will only exist on environments you specify.

## Setup

1. Install Meteorite if you haven't already `npm install -g meteorite`
2. Add the smart package to your project. `mrt add PACKAGE_NAME`
3. Specify where your tests live in `METEOR_MOCHA_TEST_DIR`
4. Restart meteor if it's already running.
5. Add `{{mochaTestReport}}` to the template where you'd like to see your test results.

## Optional Setup

### Setting up PhantomJS/Mocha 
TODO
