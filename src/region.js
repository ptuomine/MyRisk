var canvas = require('./canvas');
var consts = require('./consts.js');
var gamestate = require('./gamestate.js');
var playerstats = require('./playerstats.js');
var gamecontroller = require('./gamecontroller.js');

function region(row, col, continent_row, continent_col) {
    var elementid = "region_" + row + "_" + col;
    var row = row;
    var col = col;
    var continent_row = continent_row;
    var continent_col = continent_col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;
    var element = getRegionElement();
    var selected = false;
    var self = this;

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
        console.log("coords: " + elementid);
        console.log("row: " + continent_row + ";col: " + continent_col);

        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                troopcount++;
                element.innerText = troopcount;
                playerstats.updateStats();

                break;
            }
            case gamestate.BattleState: {
                self.toggleSelection();
                gamecontroller.setSelectedRegion(self);
                break;
            }
        }
    }

    this.element = element;

    this.id = elementid;

    this.init = function() {
        this.reset();
    }

    this.isSelected = function() {
        return selected;
    }

    this.toggleSelection = function() {

        selected = !selected;
        this.setSelection(selected);
    }

    this.setSelection = function(selection) {
        selected = selection;
        if (selected) {
            element.style.border = "2px solid black";
        } else {
            element.style.border = "2px solid " + occupant.getColor();
        }
    } 

    this.gameStateChange = function() {
        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                element.style.border = "";
                break;
            }
            case gamestate.BattleState: {
                element.style.border = "2px solid " + occupant.getColor();
                break;
            }
        }
    }

    this.getTroopCount = function () {
        return troopcount;
    }

    this.setTroopCount = function (count) {
        troopcount = count;
        this.element.innerText = count;
    }

    this.increaseTroopCount = function () {
        this.setTroopCount(troopcount + 1);
    }

    this.decreaseTroopCount = function (count) {
        this.setTroopCount(troopcount - count);
    }

    this.reset = function () {
        this.setTroopCount(0);
        this.gameStateChange(gamestate.StartState);
    }

    this.setPlayer = function (player) {
        occupant = player;
        this.element.style.backgroundColor = occupant.getColor();
        this.setTroopCount(1);
    }

    this.getPlayer = function() {
        return occupant;
    }

    this.isSame = function(region) {
        return elementid == region.id;
    }
}

var RegionFactory = {
    getRegionInstance: function (row, col, cont_row, cont_col) {
        gamecontroller = gamecontroller;
        var instance = new region(row, col, cont_row, cont_col);
        instance.init();
        return instance;
    }

};

module.exports = RegionFactory;