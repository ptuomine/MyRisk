var canvas = require('./canvas.js');
var consts = require('./consts.js');
var continentFactory = require('./continent.js');
var regionFactory = require('./region.js');
var gamePlayers = require('./gameplayers.js');
var gamecontroller = require('./gamecontroller.js');
var util = require('./util.js');

var regions = [];
//var continents = [];

var GameBoard = {
    /**
     * Initializes the game board by building continents and regions.
     */
    init: function () {

        this.reset();

        // Build game board
        for (var row = 1; row <= consts.CONTINENT_ROWS; row++) {
            canvas.addDivRow();
            for (var col = 1; col <= consts.CONTINENT_COLUMNS; col++) {
                var continent = buildContinent(row, col);
//                continents.push(continent);
            }
        }

        /**
         * Builds a continent and its regions, and adds it to the game board.
         * @param {number} cont_row - The row number of the continent.
         * @param {number} cont_col - The column number of the continent.
         * @returns {Object} The built continent object.
         */
        function buildContinent(cont_row, cont_col) {
            var contobj = continentFactory.createContinentInstance(row, col);
            buildRegions(row, col, contobj);
            canvas.addContinent(contobj);
            return contobj;
        }

        /**
         * Builds regions for a given continent and adds them to the continent object.
         * @param {number} cont_row - The row number of the continent.
         * @param {number} cont_col - The column number of the continent.
         * @param {Object} contobj - The continent object to which the regions will be added.
         */
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
    /**
     * Starts the game by setting up the initial game board and assigning troops to regions.
     */
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

        if (continentFactory.getAllContinents().some(c=>c.checkContinentOwner() != consts.NOPLAYER)) {
            // none of the continents should be owned in the beginning
            players.forEach(p=>p.reset());
            regions.forEach(r=>r.reset());
            this.startGame(); 
        }

        // Second assign rest of the player troops to its regions
        players.forEach(p=>p.AssignTroopsToRegions());

        // Check if the first player is an AI player and trigger AI moves
        // if (players[0].isAI) {
        //     this.handleAITurn(players[0]);
        // }
    },
    /**
     * Resets the game board by clearing regions, resetting players, and resetting the game controller.
     */
    reset: function () {
        canvas.reset();
        regions.forEach(reg => reg.reset());
        gamePlayers.reset();
        gamecontroller.reset();

    },
    /**
     * Starts the war phase of the game by enabling war mode and updating the game state.
     */
    startWar: function() {
        canvas.enablewar(false);
        regions.forEach(reg=>reg.gameStateChange());
    },
    /**
     * Executes the battle logic by calling the game controller's goBattle method.
     */
    goBattle: function() {
        gamecontroller.goBattle();
    },
    /**
     * Advances to the next turn by starting the war phase and updating the game controller.
     */
    nextTurn: function() {
        this.startWar();
        gamecontroller.nextTurn();
    }
}

module.exports = GameBoard;
