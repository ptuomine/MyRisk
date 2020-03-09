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
    getAllPlayers: function() {
        return players;
    },
    getAlivePlayers: function() {
        return players.filter(p=>!p.isDead());
    },
    getRandomPlayer2: function() {

        var randomIndex = Math.floor(Math.random() * players.length);;
        random = random < players.length-1 ? random  + 1: 0;
        return players[randomIndex];
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