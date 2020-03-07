var consts = require('./consts.js');
var region = require('./region.js');

var canvas = document.getElementById('myriskcanvas'); 

var startx = 10;
var starty = 10;

var GameCanvas = {
    init: function() {

        for (row=0; row<consts.CONTINENT_ROWS;row++) {
            var canvas_row = [];
            for (col=0; col<consts.CONTINENT_COLUMNS;col++) {

                var regelem = region.getRegionElement(row, col);

                regelem.addEventListener("click", this.clickedbutton.bind(null, regelem));
                regelem.innerText="y";
        
                canvas.appendChild(regelem); 
            }
            canvas.appendChild(document.createElement("br"));
        }
    },
    clickedbutton: function(regelem, ev) {
        console.log("coords: "+regelem.nodeid);
        regelem.innerText="x";
    },
    updateregion: function(region) {
        var reg = document.getElementById(region.elementid);
        reg.innerText=region.troopcount;
    }
}


module.exports = GameCanvas;