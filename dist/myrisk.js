(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./consts.js":2,"./region.js":8}],2:[function(require,module,exports){
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
var total_troops_each = total_regions * 2;

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
},{}],3:[function(require,module,exports){
var consts = require('./consts.js');

var Continent = function(row, col) {

    var row = row;
    var col = col;

    var cont_width = consts.CONTINENT_WIDTH*consts.REGION_WIDTH;
    var cont_height = consts.CONTINENT_HEIGHT*consts.REGION_HEIGHT;

    var owner = consts.NOPLAYER;

    function getContinentElement() {
        var cont = document.createElement("div");
        cont.id = "continent_" + row + "_" + col;
        cont.style.height = cont_height + "px";
        cont.style.width = cont_width + "px";
        cont.style.border="3px solid #d3d3d3";
        cont.style.color = "blue";
        cont.classList.add("Column");
 
        return cont;
    }

    this.element = getContinentElement();

    this.addRegion = function(region) {
        this.element.appendChild(region.element); 
    }

    this.addNewLine = function() {
        this.element.appendChild(document.createElement("br"));
    }
}

var ContinentFactory = {

    getContinentInstance(row, col) {
        return new Continent(row, col);
    }

}

module.exports = ContinentFactory;
},{"./consts.js":2}],4:[function(require,module,exports){
var canvas = require('./canvas.js');
var consts = require('./consts.js');
var continentFactory = require('./continent.js');
var regionFactory = require('./region.js');
var gamePlayers = require('./gameplayers.js');

var regions = [];

var GameBoard = {
    init: function () {

        // Build game board
        for (row = 1; row <= consts.CONTINENT_ROWS; row++) {
            canvas.addDivRow();
            for (col = 1; col <= consts.CONTINENT_COLUMNS; col++) {
                buildContinent(row, col);
            }
        }

        function buildContinent(cont_row, cont_col) {
            var contobj = continentFactory.getContinentInstance(row, col);
            buildRegions(row, col, contobj);
            canvas.addContinent(contobj);
        }

        function buildRegions(cont_row, cont_col, contobj) {

            for (i = 1; i <= consts.CONTINENT_WIDTH; i++) {
                for (j = 1; j <= consts.CONTINENT_HEIGHT; j++) {

                    var regionrow = consts.CONTINENT_HEIGHT * (cont_row - 1) + i;
                    var regioncol = consts.CONTINENT_WIDTH * (cont_col - 1) + j;

                    var regobj = regionFactory.getRegionInstance(regionrow, regioncol, cont_row, cont_col);
                    regions.push(regobj);
                    contobj.addRegion(regobj);
                }
                contobj.addNewLine();
            }
        }
    },
    startGame: function() {

        regions.forEach(region=>{

            var player = gamePlayers.getRandomPlayer();
            region.setPlayer(player);

        })
    },
    reset: function () {
        regions.forEach(reg => reg.reset());
        gamePlayers.reset();

    }
}

module.exports = GameBoard;
},{"./canvas.js":1,"./consts.js":2,"./continent.js":3,"./gameplayers.js":5,"./region.js":8}],5:[function(require,module,exports){
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
},{"./consts.js":2,"./player":7}],6:[function(require,module,exports){
var canvas = require('./canvas');
var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');

window.resetGameBoard = function() {
    console.log("reset game board");
    gameboard.reset();
    gameboard.startGame();
}

gameboard.init();
gameplayers.init();
gameboard.startGame();
},{"./canvas":1,"./gameboard.js":4,"./gameplayers":5}],7:[function(require,module,exports){
var emptystate = {
    regions: [],
    continents: [],
    troops: 0,
    cards: 0
};

function player(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.state = emptystate;

    this.reset = function() {
        this.state = emptystate;
    }

    this.addRegion = function(region) {
        regions.push(region);
    }

    this.addContinent = function(continent) {
        continents.push(continent);
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
        return newplayer;

    }
}

module.exports = PlayerFactory;
},{"./consts.js":2}],8:[function(require,module,exports){
var canvas = require ('./canvas');
var consts = require ('./consts.js');

function region(row, col, continent_row, continent_col) {
    var elementid = "region_"+row+"_"+col;
    var row = row;
    var col= col;
    var continent_row = continent_row;
    var continent_col = continent_col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;
    var element = getRegionElement();

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

    function clickedbutton() {
        console.log("coords: "+elementid);
        console.log("row: " + continent_row + ";col: " + continent_col);
        troopcount++;
        element.innerText=troopcount;
    }

    this.element = element;

    this.updateTroopCount = function (count) {
        troopcount = count;
        this.element.innerText=count;
    }

    this.increaseTroopCount = function() {
        this.updateTroopCount(troopcount + 1);
    }

    this.reset = function() {
        this.updateTroopCount(0);
    }

    this.setPlayer = function(player) {
        occupant = player;
        this.element.style.backgroundColor = occupant.color;
        this.updateTroopCount(1);
    }
}

var RegionFactory = {
    init: function() {

    },

    getRegionInstance: function(row, col, cont_row, cont_col) {
        return new region(row, col, cont_row, cont_col);
    }

};

module.exports = RegionFactory;
},{"./canvas":1,"./consts.js":2}]},{},[6]);
