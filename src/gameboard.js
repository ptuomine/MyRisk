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

    }
}

module.exports = GameBoard;