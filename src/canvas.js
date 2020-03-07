var consts = require('./consts.js');
var region = require('./region.js');

var canvas = document.getElementById('myriskcanvas'); 

var startx = 10;
var starty = 10;

var GameCanvas = {
    addRegion: function(region) {
        var regelem = region.element;

        regelem.addEventListener("click", this.clickedbutton.bind(null, regelem));        
        canvas.appendChild(regelem); 
    },
    addNewLine: function() {
        canvas.appendChild(document.createElement("br"));
    },
    clickedbutton: function(regelem, ev) {
        console.log("coords: "+regelem.nodeid);
        regelem.innerText="x";
    }
}

module.exports = GameCanvas;