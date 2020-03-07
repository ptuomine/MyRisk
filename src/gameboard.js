var canvas = require('./canvas.js');
var consts = require('./consts.js');
var region = require('./region.js');

var regions = [];



var GameBoard = {
    init: function() {
        for (row=1; row<=consts.CONTINENT_ROWS;row++) {
            var continent_row = [];
            for (col=1; col<=consts.CONTINENT_COLUMNS;col++) {

                buildContinentRow(row, col);
            }
            canvas.addNewLine();
        }

        function buildContinentRow(cont_row, cont_col) {

            for (i=1; i<= consts.CONTINENT_WIDTH;i++) {

                var regionrow = cont_row;
                var regioncol = consts.CONTINENT_WIDTH*(cont_col-1)+i;

                var regobj = region.getRegionInstance(regionrow, regioncol, cont_row, cont_col);
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