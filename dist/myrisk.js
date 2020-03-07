(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
                var regobj = region.getRegionInstance(row,col);
                continent_row.push(regobj);
                canvas.addRegion(regobj);

                continent_matrix.push(regobj);
            }
            canvas.addNewLine();
        }
    },
    reset: function() {
        continent_matrix.forEach(reg=>reg.reset());

    }
}

module.exports = GameBoard;
},{"./canvas.js":1,"./consts.js":2,"./region.js":5}],4:[function(require,module,exports){
var canvas = require('./canvas');
var gameboard = require('./gameboard.js');

window.resetGameBoard = function() {
    console.log("reset game board");
    gameboard.reset();
}

gameboard.init();
},{"./canvas":1,"./gameboard.js":3}],5:[function(require,module,exports){
var canvas = require ('./canvas');
var consts = require ('./consts.js');

function region(row, col) {
    var elementid = "region_"+row+"_"+col;
    var row = row;
    var col= col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;
    var element = getRegionElement();

    function getRegionElement() {
        var reg = document.createElement("button");
        reg.id = elementid;
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
        reg.innerText = troopcount;
        reg.addEventListener("click", clickedbutton);  
 
        return reg;
    }

    function clickedbutton() {
        console.log("coords: "+elementid);
        troopcount++;
        element.innerText=troopcount;
    }

    this.element = element;

    this.updateTroopCount = function (count) {
        this.element.innerText=count;
    }

    this.reset = function() {
        this.updateTroopCount(0);
    }
}

var RegionFactory = {
    init: function() {

    },

    getRegionInstance: function(row, col) {
        return new region(row,col);
    }

};

module.exports = RegionFactory;
},{"./canvas":1,"./consts.js":2}]},{},[4]);
