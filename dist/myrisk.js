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
    },
    addContinent: function(continent) {
        canvas.appendChild(continent.element);
    },
    addDivRow: function() {
        var divrow = document.createElement("div");
        divrow.classList.add("Row");
        canvas.appendChild(divrow);
    }

}

module.exports = GameCanvas;
},{"./consts.js":2,"./region.js":6}],2:[function(require,module,exports){
var continent_columns = 2;
var continent_rows = 2;
var continent_width = 2;
var continent_height = 2;
var region_width = 50;
var region_height = 50;
var noplayer = "FREE"
var players = [ "p1", "p2 " ];
var player_colors = ['#00af9d','#ffb652','#cd66cc','#66bc29','#0096db','#3a7dda','#ffe100'];

var exports = module.exports = {};

exports.CONTINENT_COLUMNS =  continent_columns;
exports.CONTINENT_ROWS =  continent_rows;
exports.CONTINENT_WIDTH =  continent_width;
exports.CONTINENT_HEIGHT =  continent_height;
exports.REGION_WIDTH =  region_width;
exports.REGION_HEIGHT =  region_height;
exports.PLAYERS = players;
exports.NOPLAYER = noplayer;
exports.PLAYER_COLORS = player_colors;
},{}],3:[function(require,module,exports){
var consts = require('./consts.js');

var Continent = function(row, col) {

    var row = row;
    var col = col;

    var cont_width = consts.CONTINENT_WIDTH*consts.REGION_WIDTH;
    var cont_height = consts.CONTINENT_HEIGHT*consts.REGION_HEIGHT;

    var owner = consts.NOPLAYER;

    function getContinentElement() {
        var cont = document.createElement("div");
        cont.id = "continent_" + row + "_" + col;
        cont.style.height = cont_height + "px";
        cont.style.width = cont_width + "px";
        cont.style.border="3px solid #d3d3d3";
        cont.style.color = "blue";
        cont.classList.add("Column");
 
        return cont;
    }

    this.element = getContinentElement();
}

var ContinentFactory = {

    getContinentInstance(row, col) {
        return new Continent(row, col);
    }

}

module.exports = ContinentFactory;
},{"./consts.js":2}],4:[function(require,module,exports){
var canvas = require('./canvas.js');
var consts = require('./consts.js');
var continentFactory = require('./continent.js');
var regionFactory = require('./region.js');

var regions = [];



var GameBoard = {
    init: function() {
        for (row=1; row<=consts.CONTINENT_ROWS;row++) {
            var continent_row = [];
            canvas.addDivRow();
            for (col=1; col<=consts.CONTINENT_COLUMNS;col++) {
                buildContinent(row, col);

                //buildContinentRow(row, col);
            }
            //canvas.addNewLine();
        }

        function buildContinent(cont_row, cont_col) 
        {
            var contobj = continentFactory.getContinentInstance(row, col);
            canvas.addContinent(contobj);
        }

        function buildContinentRow(cont_row, cont_col) {

            for (i=1; i<= consts.CONTINENT_WIDTH;i++) {

                var regionrow = cont_row;
                var regioncol = consts.CONTINENT_WIDTH*(cont_col-1)+i;

                var regobj = regionFactory.getRegionInstance(regionrow, regioncol, cont_row, cont_col);
                regions.push(regobj);
                canvas.addRegion(regobj);
            }
        }
    },
    reset: function() {
        regions.forEach(reg=>reg.reset());

    }
}

module.exports = GameBoard;
},{"./canvas.js":1,"./consts.js":2,"./continent.js":3,"./region.js":6}],5:[function(require,module,exports){
var canvas = require('./canvas');
var gameboard = require('./gameboard.js');

window.resetGameBoard = function() {
    console.log("reset game board");
    gameboard.reset();
}

gameboard.init();
},{"./canvas":1,"./gameboard.js":4}],6:[function(require,module,exports){
var canvas = require ('./canvas');
var consts = require ('./consts.js');

function region(row, col, continent_row, continent_col) {
    var elementid = "region_"+row+"_"+col;
    var row = row;
    var col= col;
    var continent_row = continent_row;
    var continent_col = continent_col;
    var troopcount = 0;
    var occupant = consts.NOPLAYER;
    var element = getRegionElement();

    function getRegionElement() {
        var reg = document.createElement("button");
        reg.id = elementid;
        reg.style.height = consts.REGION_HEIGHT + "px";
        reg.style.width = consts.REGION_WIDTH + "px";
        reg.style.color = "blue";
        reg.innerText = troopcount;
        reg.addEventListener("click", clickedbutton);  
 
        return reg;
    }

    function clickedbutton() {
        console.log("coords: "+elementid);
        console.log("row: " + continent_row + ";col: " + continent_col);
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

    getRegionInstance: function(row, col, cont_row, cont_col) {
        return new region(row, col, cont_row, cont_col);
    }

};

module.exports = RegionFactory;
},{"./canvas":1,"./consts.js":2}]},{},[5]);
