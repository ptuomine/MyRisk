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
                canvas.addRegion(regobj);

                continent_matrix.push(regobj);
            }
            canvas.addNewLine();
        }
    },
    reset: function() {
        continent_matrix.forEach(reg=>reg.reset());

    }
}

module.exports = GameBoard;