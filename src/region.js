var canvas = require ('./canvas');
var consts = require ('./consts.js');

function region(row, col) {
    var elementid = "region_"+row+"_"+col;
    var row = row;
    var col= col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;

    function getRegionElement() {
        var reg = document.createElement("button");
        reg.id = elementid;
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
        reg.innerText = troopcount;
 
        return reg;
    }

    this.element = getRegionElement();

    this.updateTroopCount = function (count) {
        this.element.innerText=count;
    }
}

// region.prototype = {
//     updateTroopCount: function(count) {
//         this.element.innerText=count;
//     }
// }

var RegionFactory = {
    init: function() {

    },

    getRegionInstance: function(row, col) {
        return new region(row,col);
    }

};

module.exports = RegionFactory;