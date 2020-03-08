var consts = require('./consts.js');
var playerFactory = require('./player');

var players = [];

var random = 0;

var GamePlayers = {
    init: function () {
        // Build players
        for (i = 0; i < consts.PLAYER_COUNT; i++) {
            players.push(playerFactory.getPlayerInstance());
        }
    },
    getRandomPlayer: function() {
        var randomIndex = random;
        random = random < players.length-1 ? random  + 1: 0;
        return players[randomIndex];
    },
    reset: function() {
        players.forEach(player=>player.reset());
    }

}

module.exports = GamePlayers;