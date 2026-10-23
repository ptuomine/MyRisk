var consts = require('./consts.js');

var SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Represents a continent in the game.
 * @constructor
 * @param {Object} data - The continent's map data: id, name, bonus, outline, label.
 */
var Continent = function (data) {

    var owner = consts.NOPLAYER;

    var regions = [];

    var regionLayer;
    var labelText;

    /**
     * Creates the SVG group for the continent: its coastline, its regions and its name.
     * @returns {SVGElement} The continent element.
     */
    function getContinentElement() {
        var g = document.createElementNS(SVG_NS, "g");
        g.setAttribute("id", "continent-" + data.id);
        g.setAttribute("class", "continent");

        var coast = document.createElementNS(SVG_NS, "path");
        coast.setAttribute("d", data.outline);
        coast.setAttribute("class", "coast");
        g.appendChild(coast);

        regionLayer = document.createElementNS(SVG_NS, "g");
        g.appendChild(regionLayer);

        var coastline = document.createElementNS(SVG_NS, "path");
        coastline.setAttribute("d", data.outline);
        coastline.setAttribute("class", "coastline");
        g.appendChild(coastline);

        labelText = document.createElementNS(SVG_NS, "text");
        labelText.setAttribute("x", data.label[0]);
        labelText.setAttribute("y", data.label[1]);
        labelText.setAttribute("class", "continent-name");
        labelText.textContent = data.name + "  +" + data.bonus;
        g.appendChild(labelText);

        return g;
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

    this.element = getContinentElement();

    /**
     * Returns the ID of the continent.
     * @returns {string} The ID of the continent.
     */
    this.getId = function () {
        return data.id;
    }

    /**
     * Returns the name of the continent, e.g. "Nordhavn".
     */
    this.getName = function () {
        return data.name;
    }

    /**
     * Adds a region to the continent.
     * @param {Object} region - The region to be added.
     */
    this.addRegion = function (region) {
        regionLayer.appendChild(region.element);
        regions.push(region);
    }


    /**
     * Returns the points awarded for owning the continent.
     * @returns {number} The points awarded for owning the continent.
     */
    this.getContinentPoints = function () {
        return data.bonus;
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
     * @param {Object} data - The continent's map data.
     * @returns {Continent} A new continent instance.
     */
    createContinentInstance(data) {
        var newContinent = new Continent(data);
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
