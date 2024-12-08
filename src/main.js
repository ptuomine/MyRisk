var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');
var gamecontroller = require('./gamecontroller');
var playerstats = require('./playerstats.js');
var gamestate = require('./gamestate.js');
var deck = require('./carddeck.js');

/**
 * Resets the game board, initializes the game state, and starts a new game.
 */
window.resetGameBoard = function() {
    console.log("reset game2 board");

    gamestate.setGameState(gamestate.StartState);
    gameboard.reset();
    gameboard.startGame();
    playerstats.resetAndStartTurn();
    playerstats.updateStats();
    deck.init();
    gamecontroller.startAI();
}

/**
 * Starts the war phase of the game.
 */
window.startWar = function() {
    console.log("start war");
    gamestate.setGameState(gamestate.BattleState);
    gameboard.startWar();
}

/**
 * Executes the battle logic and updates player statistics.
 */
window.goBattle = function() {
    console.log("go battle");
    gameboard.goBattle();
    playerstats.updateStats();
}

/**
 * Ends the current player's turn and advances to the next turn.
 */
window.endTurn = function() {
    console.log("end turn");
    gamestate.setGameState(gamestate.StartState);
    gameboard.nextTurn();
    playerstats.updateStats();
}

/**
 * Sells the player's cards and updates player statistics.
 */
window.sellCards = function() {
    this.console.log("sell cards");
    playerstats.sellCards();
    playerstats.updateStats();
}

// initialize game
gameplayers.init(); // initialize the game players
playerstats.init(); // initiaize the player statistics
gamecontroller.init(); // initiize the game controller
gamestate.init(); // initialize the game state
gameboard.init(); // build game board
deck.init();

// Start the game
gameboard.startGame();
playerstats.resetAndStartTurn();
playerstats.updateStats();

gamecontroller.startAI();
