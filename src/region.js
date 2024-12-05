var canvas = require('./canvas');
var consts = require('./consts.js');
var gamestate = require('./gamestate.js');
var playerstats = require('./playerstats.js');
var gamecontroller = require('./gamecontroller.js');

function region(row, col, contobj) {
    var elementid = "region_" + row + "_" + col;
    var row = row;
    var col = col;
    var continent = contobj;
    var troopcount = 0;
    var occupant = null;
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

    this.addTroops = function() {

        if (!occupant.reduceDraft()) return false; // no troops to reduce, so do nothing

        troopcount++;
        element.innerText = troopcount;
        playerstats.updateStats();
        return true;
    }

    function selectregion() {
        self.toggleSelection();
        gamecontroller.setSelectedRegion(self);
    }

    function clickedbutton() {
        console.log("coords: " + elementid);
        console.log("row: " + continent.getRow() + ";col: " + continent.getColumn());

        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                self.addTroops();
                break;
            }
            case gamestate.BattleState: {
                selectregion();
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
    }

    this.getPlayer = function() {
        return occupant;
    }

    this.isSame = function(region) {
        return elementid == region.id;
    }

    this.getContinent = function() {
        return continent;
    }

    this.getRow = function() {
        return row;
    }

    this.getColumn = function() {
        return col;
    }

    this.canAttack = function(region) {

        var attackX = this.getRow();
        var attackY = this.getColumn();
        var defendX = region.getRow();
        var defendY = region.getColumn();
        
        var can = defendX <= attackX + 1 && defendX >= attackX - 1;
        can = can && defendY <= attackY + 1 && defendY >= attackY - 1;
        return can;
    }

    function checkcards(permutation) {

        // array of valid sets found
        var setsfound = [];

        // current set
        var setofthree = permutation.slice(0, 3);

        // all different
        if (util.isAllUnique(setofthree.map(s => s.id))) {
            setsfound.push(setofthree);
        } else
            // all same
            if (setofthree.every(c => c.id === setofthree[0].id)) {
                setsfound.push(setofthree);
            }
        // check next three (if exists)
        if (permutation.length > 3) {
            var moresets = checkcards(permutation.slice(1, permutation.length));
            setsfound = setsfound.concat(moresets);
        }
        return setsfound; // no valid set found
    }
}

var RegionFactory = {
    getRegionInstance: function (row, col, contobj) {
        gamecontroller = gamecontroller;
        var instance = new region(row, col, contobj);
        instance.init();
        return instance;
    }

};

module.exports = RegionFactory;
