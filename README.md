# meteor-mocha-web

meteor-mocha-web allows you to easily and safely run mocha tests within the Meteor framework.  This means you can write tests that use and examine Meteor collections.

Here's an example using CoffeeScript (or [check out the full Meteor project w/ tests](https://github.com/mad-eye/leaderboard-mocha))

```coffeescript
describe "Leaderboard", ->
  describe "givePoints", ->
    it "gives 5 points to the user", ->
      #create a player
      playerId = Players.insert {name: "TestUser1", score: 5}
      Session.set "selected_player", playerId
      givePoints()
      player = Players.findOne(playerId)
      chai.assert.equal 10, player.score
      Players.remove {name: "TestUser1"}
```
You're free to write your tests in JavaScript or CoffeeScript.  The [chai](http://chaijs.com/) assertion library is included in this package, but you're free to use a different assertion library.

Tests are only included when `METEOR_MOCHA_TEST_DIRS` is defined, so they will only exist on environments you specify.

## Setup

1. Install Meteorite if you haven't already `npm install -g meteorite`
2. Add the smart package to your project. `mrt add mocha-web`
3. Add `{{> mochaTestReport}}` to the template where you'd like to see your test results.
4. When running `mrt`, specify where your tests live by setting `METEOR_MOCHA_TEST_DIRS`:
```
$ METEOR_MOCHA_TEST_DIRS="path/to/project/tests:other/path/to/tests" mrt
```
5. Customize mocha options by [setting Meteor.public.mocha_setup_args](http://docs.meteor.com/#meteor_settings) (example below)

```javascript
{
  "public": {
    "mocha_setup_args": {
      "ui": "tdd",
      "check-leaks": false,
      "globals": ["script*"]
    }
  }
}
```

## Optional Setup

### Setting up PhantomJS/Mocha 

```bash
  npm install -g phantomjs
  npm install -g mocha-phantomjs
  mocha-phantomjs http://localhost:3000
```

## Questions?
This package is in its early stages, so please feel free to ask questions, raise issues, or submit pull requests.
