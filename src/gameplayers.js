var consts = require('./consts.js');
var playerFactory = require('./player.js');

var players = [];

var random = 0;

var GamePlayers = {
    init: function () {
        // Build players
        for (var i = 0; i < consts.PLAYER_COUNT; i++) {
            var player = playerFactory.getPlayerInstance();
            var aiCheckbox = document.getElementById(`aiPlayer${i + 1}`);
            if (aiCheckbox && aiCheckbox.checked) {
                player.isAI = true;
            }
            players.push(player);
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
    },
    isAIPlayer: function(player) {
        return player.isAI;
    }
}

module.exports = GamePlayers;
