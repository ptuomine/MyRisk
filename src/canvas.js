var consts = require('./consts.js');
var region = require('./region.js');

var canvas = document.getElementById('myriskcanvas'); 

var startx = 10;
var starty = 10;

var GameCanvas = {
    addRegion: function(region) {
      
        canvas.appendChild(region.element); 
    },
    addNewLine: function() {
        canvas.appendChild(document.createElement("br"));
    }
}

module.exports = GameCanvas;