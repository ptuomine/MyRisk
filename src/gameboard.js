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

        // First assign one troop to each region
        var players = gamePlayers.getAllPlayers();
        util.shuffleArray(regions);
        regions.forEach(function(region, index) {
            var player = players[index%players.length]; 
            region.setPlayer(player);
            region.addTroops();
            player.addRegion(region);
        });

        if (continents.some(c=>c.checkContinentOwner() != consts.NOPLAYER)) {
            // none of the continents should be owned in the beginning
            players.forEach(p=>p.reset());
            regions.forEach(r=>r.reset());
            this.startGame(); 
        }

        // Second assign rest of the player troops to its regions
        players.forEach(p=>p.AssignTroopsToRegions());


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