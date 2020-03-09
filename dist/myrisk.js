(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var consts = require('./consts');

var Battle = {

    go: function(regionAttack, regionDefense) {

        var defendingtroops = regionDefense.getTroopCount();
        var attackingtroops = regionAttack.getTroopCount() - 1;
        var defendleft = defendingtroops - attackingtroops; // defending troops left after attack
        var attackleft = Math.abs(defendleft);

        regionAttack.setTroopCount(1); // Allways one left in the attacking square

        if (defendleft < 0) {
            // attack successful
            var attackingplayer = regionAttack.getPlayer();
            var defendingplayer = regionDefense.getPlayer();
            regionDefense.setPlayer(attackingplayer);
            regionDefense.setTroopCount(attackleft);
            attackingplayer.addRegion(regionDefense);
            defendingplayer.removeRegion(regionDefense);

            // Check continent
            var continent = regionDefense.getContinent();
            continent.checkContinentOwner();

            return true;
        } else {
            // attack failed
            regionDefense.setTroopCount(defendleft);
            return false;
        }
    }

}

module.exports = Battle;
},{"./consts":3}],2:[function(require,module,exports){
var consts = require('./consts.js');
var region = require('./region.js');

var continentsArea = document.getElementById('continentsArea'); 

var startx = 10;
var starty = 10;

var GameCanvas = {

    addContinent: function(continent) {
        continentsArea.appendChild(continent.element);
    },
    addDivRow: function() {
        var divrow = document.createElement("div");
        divrow.classList.add("Row");
        continentsArea.appendChild(divrow);
    }

}

module.exports = GameCanvas;
},{"./consts.js":3,"./region.js":12}],3:[function(require,module,exports){
var continent_columns = 2;
var continent_rows = 2;
var continent_width = 2;
var continent_height = 2;
var region_width = 50;
var region_height = 50;
var noplayer = "FREE"
var players = [ "p1", "p2" ];
var player_count = 3;
var player_colors = ['#00af9d','#ffb652','#cd66cc','#66bc29','#0096db','#3a7dda','#ffe100'];

var total_regions = continent_columns * continent_width * continent_rows * continent_height;
var total_troops_each = total_regions * 1.25;

var gamestats = ["player", "continents", "regions", "troops", "drafts", "cards"];

var exports = module.exports = {};

exports.CONTINENT_COLUMNS =  continent_columns;
exports.CONTINENT_ROWS =  continent_rows;
exports.CONTINENT_WIDTH =  continent_width;
exports.CONTINENT_HEIGHT =  continent_height;
exports.REGION_WIDTH =  region_width;
exports.REGION_HEIGHT =  region_height;
exports.PLAYERS = players;
exports.NOPLAYER = noplayer;
exports.PLAYER_COLORS = player_colors;
exports.TOTAL_TROOPS_EACH = total_troops_each;
exports.PLAYER_COUNT = player_count;
exports.GAMESTATS_HEADINGS = gamestats;
},{}],4:[function(require,module,exports){
var consts = require('./consts.js');

var Continent = function (row, col) {

    var row = row;
    var col = col;

    var cont_width = consts.CONTINENT_WIDTH * consts.REGION_WIDTH;
    var cont_height = consts.CONTINENT_HEIGHT * consts.REGION_HEIGHT;

    var owner = consts.NOPLAYER;

    var regions = [];

    function getContinentElement() {
        var cont = document.createElement("div");
        cont.id = "continent_" + row + "_" + col;
        cont.style.height = cont_height + "px";
        cont.style.width = cont_width + "px";
        cont.style.border = "3px solid #d3d3d3";
        cont.style.color = "blue";
        cont.classList.add("Column");

        return cont;
    }

    function getOldOwner() {

        return owner;
    }

    function getNewOwner() {

        if (regions.every(r => r.getPlayer() == regions[0].getPlayer())) {
            // if all regions have the same occupant then return that one
            owner = regions[0].getPlayer();
            return owner
        }
        return consts.NOPLAYER;;
    }

    this.element = getContinentElement();

    this.getId = function () {
        return row + "_" + col;
    }

    this.addRegion = function (region) {
        this.element.appendChild(region.element);
        regions.push(region);
    }

    this.addNewLine = function () {
        this.element.appendChild(document.createElement("br"));
    }

    this.getColumn = function () {
        return col;
    }

    this.getRow = function () {
        return row;
    }

    this.getContinentPoints = function () {
        return regions.length / 2;
    }

    this.checkContinentOwner = function () {

        var oldOwner = getOldOwner();
        var newOwner = getNewOwner();
        if (oldOwner != consts.NOPLAYER) {
            oldOwner.removeContinent(this);
        }
        if (newOwner != consts.NOPLAYER) {
            newOwner.addContinent(this);
        }

        owner = newOwner;

        return owner;
    }
}

var ContinentFactory = {

    getContinentInstance(row, col) {
        return new Continent(row, col);
    }

}

module.exports = ContinentFactory;
},{"./consts.js":3}],5:[function(require,module,exports){
var canvas = require('./canvas.js');
var consts = require('./consts.js');
var continentFactory = require('./continent.js');
var regionFactory = require('./region.js');
var gamePlayers = require('./gameplayers.js');
var gamecontroller = require('./gamecontroller.js');
var util = require('./util.js');

var regions = [];
var continents = [];

var GameBoard = {
    init: function () {

        this.reset();

        // Build game board
        for (row = 1; row <= consts.CONTINENT_ROWS; row++) {
            canvas.addDivRow();
            for (col = 1; col <= consts.CONTINENT_COLUMNS; col++) {
                var continent = buildContinent(row, col);
                continents.push(continent);
            }
        }

        function buildContinent(cont_row, cont_col) {
            var contobj = continentFactory.getContinentInstance(row, col);
            buildRegions(row, col, contobj);
            canvas.addContinent(contobj);
            return contobj;
        }

        function buildRegions(cont_row, cont_col, contobj) {

            for (i = 1; i <= consts.CONTINENT_WIDTH; i++) {
                for (j = 1; j <= consts.CONTINENT_HEIGHT; j++) {

                    var regionrow = consts.CONTINENT_HEIGHT * (cont_row - 1) + i;
                    var regioncol = consts.CONTINENT_WIDTH * (cont_col - 1) + j;

                    var regobj = regionFactory.getRegionInstance(regionrow, regioncol, contobj);
                    regions.push(regobj);
                    contobj.addRegion(regobj);
                }
                contobj.addNewLine();
            }
        }
    },
    startGame: function() {


        // setup the random game board
        var players = gamePlayers.getAllPlayers();
        util.shuffleArray(regions);
        regions.forEach(function(region, index) {
            var player = players[index%players.length]; 
            region.setPlayer(player);
            region.addTroops();
            player.addRegion(region);
        });

        if (continents.some(c=>c.checkContinentOwner() != consts.NOPLAYER)) {
            players.forEach(p=>p.reset());
            regions.forEach(r=>r.reset());
            this.startGame(); // none of the continents should be owned 
        }
    },
    reset: function () {
        regions.forEach(reg => reg.reset());
        gamePlayers.reset();
        gamecontroller.reset();

    },
    startWar: function() {
        regions.forEach(reg=>reg.gameStateChange());
    },
    goBattle: function() {
        gamecontroller.goBattle();
    },
    nextTurn: function() {
        this.startWar();
        gamecontroller.nextTurn();
    }
}

module.exports = GameBoard;
},{"./canvas.js":2,"./consts.js":3,"./continent.js":4,"./gamecontroller.js":6,"./gameplayers.js":7,"./region.js":12,"./util.js":13}],6:[function(require,module,exports){
var battle = require('./battle.js');
var playerstats = require('./playerstats.js');

var attackerSelection;
var defenderSelection;
var playerInTurn;

var GameController = {

    init: function () {
        this.reset();
    },
    reset: function() {
        playerInTurn = playerstats.getFirstPlayer();
        attackerSelection = null;
        defenderSelection = null;
    },
    nextTurn: function() {
        playerInTurn = playerstats.nextPlayer(); // change the player in turn
        playerInTurn.startTurn();

        attackerSelection = null;
        defenderSelection = null;
    },
    getPlayerInTurn: function() {
        return playerInTurn;
    },
    setSelectedRegion: function(region) {

        if (!region.isSelected()) {
            // Selected false, i.e. deselection
            if (region.getPlayer().isSame(this.getPlayerInTurn())) {
                attackerSelection = null;
            } else {
                defenderSelection = null;
            }
            return;
        }
        // Selected = true
        if (region.getPlayer().isSame(this.getPlayerInTurn())) {
            // Set the attacker
            if (attackerSelection) attackerSelection.setSelection(false); // deselect if already selected
            attackerSelection = region;
        } else if (attackerSelection){
            // Attacker already set. Set defender
            if (!attackerSelection.canAttack(region)) {
                // selection not legal
                region.setSelection(false); 
                return;
            }
            if (defenderSelection) defenderSelection.setSelection(false); // deselect if already selected
            defenderSelection = region;
        } else {
            // Attacker not yet set. Cannot set defender yet.
            region.setSelection(false);
        }
    },
    goBattle: function() {
        if (!attackerSelection || !defenderSelection) {
            alert('not everything selected!');
            return;
        }
        var win = battle.go(attackerSelection, defenderSelection);
        if (win) {
            // Defender region will become selected as attacker. Defender has to be selected next
            attackerSelection.setSelection(false);
            attackerSelection = defenderSelection;
            defenderSelection = null;
        } else {
            // nothing selected
            attackerSelection.setSelection(false);
            defenderSelection.setSelection(false);
            attackerSelection = null;
            defenderSelection = null;
        }
    }
}

module.exports = GameController;
},{"./battle.js":1,"./playerstats.js":11}],7:[function(require,module,exports){
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
},{"./consts.js":3,"./player":10}],8:[function(require,module,exports){

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
},{}],9:[function(require,module,exports){
var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');
var gamecontroller = require('./gamecontroller');
var playerstats = require('./playerstats.js');
var gamestate = require('./gamestate.js');

window.resetGameBoard = function() {
    console.log("reset game board");

    gamestate.setGameState(gamestate.StartState);
    gameboard.reset();
    gameboard.startGame();
    playerstats.reset();
    playerstats.updateStats();
}

window.startWar = function() {
    console.log("start war");
    gamestate.setGameState(gamestate.BattleState);
    gameboard.startWar();
}

window.goBattle = function() {
    console.log("go battle");
    gameboard.goBattle();
    playerstats.updateStats();
}

window.endTurn = function() {
    console.log("end turn");
    gamestate.setGameState(gamestate.StartState);
    gameboard.nextTurn();
    playerstats.updateStats();
}

// initialize game
gameplayers.init(); // initialize the game players
playerstats.init(); // initiaize the player statistics
gamecontroller.init(); // initiize the game controller
gamestate.init(); // initialize the game state
gameboard.init(); // build game board

gameboard.startGame();
playerstats.reset();
playerstats.updateStats();

},{"./gameboard.js":5,"./gamecontroller":6,"./gameplayers":7,"./gamestate.js":8,"./playerstats.js":11}],10:[function(require,module,exports){
var consts = require('./consts.js');

function player(id, name, color) {
    var id = id;
    var name = name;
    var color = color;
    var state = {};

    this.reset = function() {
        state.regions = [];
        state.continents = [];
        state.getTroopCount = function() {
            return state.regions.reduce((a,b) => a+b.getTroopCount(), 0);
        };
        state.cards = 0;
        state.draft = consts.TOTAL_TROOPS_EACH;
    }

    this.addRegion = function(region) {
        state.regions.push(region);
        state.troops = state.troops + region.getTroopCount();
    }

    this.removeRegion = function(region) {
        state.regions = state.regions.filter(reg=>!reg.isSame(region));
    }

    this.addContinent = function(continent) {
        state.continents.push(continent);
    }

    this.removeContinent = function(continent) {
        state.continents = state.continents.filter(c=>continent.getId() != c.getId());
    }

    this.getName = function() {
        return name;
    }

    this.getColor = function() {
        return color;
    }

    this.getState = function() {
        return state;
    }

    this.setDraft = function(count) {
        state.draft = count;
    }

    this.isSame = function(p) {
        return p.getName() == this.getName();
    }

    this.isDead = function() {
        return state.regions.length == 0;
    }

    this.reduceDraft = function() {
        
        if (state.draft == 0) return false; // cannot reduce
        state.draft--;
        return true;

    }

    this.startTurn = function() {

        // Set the draft count
        var regionpoints = state.regions.length < 3 ? state.regions.length / 3 : 3;
        var continentpoints = state.continents.reduce((a,b) => a + b.getContinentPoints(), 0);
        state.draft += regionpoints + continentpoints;
    }
}

var consts = require('./consts.js');
var colors = consts.PLAYER_COLORS;
var playerid = 0;

var PlayerFactory = {
    getPlayerInstance: function() {
        
        if (playerid > colors.length - 1) return null; // no more colors left

        var color = colors[playerid];
        playerid++;
        var newplayer = new player(playerid, "player"+playerid, color);
        newplayer.reset();
        return newplayer;

    }
}

module.exports = PlayerFactory;
},{"./consts.js":3}],11:[function(require,module,exports){
var consts = require('./consts.js');
var gameplayers = require('./gameplayers');
var currentplayer = 0;

var gamestats = [];

var playerrows = [];
var players = gameplayers.getAllPlayers();

var PlayerStats = {
    init: function () {

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

            // drafts
            var draftcol = document.createElement("td");
            playerrow.appendChild(draftcol);

            // cards
            var cardcol = document.createElement("td");
            playerrow.appendChild(cardcol);

            // gamestats
            gamestats.push({
                player: player,
                contcol: contcol,
                regcol: regcol,
                troopcol: troopcol,
                draftcol: draftcol,
                cardcol: cardcol
            })

        })
    },
    reset: function () {
        playerrows[currentplayer].classList.remove("activeplayer");
        currentplayer = 0;
        playerrows[currentplayer].classList.add("activeplayer");
        playerrows[currentplayer].playerobj.startTurn();

    },
    updateStats: function () {

        gamestats.forEach(stat => {
            stat.contcol.innerText = stat.player.getState().continents.length;
            stat.regcol.innerText = stat.player.getState().regions.length;
            stat.troopcol.innerText = stat.player.getState().getTroopCount();
            stat.draftcol.innerText = stat.player.getState().draft;
            stat.cardcol.innerText = stat.player.getState().cards;
        })

    },
    nextPlayer: function () {
        var nextplayer = getNextPlayer(currentplayer);
        if (currentplayer == nextplayer) {
            // game over. currentplayer has won
            alert("GAME OVER: " + playerrows[currentplayer].playerobj.getName() + " has won");
            return null;
        } else {
            playerrows[currentplayer].classList.remove("activeplayer");
            playerrows[nextplayer].classList.add("activeplayer");
            currentplayer = nextplayer;
            return playerrows[nextplayer].playerobj;
        }

        function getNextPlayer(rowindex) {
            nextplayer = rowindex < playerrows.length - 1 ? rowindex + 1 : 0;
            if (playerrows[nextplayer].playerobj.isDead()) return getNextPlayer(nextplayer);
            return nextplayer;
        }
    },
    getFirstPlayer: function () {
        return playerrows[0].playerobj;
    }
}

