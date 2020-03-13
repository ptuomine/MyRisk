var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');
var gamecontroller = require('./gamecontroller');
var playerstats = require('./playerstats.js');
var gamestate = require('./gamestate.js');
var deck = require('./carddeck.js');

window.resetGameBoard = function() {
    console.log("reset game2 board");

    gamestate.setGameState(gamestate.StartState);
    gameboard.reset();
    gameboard.startGame();
    playerstats.reset();
    playerstats.updateStats();
    deck.init();
}

window.startWar = function() {
    console.log("start war");
    gamestate.setGameState(gamestate.BattleState);
    gameboard.startWar();
}

window.goBattle = function() {
    console.log("go battle");
    gameboard.goBattle();
    playerstats.updateStats();
}

window.endTurn = function() {
    console.log("end turn");
    gamestate.setGameState(gamestate.StartState);
    gameboard.nextTurn();
    playerstats.updateStats();
}

// initialize game
gameplayers.init(); // initialize the game players
playerstats.init(); // initiaize the player statistics
gamecontroller.init(); // initiize the game controller
gamestate.init(); // initialize the game state
gameboard.init(); // build game board
deck.init();

gameboard.startGame();
playerstats.reset();
playerstats.updateStats();
