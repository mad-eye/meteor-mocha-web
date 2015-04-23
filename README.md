# velocity-mocha

`meteor add mike:mocha`

This meteor package allows you to easily and safely run [mocha](http://mochajs.org/) tests *within* [Meteor](https://www.meteor.com). It is built upon the [Velocity testing framework](https://github.com/meteor-velocity/velocity).

Here's an example using CoffeeScript (or [check out the full Meteor project w/ tests](https://github.com/mad-eye/leaderboard-mocha))

```coffeescript
MochaWeb?.testOnly ->
  describe "Leaderboard", ->
    describe "givePoints", ->
      it "gives 5 points to the user", ->
        #create a player
        playerId = Players.insert {name: "TestUser1", score: 5}
        Session.set "selectedPlayer", playerId
        # wait 100ms for button to appear, then continue
        setTimeout (->
          $('button.inc').click()
          player = Players.findOne(playerId)
          chai.assert.equal 10, player.score
          Players.remove playerId
          done()
        ), 100
```

## Setting Up

The above test will work with the `leaderboard` example shipped with Meteor 1.0.

1. Create the app with `meteor create --example leaderboard`
2. Change the current working directory to `leaderboard`
3. Start the app by running `meteor`
4. Add CoffeeScript support with `meteor add coffeescript`
5. Create the directory `tests/mocha/client`
6. Save the above test code in a file called `tests/mocha/client/leaderboard.coffee`
7. Navigate to the app (<http://localhost:3000/> by default) and click the Velocity icon in the upper right to see test results

You're free to write your tests in any Meteor supported extension. The [chai](http://chaijs.com/) assertion library is included within this package for your convenience.

(requires Meteor 0.9+)

## Testing a local installation of mocha

1. Clone this repository somewhere `git clone https://github.com/mad-eye/meteor-mocha-web`
2. Create a packages directory in the root of your app if it doesn't already exist `cd YOUR_APP && mkdir packages`
3. Create a symlink to the repository you cloned `cd YOUR_APP/packages && ln -s /PATH/TO/meteor-mocha-web mike:mocha`
4. Run your app

### Running tests in Continuous Integration

Use the commmand:

```bash
meteor --test --release velocity:METEOR@1.1.0.2_2
```

The release `velocity:METEOR@1.1.0.2_2` contains a fix for running
the client integration tests.

## Using `mike:mocha-package`
See the README for this fork [https://github.com/mad-eye/meteor-mocha-web/tree/packageTest]([https://github.com/mad-eye/meteor-mocha-web/tree/packageTest])

I hope to fold this back into master soon.
