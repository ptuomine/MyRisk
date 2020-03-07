var consts = require('./consts.js');

var canvas = document.getElementById('myriskcanvas'); 

var startx = 10;
var starty = 10;

var GameCanvas = {
    init: function() {

        for (row=0; row<consts.CONTINENT_ROWS;row++) {
            var canvas_row = [];
            for (col=0; col<consts.CONTINENT_COLUMNS;col++) {
                var region = document.createElement("button");
                region.id = "region_"+row + "_" + col;
                region.style.height = consts.REGION_HEIGHT + "px";
                region.style.width = consts.REGION_WIDTH + "px";
                region.addEventListener("click", this.clickedbutton.bind(null, region.id));
                region.innerText="y";

                canvas.appendChild(region); 
            }
            canvas.appendChild(document.createElement("br"));
        }
    },
    clickedbutton: function(nodeid, ev) {
        console.log("coords: "+nodeid);
        var reg = document.getElementById(nodeid);
        reg.innerText="x";

    }
}


module.exports = GameCanvas;