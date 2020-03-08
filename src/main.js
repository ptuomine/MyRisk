var canvas = require('./canvas');
var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');

window.resetGameBoard = function() {
    console.log("reset game board");
    gameboard.reset();
    gameboard.startGame();
}

gameboard.init();
gameplayers.init();
gameboard.startGame();