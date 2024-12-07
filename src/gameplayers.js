var consts = require('./consts.js');
var playerFactory = require('./player.js');

var players = [];

var random = 0;

/**
 * Represents the GamePlayers object that manages the players in the game.
 */
var GamePlayers = {
    /**
     * Initializes the GamePlayers object by creating player instances.
     */
    init: function () {
        // Build players
        for (var i = 0; i < consts.PLAYER_COUNT; i++) {
            players.push(playerFactory.getPlayerInstance());
        }
    },
    /**
     * Returns all players in the game.
     * @returns {Array} - An array of all player instances.
     */
    getAllPlayers: function() {
        return players;
    },
    /**
     * Returns all alive players in the game.
     * @returns {Array} - An array of alive player instances.
     */
    getAlivePlayers: function() {
        return players.filter(p=>!p.isDead());
    },
    /**
     * Returns a random player from the game.
     * @returns {Object} - A random player instance.
     */
    getRandomPlayer2: function() {
        var randomIndex = Math.floor(Math.random() * players.length);;
        random = random < players.length-1 ? random  + 1: 0;
        return players[randomIndex];
    },
    /**
     * Returns a random player from the game.
     * @returns {Object} - A random player instance.
     */
    getRandomPlayer: function() {
        var randomIndex = random;
        random = random < players.length-1 ? random  + 1: 0;
        return players[randomIndex];
    },
    /**
     * Resets all players in the game.
     */
    reset: function() {
        players.forEach(player=>player.reset());
    }
}

module.exports = GamePlayers;
