var canvas = require('./canvas');
var consts = require('./consts.js');
var gamestate = require('./gamestate.js');
var playerstats = require('./playerstats.js');
var gamecontroller = require('./gamecontroller.js');

/**
 * Represents a region in the game.
 * @constructor
 * @param {number} row - The row number of the region.
 * @param {number} col - The column number of the region.
 * @param {Object} contobj - The continent object to which the region belongs.
 */
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

    /**
     * Creates and returns the HTML element representing the region.
     * @returns {HTMLElement} The region element.
     */
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

    /**
     * Adds troops to the region.
     * @returns {boolean} True if troops were added, otherwise false.
     */
    this.addTroops = function() {

        if (!occupant.reduceDraft()) return false; // no troops to reduce, so do nothing

        troopcount++;
        element.innerText = troopcount;
        playerstats.updateStats();
        return true;
    }

    /**
     * Selects the region and updates the game controller.
     */
    function selectregion() {
        self.toggleSelection();
        gamecontroller.setSelectedRegion(self);
    }

    /**
     * Handles the click event on the region button.
     */
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

    this.getId = function() {
        return this.id;
    }

    /**
     * Initializes the region by resetting its state.
     */
    this.init = function() {
        this.reset();
    }

    /**
     * Checks if the region is selected.
     * @returns {boolean} True if the region is selected, otherwise false.
     */
    this.isSelected = function() {
        return selected;
    }

    /**
     * Toggles the selection state of the region.
     */
    this.toggleSelection = function() {

        selected = !selected;
        this.setSelection(selected);
    }

    /**
     * Sets the selection state of the region.
     * @param {boolean} selection - The selection state to be set.
     */
    this.setSelection = function(selection) {
        selected = selection;
        if (selected) {
            element.style.border = "2px solid black";
        } else {
            element.style.border = "2px solid " + occupant.getColor();
        }
    } 

    /**
     * Updates the region's appearance based on the current game state.
     */
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

    /**
     * Returns the current troop count in the region.
     * @returns {number} The current troop count.
     */
    this.getTroopCount = function () {
        return troopcount;
    }

    /**
     * Sets the troop count in the region.
     * @param {number} count - The troop count to be set.
     */
    this.setTroopCount = function (count) {
        troopcount = count;
        this.element.innerText = count;
    }

    /**
     * Increases the troop count in the region by one.
     */
    this.increaseTroopCount = function () {
        this.setTroopCount(troopcount + 1);
    }

    /**
     * Decreases the troop count in the region by the specified count.
     * @param {number} count - The number of troops to be decreased.
     */
    this.decreaseTroopCount = function (count) {
        this.setTroopCount(troopcount - count);
    }

    /**
     * Resets the region by setting the troop count to zero and updating the game state.
     */
    this.reset = function () {
        this.setTroopCount(0);
        this.gameStateChange(gamestate.StartState);
    }

    /**
     * Sets the player occupying the region.
     * @param {Object} player - The player to be set as the occupant.
     */
    this.setPlayer = function (player) {
        occupant = player;
        this.element.style.backgroundColor = occupant.getColor();
    }

    /**
     * Returns the player occupying the region.
     * @returns {Object} The player occupying the region.
     */
    this.getPlayer = function() {
        return occupant;
    }

    /**
     * Checks if the given region is the same as the current region.
     * @param {Object} region - The region to compare.
     * @returns {boolean} True if the regions are the same, otherwise false.
     */
    this.isSame = function(region) {
        return elementid == region.id;
    }

    /**
     * Returns the continent to which the region belongs.
     * @returns {Object} The continent object.
     */
    this.getContinent = function() {
        return continent;
    }

    /**
     * Returns the row number of the region.
     * @returns {number} The row number of the region.
     */
    this.getRow = function() {
        return row;
    }

    /**
     * Returns the column number of the region.
     * @returns {number} The column number of the region.
     */
    this.getColumn = function() {
        return col;
    }

    /**
     * Checks if the region can attack the given region.
     * @param {Object} region - The region to be attacked.
     * @returns {boolean} True if the region can attack, otherwise false.
     */
    this.canAttack = function(region) {

        var attackX = this.getRow();
        var attackY = this.getColumn();
        var defendX = region.getRow();
        var defendY = region.getColumn();
        
        var can = defendX <= attackX + 1 && defendX >= attackX - 1;
        can = can && defendY <= attackY + 1 && defendY >= attackY - 1;
        return can;
    }

    /**
     * Returns the adjacent regions of the current region in the current continent.
     * @returns {Array} An array of adjacent regions.
     */
    this.getAdjacentRegionsInContinent = function() {
        const regionRow = this.getRow();
        const regionCol = this.getColumn();
        const allRegions = continent.getRegions();

        return allRegions.filter(r => {
            const rowDiff = Math.abs(r.getRow() - regionRow);
            const colDiff = Math.abs(r.getColumn() - regionCol);

            return (rowDiff <= 1 && colDiff <= 1) && r !== this;
        });
    }

    /**
     * Checks if the region has adjacent opponent regions.
     * @returns {boolean} True if the region has adjacent opponent regions, otherwise false.
     */
    this.hasAdjacentOpponentRegions = function() {
        const adjacentRegions = this.getAdjacentRegionsInContinent();
        return adjacentRegions.some(adjRegion => adjRegion.getPlayer() !== this.getPlayer());
    }
}

/**
 * Factory object to create instances of regions.
 */
var RegionFactory = {
    /**
     * Creates and returns a new instance of a region.
     * @param {number} row - The row number of the region.
     * @param {number} col - The column number of the region.
     * @param {Object} contobj - The continent object to which the region belongs.
     * @returns {region} A new region instance.
     */
    getRegionInstance: function (row, col, contobj) {
        gamecontroller = gamecontroller;
        var instance = new region(row, col, contobj);
        instance.init();
        return instance;
    }

};

module.exports = RegionFactory;
