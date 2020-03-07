var canvas = require ('./canvas');
var consts = require ('./consts.js');

function region(row, col) {
    var elementid = "region_"+row+"_"+col;
    var row = row;
    var col= col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;
    var element = getRegionElement();

    function getRegionElement() {
        var reg = document.createElement("button");
        reg.id = elementid;
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
        reg.innerText = troopcount;
        reg.addEventListener("click", clickedbutton);  
 
        return reg;
    }

    function clickedbutton() {
        console.log("coords: "+elementid);
        troopcount++;
        element.innerText=troopcount;
    }

    this.element = element;

    this.updateTroopCount = function (count) {
        this.element.innerText=count;
    }

    this.reset = function() {
        this.updateTroopCount(0);
    }
}

var RegionFactory = {
    init: function() {

    },

    getRegionInstance: function(row, col) {
        return new region(row,col);
    }

};

module.exports = RegionFactory;