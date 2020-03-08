var consts = require('./consts.js');
var gameplayers = require('./gameplayers');
var currentplayer = 0;

var gamestats = [];
var gamestate = "nostate";

var playerrows = [];
var players = gameplayers.getAllPlayers();

var GameState = {
    startGame: function () {

    },
    init: function () {

        this.setGameState(this.StartState);

        var table = document.getElementById("playertable");

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
            playerrow.playerobj = player;
            playerrows.push(playerrow);
            table.appendChild(playerrow);

            // player name
            var namecol = document.createElement("td");
            namecol.innerText = player.getName();
            namecol.style.backgroundColor = player.getColor();
            playerrow.appendChild(namecol);

            // continents
            var contcol = document.createElement("td");
            playerrow.appendChild(contcol);

            // regions
            var regcol = document.createElement("td");
            playerrow.appendChild(regcol);

            // troops
            var troopcol = document.createElement("td");
            playerrow.appendChild(troopcol);

            // cards
            var cardcol = document.createElement("td");
            playerrow.appendChild(cardcol);

            // gamestats
            gamestats.push({
                player: player,
                contcol: contcol,
                regcol: regcol,
                troopcol: troopcol,
                cardcol: cardcol
            })

        })
        playerrows[currentplayer].classList.add("activeplayer");
    },
    reset: function() {
        playerrows[currentplayer].classList.remove("activeplayer");
        currentplayer = 0;
        playerrows[currentplayer].classList.add("activeplayer");

    },
    updateGameStats : function() {

        gamestats.forEach(stat => {
            stat.contcol.innerText = stat.player.getState().continents.length;
            stat.regcol.innerText = stat.player.getState().regions.length;
            stat.troopcol.innerText = stat.player.getState().getTroopCount();
            stat.cardcol.innerText = stat.player.getState().cards;
        })

    },
    nextPlayer: function() {
        var nextplayer = getNextPlayer();
        if (currentplayer == nextPlayer) {
            // game over. currentplayer has won
            alert("GAME OVER: " + playerrows.playerobj.getName() + " has won");
            return false;
        } else {
            playerrows[currentplayer].classList.remove("activeplayer");
            playerrows[nextplayer].classList.add("activeplayer");
        }

        function getNextPlayer(rowindex) {
            nextplayer = rowindex < playerrows.length -1 ? rowindex + 1 : 0;
            if (playerrows[nextPlayer].isDead()) return getNextPlayer(nextplayer);
            return nextplayer;
        }
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