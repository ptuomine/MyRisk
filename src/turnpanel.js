/*
 * The turn panel: whose turn it is, which phase the turn is in, and a hint
 * saying what to do next. It reads the game state and redraws itself; call
 * update() after anything changes.
 *
 * Modules are required inside update() because this panel is updated from
 * modules that the game controller itself depends on.
 */

function el(id) {
    return document.getElementById(id);
}

// "player2" -> "Player 2"
function displayName(player) {
    return player.getName().replace(/^player(\d+)$/, "Player $1");
}

var PHASES = ["draft", "attack", "move", "end"];
var PHASE_ELEMENT = { draft: "phase-draft", attack: "startwar", move: "fortify", end: "endturn" };

var TurnPanel = {

    update: function () {
        var banner = el("turnbanner");
        if (!banner) return; // page without a turn panel

        var gamestate = require('./gamestate.js');
        var gamecontroller = require('./gamecontroller.js');
        var gameplayers = require('./gameplayers.js');

        var player = gamecontroller.getPlayerInTurn();
        if (!player) return;
        var state = player.getState();
        var alive = gameplayers.getAlivePlayers();
        if (alive.length === 0) return; // board is still being dealt
        var gameOver = alive.length === 1;
        var aiTurn = document.body.classList.contains("ai-turn");

        // Banner: whose turn
        var who = gameOver ? displayName(alive[0]) : displayName(player);
        el("turnpanel").style.setProperty("--player-color", (gameOver ? alive[0] : player).getColor());
        el("turnplayer").textContent = gameOver ? who + " has won" : who;
        var levelSelect = el("difficulty");
        var level = levelSelect ? levelSelect.options[levelSelect.selectedIndex].text : "";
        var computer = "Computer" + (level ? " (" + level + ")" : "");
        el("turnrole").textContent = gameOver ? "Game over"
            : aiTurn ? computer + " is playing…"
            : player.isAI ? computer : "Your turn";

        // Phase stepper
        var phase = state.draft > 0 ? "draft"
            : gamestate.getGameState() === gamestate.BattleState ? "attack"
            : gamestate.getGameState() === gamestate.FortifyState ? "move"
            : "draft"; // all troops placed but no phase chosen yet
        var draftDone = state.draft === 0;
        var current = PHASES.indexOf(phase);
        var next = phase === "draft" ? (draftDone ? "attack" : null)
            : phase === "attack" ? "move"
            : "end";

        PHASES.forEach(function (name, i) {
            var step = el(PHASE_ELEMENT[name]);
            if (!step) return;
            step.classList.toggle("current", name === phase && !gameOver);
            step.classList.toggle("done", (i < current || (name === "draft" && draftDone)) && !gameOver);
            step.classList.toggle("next", name === next && !aiTurn && !gameOver);
            if (name === phase) step.setAttribute("aria-current", "step");
            else step.removeAttribute("aria-current");
        });

        // Context buttons
        var attack = gamecontroller.getAttackSelection();
        var defend = gamecontroller.getDefendSelection();
        el("gobattle").hidden = phase !== "attack" || !attack || !defend || aiTurn || gameOver;
        var trade = player.getBestTrade();
        var canTrade = player.canTradeNow() && !aiTurn && !gameOver;
        el("sellcards").hidden = !canTrade;
        if (trade) el("sellcards").textContent = "Trade cards (+" + trade.troops + ")";

        // Hint
        var hint;
        if (gameOver) {
            hint = "Press New Game to play again.";
        } else if (aiTurn) {
            hint = "Watch the map. Its moves are listed under Moves.";
        } else if (phase === "draft" && !draftDone) {
            hint = "Place " + state.draft + " more " + (state.draft === 1 ? "troop" : "troops") + ": tap your regions.";
            if (canTrade) hint += " You can also trade cards for " + trade.troops + " more.";
            if (state.tookCards) hint += " Then tap Attack to keep attacking.";
        } else if (phase === "draft") {
            hint = canTrade
                ? "All troops placed. Trade cards for " + trade.troops + " more troops, or tap Attack, Move or End turn."
                : "All troops placed. Tap Attack, or Move, or End turn.";
        } else if (phase === "attack" && canTrade) {
            hint = "You knocked out " + state.tookCardsFrom.replace(/^player(\d+)$/, "Player $1") + " and took their cards. "
                + "Trade cards now for " + trade.troops + " troops to place, or keep attacking.";
        } else if (phase === "attack") {
            if (!attack) hint = "Tap one of your regions to attack from. When you are done, tap Move or End turn.";
            else if (!defend) hint = attack.getName() + " selected (" + attack.getTroopCount() + " troops). Tap a lit-up enemy region.";
            else {
                var a = attack.getTroopCount() - 1, d = defend.getTroopCount();
                hint = attack.getName() + " → " + defend.getName() + ": " + a + " attacking vs " + d + " defending. "
                    + (a > d ? "You will win. Tap Attack!" : "You will lose this battle.");
            }
        } else if (phase === "move") {
            var source = gamecontroller.getMoveSource();
            hint = source
                ? "Tap a lit-up region to move 1 troop from " + source.getName() + " per tap. Any of your regions connected through your own land or sea routes lights up. Tap " + source.getName() + " again to pick another region."
                : "Tap a region to move troops from, or End turn.";
        }
        if (!aiTurn && !gameOver && state.cards.length) {
            hint += " Your cards: " + state.cards.map(function (c) { return c.name; }).join(", ") + ".";
            if (!trade && state.cards.length >= 3) hint += " (No set yet: you need 3 of a kind or one of each.)";
        }
        el("turnhint").textContent = hint;
    }
};

module.exports = TurnPanel;
