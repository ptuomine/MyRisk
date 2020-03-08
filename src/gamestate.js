
var gamestate = "nostate";

var GameState = {
    startGame: function () {

    },
    init: function () {
        this.setGameState(this.StartState);
    },
    reset: function() {
    },
    setGameState: function(state) {
        gamestate = state;
    },
    getGameState: function() {
        return gamestate;
    },
    StartState: "Start",
    BattleState: "Battle"
}

module.exports = GameState;