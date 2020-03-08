var consts = require('./consts.js');
var gameplayers = require('./gameplayers');

var GameState = {
    startGame: function () {

    },
    createGameStats: function () {

        var table = document.getElementById("playertable");
        var players = gameplayers.getAllPlayers();

        // build the heading row
        var tableheadings = consts.GAMESTATS_HEADINGS;
        var headingrow = document.createElement("tr");
        tableheadings.forEach(heading => {
            var elem = document.createElement("th");
            elem.innerText = heading;
            headingrow.appendChild(elem);
        })
        table.appendChild(headingrow);

        // build the data rows
        players.forEach(player => {
            var playerrow = document.createElement("tr");
            table.appendChild(playerrow);

            // player name
            var playercol = document.createElement("td");
            playercol.innerText = player.getName();
            playerrow.appendChild(playercol);

            // continents
            var playercol = document.createElement("td");
            playercol.innerText = player.getState().continents.length;
            playerrow.appendChild(playercol);

            // regions
            var playercol = document.createElement("td");
            playercol.innerText = player.getState().regions.length;
            playerrow.appendChild(playercol);

            // troops
            var playercol = document.createElement("td");
            playercol.innerText = player.getState().getTroopCount();
            playerrow.appendChild(playercol);

            // cards
            var playercol = document.createElement("td");
            playercol.innerText = player.getState().cards;
            playerrow.appendChild(playercol);

        })



        return table;

    }
}

module.exports = GameState;