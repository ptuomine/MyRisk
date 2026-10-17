var canvas = require('./canvas.js');
var gamestate = require('./gamestate.js');
var playerstats = require('./playerstats.js');
var gamecontroller = require('./gamecontroller.js');

var SVG_NS = "http://www.w3.org/2000/svg";

var regionsById = {};

/**
 * Represents a region (territory) on the map.
 * @constructor
 * @param {Object} data - The region's map data: id, name, path, label, neighbours.
 * @param {Object} contobj - The continent object to which the region belongs.
 */
function region(data, contobj) {
    var elementid = data.id;
    var continent = contobj;
    var troopcount = 0;
    var occupant = null;
    var selected = false;
    var self = this;

    var shape, badge, countText;
    var element = getRegionElement();

    /**
     * Creates the SVG group for the region: its shape, a troop badge and its name.
     * @returns {SVGElement} The region element.
     */
    function getRegionElement() {
        var g = document.createElementNS(SVG_NS, "g");
        g.setAttribute("id", elementid);
        g.setAttribute("class", "region");
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", data.name);

        shape = document.createElementNS(SVG_NS, "path");
        shape.setAttribute("d", data.path);
        shape.setAttribute("class", "region-shape");
        g.appendChild(shape);

        var x = data.label[0], y = data.label[1];

        var name = document.createElementNS(SVG_NS, "text");
        name.setAttribute("x", x);
        name.setAttribute("y", y + 50);
        name.setAttribute("class", "region-name");
        name.textContent = data.name;
        canvas.getLabelLayer().appendChild(name); // names sit above the whole map so none are covered

        badge = document.createElementNS(SVG_NS, "circle");
        badge.setAttribute("cx", x);
        badge.setAttribute("cy", y);
        badge.setAttribute("r", 28);
        badge.setAttribute("class", "region-badge");
        g.appendChild(badge);

        countText = document.createElementNS(SVG_NS, "text");
        countText.setAttribute("x", x);
        countText.setAttribute("y", y);
        countText.setAttribute("class", "region-count");
        countText.textContent = troopcount;
        g.appendChild(countText);

        var title = document.createElementNS(SVG_NS, "title");
        title.textContent = data.name + " (" + continent.getName() + ")";
        g.appendChild(title);

        g.addEventListener("click", clickedbutton);
        g.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickedbutton(); }
        });
        return g;
    }

    /**
     * Adds troops to the region.
     * @returns {boolean} True if troops were added, otherwise false.
     */
    this.addTroops = function() {

        if (!occupant.reduceDraft()) return false; // no troops to reduce, so do nothing

        this.setTroopCount(troopcount + 1);
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
     * Handles a click or tap on the region.
     */
    function clickedbutton() {
        switch (gamestate.getGameState()) {
            case gamestate.StartState: {
                self.addTroops();
                break;
            }
            case gamestate.BattleState: {
                selectregion();
                break;
            }
            case gamestate.FortifyState: {
                gamecontroller.moveTroopClick(self);
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
     * Returns the region's name, e.g. "Frostgate".
     */
    this.getName = function() {
        return data.name;
    }

    /**
     * Returns the regions this region borders, by land or by sea route.
     */
    this.getNeighbours = function() {
        return data.neighbours.map(function (id) { return regionsById[id]; });
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
        this.setSelection(!selected);
    }

    /**
     * Sets the selection state of the region.
     * @param {boolean} selection - The selection state to be set.
     */
    this.setSelection = function(selection) {
        selected = selection;
        element.classList.toggle("selected", selected);
        if (selected && element.parentNode) {
            element.parentNode.appendChild(element); // draw on top so the outline shows fully
        }
    }

    /**
     * Marks the region as a possible target for the selected region.
     * @param {boolean} on
     */
    this.setTarget = function(on) {
        element.classList.toggle("target", !!on);
    }

    /**
     * Updates the region's appearance when the game phase changes.
     */
    this.gameStateChange = function() {
        if (gamestate.getGameState() === gamestate.StartState) {
            this.setSelection(false);
            this.setTarget(false);
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
        countText.textContent = count;
    }

    /**
     * Moves troops from this region to another region. At least one troop always stays behind.
     * @param {Object} target - The region receiving the troops.
     * @param {number} count - How many troops to move.
     * @returns {number} The number of troops actually moved.
     */
    this.moveTroopsTo = function (target, count) {
        var moved = Math.max(0, Math.min(count, troopcount - 1));
        if (moved === 0) return 0;
        this.setTroopCount(troopcount - moved);
        target.setTroopCount(target.getTroopCount() + moved);
        return moved;
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
     * Resets the region by setting the troop count to zero and clearing highlights.
     */
    this.reset = function () {
        this.setTroopCount(0);
        this.setSelection(false);
        this.setTarget(false);
    }

    /**
     * Sets the player occupying the region.
     * @param {Object} player - The player to be set as the occupant.
     */
    this.setPlayer = function (player) {
        occupant = player;
        shape.style.fill = occupant.getColor();
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
     * Checks if the region borders the given region (by land or sea route),
     * which is what attacking and moving troops require.
     * @param {Object} region - The other region.
     * @returns {boolean} True if they border each other.
     */
    this.canAttack = function(region) {
        return data.neighbours.indexOf(region.id) !== -1;
    }
}

/**
 * Factory object to create instances of regions.
 */
var RegionFactory = {
    /**
     * Creates and returns a new instance of a region.
     * @param {Object} data - The region's map data.
     * @param {Object} contobj - The continent object to which the region belongs.
     * @returns {region} A new region instance.
     */
    getRegionInstance: function (data, contobj) {
        var instance = new region(data, contobj);
        instance.init();
        regionsById[data.id] = instance;
        return instance;
    },

    getRegionById: function (id) {
        return regionsById[id];
    }

};

module.exports = RegionFactory;
