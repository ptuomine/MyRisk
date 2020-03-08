var canvas = require('./canvas.js');
var consts = require('./consts.js');
var continentFactory = require('./continent.js');
var regionFactory = require('./region.js');

var regions = [];



var GameBoard = {
    init: function() {
        for (row=1; row<=consts.CONTINENT_ROWS;row++) {
            var continent_row = [];
            canvas.addDivRow();
            for (col=1; col<=consts.CONTINENT_COLUMNS;col++) {
                buildContinent(row, col);

                //buildContinentRow(row, col);
            }
            //canvas.addNewLine();
        }

        function buildContinent(cont_row, cont_col) 
        {
            var contobj = continentFactory.getContinentInstance(row, col);
            canvas.addContinent(contobj);
        }

        function buildContinentRow(cont_row, cont_col) {

            for (i=1; i<= consts.CONTINENT_WIDTH;i++) {

                var regionrow = cont_row;
                var regioncol = consts.CONTINENT_WIDTH*(cont_col-1)+i;

                var regobj = regionFactory.getRegionInstance(regionrow, regioncol, cont_row, cont_col);
                regions.push(regobj);
                canvas.addRegion(regobj);
            }
        }
    },
    reset: function() {
        regions.forEach(reg=>reg.reset());

    }
}

module.exports = GameBoard;