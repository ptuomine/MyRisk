var canvas = require('./canvas');
var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');
var gamestate = require('./gamestate.js');

window.resetGameBoard = function() {
    console.log("reset game board");

    gamestate.setGameState(gamestate.StartState);
    gameboard.reset();
    gameboard.startGame();
}

window.startBattle = function() {
    console.log("start game");
    gamestate.setGameState(gamestate.BattleState);
    gameboard.startBattle();
}

// initialize game
gameboard.init();
gameplayers.init();
gamestate.init();

gameboard.startGame();
gamestate.updateGameStats();
