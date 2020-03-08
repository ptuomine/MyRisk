var canvas = require('./canvas');
var consts = require('./consts.js');
var gamestate = require('./gamestate.js');

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

    function toggleSelected() {

        selected = !selected;
        if (selected) {
            element.style.border = "2px solid black";
        } else {
            element.style.border = "2px solid " + occupant.getColor();
        }
    }
    function clickedbutton() {
        console.log("coords: " + elementid);
        console.log("row: " + continent_row + ";col: " + continent_col);

        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                troopcount++;
                element.innerText = troopcount;
                gamestate.updateGameStats();

                break;
            }
            case gamestate.BattleState: {
                toggleSelected();
                break;
            }
        }
    }

    this.element = element;

    this.init = function() {
        this.reset();
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

    this.updateTroopCount = function (count) {
        troopcount = count;
        this.element.innerText = count;
    }

    this.increaseTroopCount = function () {
        this.updateTroopCount(troopcount + 1);
    }

    this.reset = function () {
        this.updateTroopCount(0);
        this.gameStateChange(gamestate.StartState);
    }

    this.setPlayer = function (player) {
        occupant = player;
        this.element.style.backgroundColor = occupant.getColor();
        this.updateTroopCount(1);
    }

    this.getTroopCount = function () {
        return troopcount;
    }
}

var RegionFactory = {
    getRegionInstance: function (row, col, cont_row, cont_col) {
        var instance = new region(row, col, cont_row, cont_col);
        instance.init();
        return instance;
    }

};

module.exports = RegionFactory;