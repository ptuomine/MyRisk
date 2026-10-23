var gameboard = require('./gameboard.js');
var gameplayers = require('./gameplayers');
var gamecontroller = require('./gamecontroller');
var playerstats = require('./playerstats.js');
var gamestate = require('./gamestate.js');
var deck = require('./carddeck.js');
var AIPlayerFactory = require('./aiplayer.js');
var turnpanel = require('./turnpanel.js');

var AI_STEP_MS = 500; // pause between computer moves so they are easy to follow
var MAX_LOG = 40;

/**
 * The computer level chosen on the page: "easy", "normal" or "hard".
 * Remembered in this browser between visits.
 */
function getLevel() {
    var select = document.getElementById("difficulty");
    return select ? select.value : "normal";
}

(function rememberLevel() {
    var select = document.getElementById("difficulty");
    if (!select) return;
    try {
        var saved = localStorage.getItem("myrisk-level");
        if (saved && AIPlayerFactory.LEVELS[saved]) select.value = saved;
    } catch (e) { /* storage unavailable: use the default */ }
    select.addEventListener("change", function() {
        try { localStorage.setItem("myrisk-level", select.value); } catch (e) { /* ignore */ }
        turnpanel.update();
    });
})();

var gameToken = 0;    // changes on New Game, cancelling any computer turn in progress
var aiRunning = false;

/**
 * Resets the game board, initializes the game state, and starts a new game.
 */
window.resetGameBoard = function() {
    gameToken++;
    aiRunning = false;
    clearAILog();
    gameplayers.refreshAIFlags();

    gamestate.setGameState(gamestate.StartState);
    gameboard.reset();
    gameboard.startGame();
    playerstats.resetAndStartTurn();
    playerstats.updateStats();
    deck.init();

    logReinforcements();
    runAITurnIfNeeded();
}

/**
 * Starts the war phase of the game.
 */
window.startWar = function() {
    if (aiRunning) return;
    gamestate.setGameState(gamestate.BattleState);
    gameboard.startWar();
    playerstats.updateStats();
}

/**
 * Executes the battle logic and updates player statistics.
 */
window.goBattle = function() {
    if (aiRunning) return;
    gameboard.goBattle();
    logElimination(gamecontroller.getPlayerInTurn());
    playerstats.updateStats();
}

/**
 * Logs a knock-out and the cards taken, once.
 */
function logElimination(player) {
    var e = player && player.getState().lastElimination;
    if (!e) return;
    player.getState().lastElimination = null;
    logAIMove(player.getName() + " knocked out " + e.loser + " and took " + e.cards + " " + (e.cards === 1 ? "card" : "cards"));
}

/**
 * Starts the move phase: the player can move troops between their own neighbouring regions.
 * No more attacks this turn.
 */
window.moveTroops = function() {
    if (aiRunning) return;
    gamestate.setGameState(gamestate.FortifyState);
    gamecontroller.startMovePhase();
    gameboard.startWar(); // refreshes region borders for the new phase
    playerstats.updateStats();
}

/**
 * Ends the current player's turn and advances to the next turn.
 */
window.endTurn = function() {
    if (aiRunning) return;
    advanceTurn();
}

/**
 * Sells the player's cards and updates player statistics.
 */
window.sellCards = function() {
    if (aiRunning) return;
    // Allowed in the Draft step, or mid-attack right after knocking a player out
    var player = gamecontroller.getPlayerInTurn();
    if (!player || !player.canTradeNow()) return;
    var trade = player.getBestTrade();
    logAIMove(player.getName() + " traded " + trade.cards.map(function(c) { return c.name; }).join(", ") + " for " + trade.troops + " troops");
    playerstats.sellCards();

    if (gamestate.getGameState() !== gamestate.StartState) {
        // Mid-attack: go back to placing troops; tapping Attack afterwards continues the attack
        gamestate.setGameState(gamestate.StartState);
        gamecontroller.clearSelections();
        gameboard.startWar(); // refreshes region borders for the new phase
    }
    playerstats.updateStats();
}

function advanceTurn() {
    gamestate.setGameState(gamestate.StartState);
    gameboard.nextTurn();
    playerstats.updateStats();
    if (gameplayers.getAlivePlayers().length > 1) logReinforcements();
    runAITurnIfNeeded();
}

/**
 * Logs where the player in turn got their new troops, e.g.
 * "player1 gets 7 troops: 4 for 8 regions + 3 for Nordhavn".
 */
function logReinforcements() {
    var player = gamecontroller.getPlayerInTurn();
    if (!player) return;
    var r = player.getReinforcements();
    var parts = [r.regionTroops + " for " + r.regions + " regions"];
    r.continents.forEach(function(c) { parts.push(c.bonus + " for " + c.name); });
    logAIMove(player.getName() + " gets " + r.total + " troops: " + parts.join(" + "));
}

/**
 * If the player in turn is computer-controlled, plays its turn and then ends it.
 * Chains on to the next computer player until it is a person's turn or the game is over.
 */
function runAITurnIfNeeded() {
    var player = gamecontroller.getPlayerInTurn();
    var gameOver = gameplayers.getAlivePlayers().length <= 1;
    var aiTurn = !!(player && player.isAI && !gameOver);
    document.body.classList.toggle("ai-turn", aiTurn);
    turnpanel.update();
    if (!aiTurn) return;

    aiRunning = true;
    var token = gameToken;
    var isCancelled = function() { return token !== gameToken; };

    AIPlayerFactory.GetAIPlayerInstance(player, getLevel()).playTurn({
        stepMs: AI_STEP_MS,
        delay: function(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); },
        isCancelled: isCancelled,
        onChange: function() { playerstats.updateStats(); },
        log: logAIMove
    }).catch(function(err) {
        console.error(err);
    }).then(function() {
        if (isCancelled()) return;
        aiRunning = false;
        advanceTurn();
    });
}

function logAIMove(text) {
    var list = document.getElementById("aiMoveList");
    if (!list) return;
    var item = document.createElement("li");
    item.innerText = text;
    list.insertBefore(item, list.firstChild); // newest first
    while (list.children.length > MAX_LOG) list.removeChild(list.lastChild);
}

function clearAILog() {
    var list = document.getElementById("aiMoveList");
    if (list) list.innerHTML = "";
}

// Ticking or unticking an "AI Player" box takes effect straight away
[1, 2, 3].forEach(function(i) {
    var box = document.getElementById("aiPlayer" + i);
    if (!box) return;
    box.addEventListener("change", function() {
        gameplayers.refreshAIFlags();
        if (!aiRunning) runAITurnIfNeeded();
    });
});

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
logReinforcements();
runAITurnIfNeeded();
