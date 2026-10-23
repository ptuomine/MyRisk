var canvas = require('./canvas.js');
var consts = require('./consts.js');
var continentFactory = require('./continent.js');
var regionFactory = require('./region.js');
var gamePlayers = require('./gameplayers.js');
var gamecontroller = require('./gamecontroller.js');
var util = require('./util.js');
var mapdata = require('./mapdata.js');

var regions = [];
//var continents = [];

var GameBoard = {
    /**
     * Initializes the game board by building continents and regions.
     */
    init: function () {

        this.reset();

        // Build the map from src/mapdata.js
        canvas.createMap(mapdata);
        mapdata.continents.forEach(function (contdata) {
            var contobj = continentFactory.createContinentInstance(contdata);
            contdata.regions.forEach(function (regiondata) {
                var regobj = regionFactory.getRegionInstance(regiondata, contobj);
                regions.push(regobj);
                contobj.addRegion(regobj);
            });
            canvas.addContinent(contobj);
        });
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
