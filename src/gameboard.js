var canvas = require('./canvas.js');
var continent_matrix = [];



var GameBoard = {
    init: function() {
        for (row=0; row<consts.CONTINENT_ROWS;row++) {
            var continent_row = [];
            for (col=0; col<consts.CONTINENT_COLUMNS;col++) {
                var region = {
                    row: row,
                    col: col,
                    troopcount: 0,
                    occupant: consts.NOPLAYER
                };
                continent_row.push(region);
            canvas.updateregion(region);

            }
        }
    }
}

module.exports = GameBoard;