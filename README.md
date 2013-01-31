# meteor-mocha-web

meteor-mocha-web allows you to easily and safely run mocha tests within the Meteor framework.  This means you can write tests that use and examine Meteor collections.

*CODE_SAMPLE*

meteor-mocha-web includes the [chai](http://chaijs.com/) assertion library 
(but you can use a different assertion library if you choose).

Tests are only included when `METEOR_MOCHA_TEST_DIR` is defined, so they will only exist on environments you specify.

## Setup

1. Install Meteorite if you haven't already `npm install -g meteorite`
2. Add the smart package to your project. `mrt add mocha-web`
3. Add `{{mochaTestReport}}` to the template where you'd like to see your test results.
4. When running `mrt`, specify where your tests live by setting `METEOR_MOCHA_TEST_DIR`:
```
$ METEOR_MOCHA_TEST_DIR=path/to/project/tests mrt
```

## Optional Setup

### Setting up PhantomJS/Mocha 
TODO

## Questions?
This package is in its early stages, so please feel free to ask questions, raise issues, or submit pull requests.
