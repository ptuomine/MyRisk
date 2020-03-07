var canvas = require('./canvas.js');
var consts = require('./consts.js');
var region = require('./region.js');
var continent_matrix = [];



var GameBoard = {
    init: function() {
        for (row=0; row<consts.CONTINENT_ROWS;row++) {
            var continent_row = [];
            for (col=0; col<consts.CONTINENT_COLUMNS;col++) {
                var regobj = region.getRegionInstance(row,col);
                continent_row.push(regobj);
                regobj.updateTroopCount(1);

                canvas.addRegion(regobj);
            }
            canvas.addNewLine();
        }
    }
}

module.exports = GameBoard;