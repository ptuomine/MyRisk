var consts = require('./consts.js');
var region = require('./region.js');

var continentsArea = document.getElementById('continentsArea'); 

var startx = 10;
var starty = 10;

var GameCanvas = {

    addContinent: function(continent) {
        continentsArea.appendChild(continent.element);
    },
    addDivRow: function() {
        var divrow = document.createElement("div");
        divrow.classList.add("Row");
        continentsArea.appendChild(divrow);
    }

}

module.exports = GameCanvas;