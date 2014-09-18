# velocity-mocha

`metoer add mike:mocha`

This meteor package allows you to easily and safely run [mocha](http://visionmedia.github.io/mocha/) tests *within* Meteor. It is built upon the [Velocity testing framework](https://github.com/meteor-velocity/velocity).

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

You're free to write your tests in any Meteor supported extension. The [chai](http://chaijs.com/) assertion library is included within this package for your convenience.

velocity-mocha relies heavily on the velocity project

