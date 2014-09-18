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

One can test templates with code like this
```javascript
describe("should display on the episodes template", function() {
  it("Title", function() {
    episode = Episode.create({title: 'Episode 15 - Google Ventures'})
    div = document.createElement("DIV");
    comp = UI.renderWithData(Template.episode, episode);
    UI.insert(comp, div)
    $(div).html().should.include('Episode 15 - Google Ventures')
    episode.destroy()
  });
});
```

## Setup

1. Install Meteorite if you haven't already `npm install -g meteorite`
2. Add the smart package and velocity to your project in your smart.json.
```json
{
  "mocha-web": {
    "git": "https://github.com/mad-eye/meteor-mocha-web",
    "branch": "velocity"
  },
  "velocity": {
    "git": "https://github.com/xolvio/velocity",
    "branch": "master"
  }
}
```
