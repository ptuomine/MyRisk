var canvas = require ('./canvas');
var consts = require ('./consts.js');

var Region = {
    init: function() {

    },

    getRegionId: function (row, col) {
        return "region_"+row+"_"+col;
    },

    getRegion: function(row, col) {
        return {
            elementid: this.getRegionId(row,col),
            row: row,
            col: col,
            troopcount: 0,
            occupant: consts.NOPLAYER
        };
    },

    getRegionElement: function (row, col) {
        var reg = document.createElement("button");
        reg.id = this.getRegionId(row,col);
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
 
        return reg;
    }


};

module.exports = Region;