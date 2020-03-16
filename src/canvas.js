var continentsArea = document.getElementById('continentsArea'); 

var newgameel = document.getElementById("newgame");
var startwarel = document.getElementById("startwar");
var gobattleel = document.getElementById("gobattle");
var endturnel = document.getElementById("endturn");
var sellcardsel = document.getElementById("sellcards");

var GameCanvas = {

    addContinent: function(continent) {
        continentsArea.appendChild(continent.element);
    },
    addDivRow: function() {
        var divrow = document.createElement("div");
        divrow.classList.add("Row");
        continentsArea.appendChild(divrow);
    },
    reset: function() {
        startwarel.disabled = true;
        endturnel.disabled = true;
        gobattleel.disabled = true;
        sellcardsel.disabled = true;
    },
    enablewar: function(enable) {
        startwarel.disabled = !enable;
    },
    enablebattle: function(enable) {
        gobattleel.disabled = !enable;
    },
    enableendturn: function(enable) {
        endturnel.disabled = !enable;
    },
    enablesellcards: function(enable) {
        sellcardsel.disabled = !enable;
    }

}

module.exports = GameCanvas;