module.exports = PlayerStats;
},{"./consts.js":3,"./gameplayers":7}],12:[function(require,module,exports){
var canvas = require('./canvas');
var consts = require('./consts.js');
var gamestate = require('./gamestate.js');
var playerstats = require('./playerstats.js');
var gamecontroller = require('./gamecontroller.js');

function region(row, col, contobj) {
    var elementid = "region_" + row + "_" + col;
    var row = row;
    var col = col;
    var continent = contobj;
    var troopcount = 0;
    var occupant = null;
    var element = getRegionElement();
    var selected = false;
    var self = this;

    function getRegionElement() {
        var reg = document.createElement("button");
        reg.id = elementid;
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
        reg.style.color = "blue";
        reg.innerText = troopcount;
        reg.addEventListener("click", clickedbutton);

        return reg;
    }

    this.addTroops = function() {

        if (!occupant.reduceDraft()) return; // no troops to add, so do nothing

        troopcount++;
        element.innerText = troopcount;
        playerstats.updateStats();
    }

    function selectregion() {
        self.toggleSelection();
        gamecontroller.setSelectedRegion(self);
    }

    function clickedbutton() {
        console.log("coords: " + elementid);
        console.log("row: " + continent.getRow() + ";col: " + continent.getColumn());

        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                self.addTroops();
                break;
            }
            case gamestate.BattleState: {
                selectregion();
                break;
            }
        }
    }

    this.element = element;

    this.id = elementid;

    this.init = function() {
        this.reset();
    }

    this.isSelected = function() {
        return selected;
    }

    this.toggleSelection = function() {

        selected = !selected;
        this.setSelection(selected);
    }

    this.setSelection = function(selection) {
        selected = selection;
        if (selected) {
            element.style.border = "2px solid black";
        } else {
            element.style.border = "2px solid " + occupant.getColor();
        }
    } 

    this.gameStateChange = function() {
        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                element.style.border = "";
                break;
            }
            case gamestate.BattleState: {
                element.style.border = "2px solid " + occupant.getColor();
                break;
            }
        }
    }

    this.getTroopCount = function () {
        return troopcount;
    }

    this.setTroopCount = function (count) {
        troopcount = count;
        this.element.innerText = count;
    }

    this.increaseTroopCount = function () {
        this.setTroopCount(troopcount + 1);
    }

    this.decreaseTroopCount = function (count) {
        this.setTroopCount(troopcount - count);
    }

    this.reset = function () {
        this.setTroopCount(0);
        this.gameStateChange(gamestate.StartState);
    }

    this.setPlayer = function (player) {
        occupant = player;
        this.element.style.backgroundColor = occupant.getColor();
    }

    this.getPlayer = function() {
        return occupant;
    }

    this.isSame = function(region) {
        return elementid == region.id;
    }

    this.getContinent = function() {
        return continent;
    }

    this.getRow = function() {
        return row;
    }

    this.getColumn = function() {
        return col;
    }

    this.canAttack = function(region) {

        var attackX = this.getRow();
        var attackY = this.getColumn();
        var defendX = region.getRow();
        var defendY = region.getColumn();
        
        var can = defendX <= attackX + 1 && defendX >= attackX - 1;
        can = can && defendY <= attackY + 1 && defendY >= attackY - 1;
        return can;
    }
}

var RegionFactory = {
    getRegionInstance: function (row, col, contobj) {
        gamecontroller = gamecontroller;
        var instance = new region(row, col, contobj);
        instance.init();
        return instance;
    }

};

module.exports = RegionFactory;
},{"./canvas":2,"./consts.js":3,"./gamecontroller.js":6,"./gamestate.js":8,"./playerstats.js":11}],13:[function(require,module,exports){
var Util = {
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

module.exports = Util;
},{}]},{},[9]);
