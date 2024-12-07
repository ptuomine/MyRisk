/**
 * Represents the game canvas where the game board is displayed.
 */
var continentsArea = document.getElementById('continentsArea'); 

var newgameel = document.getElementById("newgame");
var startwarel = document.getElementById("startwar");
var gobattleel = document.getElementById("gobattle");
var endturnel = document.getElementById("endturn");
var sellcardsel = document.getElementById("sellcards");

var GameCanvas = {

    /**
     * Adds a continent element to the game canvas.
     * @param {Object} continent - The continent object to be added.
     */
    addContinent: function(continent) {
        continentsArea.appendChild(continent.element);
    },

    /**
     * Adds a new row div element to the game canvas.
     */
    addDivRow: function() {
        var divrow = document.createElement("div");
        divrow.classList.add("Row");
        continentsArea.appendChild(divrow);
    },

    /**
     * Resets the game canvas by disabling all action buttons.
     */
    reset: function() {
        startwarel.disabled = true;
        endturnel.disabled = true;
        gobattleel.disabled = true;
        sellcardsel.disabled = true;
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
