var consts = require('./consts.js');

/**
 * Represents a continent in the game.
 * @constructor
 * @param {number} row - The row number of the continent.
 * @param {number} col - The column number of the continent.
 */
var Continent = function (row, col) {

    var row = row;
    var col = col;

    var cont_width = consts.CONTINENT_WIDTH * consts.REGION_WIDTH;
    var cont_height = consts.CONTINENT_HEIGHT * consts.REGION_HEIGHT;

    var owner = consts.NOPLAYER;

    var regions = [];

    /**
     * Creates and returns the HTML element representing the continent.
     * @returns {HTMLElement} The continent element.
     */
    function getContinentElement() {
        var cont = document.createElement("div");
        cont.id = "continent_" + row + "_" + col;
        cont.style.height = cont_height + "px";
        cont.style.width = cont_width + "px";
        cont.style.border = "3px solid #d3d3d3";
        cont.style.color = "blue";
        cont.classList.add("Column");

        return cont;
    }

    /**
     * Returns the current owner of the continent.
     * @returns {Object} The current owner of the continent.
     */
    function getOldOwner() {
        return owner;
    }

    /**
     * Determines and returns the new owner of the continent based on the regions' occupants.
     * @returns {Object} The new owner of the continent.
     */
    function getNewOwner() {
        if (regions.every(r => r.getPlayer() == regions[0].getPlayer())) {
            // if all regions have the same occupant then return that one
            owner = regions[0].getPlayer();
            return owner
        }
        return consts.NOPLAYER;
    }

    this.getRegions = function() {
        return regions;
    }

    this.getPlayerRegions = function(player) {
        const playerRegionsInThisContinent = regions.filter(region => region.getPlayer().getId() === player.getId());
        return playerRegionsInThisContinent;
    }

    this.getPlayerBorderRegions = function(player) {
        const playerRegions = this.getPlayerRegions(player);
        return playerRegions.filter(region => region.hasAdjacentOpponentRegions());
    }

    this.element = getContinentElement();

    /**
     * Returns the ID of the continent.
     * @returns {string} The ID of the continent.
     */
    this.getId = function () {
        return row + "_" + col;
    }

    /**
     * Adds a region to the continent.
     * @param {Object} region - The region to be added.
     */
    this.addRegion = function (region) {
        this.element.appendChild(region.element);
        regions.push(region);
    }

    /**
     * Adds a new line break to the continent element.
     */
    this.addNewLine = function () {
        this.element.appendChild(document.createElement("br"));
    }

    /**
     * Returns the column number of the continent.
     * @returns {number} The column number of the continent.
     */
    this.getColumn = function () {
        return col;
    }

    /**
     * Returns the row number of the continent.
     * @returns {number} The row number of the continent.
     */
    this.getRow = function () {
        return row;
    }

    /**
     * Returns the points awarded for owning the continent.
     * @returns {number} The points awarded for owning the continent.
     */
    this.getContinentPoints = function () {
        return Math.floor(regions.length / 2);
    }

    /**
     * Checks and updates the owner of the continent based on the regions' occupants.
     * @returns {Object} The new owner of the continent.
     */
    this.checkContinentOwner = function () {
        var oldOwner = getOldOwner();
        var newOwner = getNewOwner();
        if (oldOwner != consts.NOPLAYER) {
            oldOwner.removeContinent(this);
        }
        if (newOwner != consts.NOPLAYER) {
            newOwner.addContinent(this);
        }

        owner = newOwner;

        return owner;
    }
}

var continents = [];

/**
 * Factory object to create instances of continents.
 */
var ContinentFactory = {

    /**
     * Creates and returns a new instance of a continent.
     * @param {number} row - The row number of the continent.
     * @param {number} col - The column number of the continent.
     * @returns {Continent} A new continent instance.
     */
    createContinentInstance(row, col) {
        var newContinent = new Continent(row, col);
        continents.push(newContinent);
        return newContinent;
    },

    getAllContinents() {
        return continents;
    },

    clearContinents() {
        continents = [];
    },

    getContinentInstanceById(id) {
        var found = null;
        continents.forEach(function(continent, index) {
            if (continent.getId() == id) {
                found = continent;
            }
        });
        return found;
    }
}

module.exports = ContinentFactory;
