var canvas = require ('./canvas');
var consts = require ('./consts.js');

function region(row, col, continent_row, continent_col) {
    var elementid = "region_"+row+"_"+col;
    var row = row;
    var col= col;
    var continent_row = continent_row;
    var continent_col = continent_col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;
    var element = getRegionElement();

    function getRegionElement() {
        var reg = document.createElement("button");
        reg.id = elementid;
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
        reg.style.color = "blue";
        reg.innerText = troopcount;
        reg.addEventListener("click", clickedbutton);  
 
        return reg;
    }

    function clickedbutton() {
        console.log("coords: "+elementid);
        console.log("row: " + continent_row + ";col: " + continent_col);
        troopcount++;
        element.innerText=troopcount;
    }

    this.element = element;

    this.updateTroopCount = function (count) {
        troopcount = count;
        this.element.innerText=count;
    }

    this.increaseTroopCount = function() {
        this.updateTroopCount(troopcount + 1);
    }

    this.reset = function() {
        this.updateTroopCount(0);
    }

    this.setPlayer = function(player) {
        occupant = player;
        this.element.style.backgroundColor = occupant.color;
        this.updateTroopCount(1);
    }
}

var RegionFactory = {
    init: function() {

    },

    getRegionInstance: function(row, col, cont_row, cont_col) {
        return new region(row, col, cont_row, cont_col);
    }

};

module.exports = RegionFactory;