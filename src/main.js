var canvas = require('./canvas');
var gameboard = require('./gameboard.js');

window.resetGameBoard = function() {
    console.log("reset game board");
    gameboard.reset();
}

gameboard.init();