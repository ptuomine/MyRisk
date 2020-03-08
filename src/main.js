var canvas = require('./canvas');
var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');
var gamestate = require('./gamestate.js');

window.resetGameBoard = function() {
    console.log("reset game board");
    gameboard.reset();
    gameboard.startGame();
}

gameboard.init();
gameplayers.init();
gameboard.startGame();
gamestate.createGameStats();
