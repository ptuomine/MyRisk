(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./consts.js":2,"./region.js":5}],2:[function(require,module,exports){
var continent_columns = 5;
var continent_rows = 5;
var continent_width = 3;
var continent_height = 3;
var region_width = 50;
var region_height = 50;
var noplayer = "FREE"
var players = [ "p1", "p2 " ];
var exports = module.exports = {};

exports.CONTINENT_COLUMNS =  continent_columns;
exports.CONTINENT_ROWS =  continent_rows;
exports.CONTINENT_WIDTH =  continent_width;
exports.CONTINENT_HEIGHT =  continent_height;
exports.REGION_WIDTH =  region_width;
exports.REGION_HEIGHT =  region_height;
exports.PLAYERS = players;
exports.NOPLAYER = noplayer;
},{}],3:[function(require,module,exports){
var canvas = require('./canvas.js');
var consts = require('./consts.js');
var region = require('./region.js');
var continent_matrix = [];



var GameBoard = {
    init: function() {
        for (row=0; row<consts.CONTINENT_ROWS;row++) {
            var continent_row = [];
            for (col=0; col<consts.CONTINENT_COLUMNS;col++) {
                var regobj = region.getRegion(row,col);
                continent_row.push(regobj);
            canvas.updateregion(regobj);

            }
        }
    }
}

module.exports = GameBoard;
},{"./canvas.js":1,"./consts.js":2,"./region.js":5}],4:[function(require,module,exports){
var canvas = require('./canvas');
var gameboard = require('./gameboard.js');

function clickedbutton() {
    alert("yes");
}

canvas.init();
gameboard.init();
},{"./canvas":1,"./gameboard.js":3}],5:[function(require,module,exports){
var canvas = require ('./canvas');
var consts = require ('./consts.js');

var Region = {
    init: function() {

    },

    getRegionId: function (row, col) {
        return "region_"+row+"_"+col;
    },

    getRegion: function(row, col) {
        return {
            elementid: this.getRegionId(row,col),
            row: row,
            col: col,
            troopcount: 0,
            occupant: consts.NOPLAYER
        };
    },

    getRegionElement: function (row, col) {
        var reg = document.createElement("button");
        reg.id = this.getRegionId(row,col);
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
 
        return reg;
    }


};

module.exports = Region;
},{"./canvas":1,"./consts.js":2}]},{},[4]);
