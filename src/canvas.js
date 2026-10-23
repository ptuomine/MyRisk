/**
 * Represents the game canvas where the game board is displayed.
 */
var continentsArea = document.getElementById('continentsArea'); 

var newgameel = document.getElementById("newgame");
var startwarel = document.getElementById("startwar");
var gobattleel = document.getElementById("gobattle");
var endturnel = document.getElementById("endturn");
var sellcardsel = document.getElementById("sellcards");
var fortifyel = document.getElementById("fortify");
var mapsvg = null;
var labellayer = null;

var GameCanvas = {

    /**
     * Adds a continent element to the game canvas.
     * @param {Object} continent - The continent object to be added.
     */
    addContinent: function(continent) {
        mapsvg.insertBefore(continent.element, labellayer);
    },

    /**
     * Returns the layer for region names, drawn above every continent.
     */
    getLabelLayer: function() {
        return labellayer;
    },

    /**
     * Creates the map picture: the sea and the dashed sea routes between continents.
     * Continents are added on top with addContinent.
     * @param {Object} map - The map data (see src/mapdata.js).
     */
    createMap: function(map) {
        var NS = "http://www.w3.org/2000/svg";
        mapsvg = document.createElementNS(NS, "svg");
        mapsvg.setAttribute("viewBox", "0 0 " + map.width + " " + map.height);
        mapsvg.setAttribute("class", "map-svg");
        mapsvg.setAttribute("role", "group");
        mapsvg.setAttribute("aria-label", "Game map");

        var sea = document.createElementNS(NS, "rect");
        sea.setAttribute("width", map.width);
        sea.setAttribute("height", map.height);
        sea.setAttribute("rx", 18);
        sea.setAttribute("class", "sea");
        mapsvg.appendChild(sea);

        var labels = {};
        map.continents.forEach(function(c) {
            c.regions.forEach(function(r) { labels[r.id] = r.label; });
        });
        map.seaRoutes.forEach(function(route) {
            var a = labels[route[0]], b = labels[route[1]];
            var line = document.createElementNS(NS, "line");
            line.setAttribute("x1", a[0]);
            line.setAttribute("y1", a[1]);
            line.setAttribute("x2", b[0]);
            line.setAttribute("y2", b[1]);
            line.setAttribute("class", "sea-route");
            mapsvg.appendChild(line);
        });

        labellayer = document.createElementNS(NS, "g");
        labellayer.setAttribute("class", "region-labels");
        mapsvg.appendChild(labellayer);

        continentsArea.innerHTML = "";
        continentsArea.appendChild(mapsvg);
    },

    /**
     * Resets the game canvas by disabling all action buttons.
     */
    reset: function() {
        startwarel.disabled = true;
        endturnel.disabled = true;
        gobattleel.disabled = true;
        sellcardsel.disabled = true;
        if (fortifyel) fortifyel.disabled = true;
    },

    /**
     * Enables or disables the "Move Troops" button.
     * @param {boolean} enable - Whether to enable or disable the button.
     */
    enablefortify: function(enable) {
        if (fortifyel) fortifyel.disabled = !enable;
    },

    /**
     * Enables or disables the "Start War" button.
     * @param {boolean} enable - Whether to enable or disable the button.
     */
    enablewar: function(enable) {
        startwarel.disabled = !enable;
    },

    /**
     * Enables or disables the "Go Battle" button.
     * @param {boolean} enable - Whether to enable or disable the button.
     */
    enablebattle: function(enable) {
        gobattleel.disabled = !enable;
    },

    /**
     * Enables or disables the "End Turn" button.
     * @param {boolean} enable - Whether to enable or disable the button.
     */
    enableendturn: function(enable) {
        endturnel.disabled = !enable;
    },

    /**
     * Enables or disables the "Sell Cards" button.
     * @param {boolean} enable - Whether to enable or disable the button.
     */
    enablesellcards: function(enable) {
        sellcardsel.disabled = !enable;
    }

}

module.exports = GameCanvas;
