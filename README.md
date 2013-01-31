# meteor-mocha-client

Meteor-mocha-client allows you to easily and safely run mocha tests within the Meteor framework.  This means you can write tests that use Meteor collections.

## Setup

1. Install Meteorite if you haven't already `npm install -g meteorite`
2. Add the smart package to your project. `mrt add PACKAGE_NAME`
3. Create these environment variables
  -METEOR_CLIENT_TEST_DIR (set to directory containing your client side tests
  -METEOR_CLIENT_TEST (set to true)
4. Restart your meteor server if it's already running.
5. Add `{{test-report}}` to the template where you'd like to see your test results

## Optional Setup

### Setting up PhantomJS/Mocha 
