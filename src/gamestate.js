/**
 * Represents the game state and manages the current state of the game.
 */
var gamestate = "nostate";

var GameState = {
    /**
     * Starts the game by setting the initial game state.
     */
    startGame: function () {

    },

    /**
     * Initializes the game state by setting it to the start state.
     */
    init: function () {
        this.setGameState(this.StartState);
    },

    /**
     * Resets the game state.
     */
    reset: function() {
    },

    /**
     * Sets the current game state.
     * @param {string} state - The new game state.
     */
    setGameState: function(state) {
        gamestate = state;
    },

    /**
     * Returns the current game state.
     * @returns {string} The current game state.
     */
    getGameState: function() {
        return gamestate;
    },

    /**
     * Represents the start state of the game.
     */
    StartState: "Start",

    /**
     * Represents the battle state of the game.
     */
    BattleState: "Battle"
}

module.exports = GameState;
