var battle = require('./battle.js');
var playerstats = require('./playerstats.js');
var canvas = require('./canvas');

var attackerSelection;
var defenderSelection;
var moveSource; // region troops are moved from in the move phase
var playerInTurn;

/**
 * Checks if a battle is possible by verifying if both attacker and defender are selected.
 * @returns {boolean} - Returns true if both attacker and defender are selected, otherwise false.
 */
function isBattlePossible() {
    return attackerSelection && defenderSelection
}

var highlighted = []; // regions currently lit up as possible targets

function clearTargets() {
    highlighted.forEach(function(r) { r.setTarget(false); });
    highlighted = [];
}

/**
 * Lights up the regions bordering `region` that you can attack (enemy regions)
 * or move troops to (your own regions).
 */
function showTargets(region, ownRegions) {
    clearTargets();
    if (!region) return;
    var targets = ownRegions
        ? region.getConnectedOwnRegions() // moves can go anywhere through your own regions
        : region.getNeighbours().filter(function(n) { return !n.getPlayer().isSame(playerInTurn); });
    targets.forEach(function(n) {
        n.setTarget(true);
        highlighted.push(n);
    });
}

var GameController = {

    /**
     * Initializes the game controller by resetting the game state.
     */
    init: function () {
        this.reset();
    },

    /**
     * Resets the game controller by setting the player in turn and clearing selections.
     */
    reset: function() {
        playerInTurn = playerstats.getFirstPlayer();
        attackerSelection = null;
        defenderSelection = null;
        moveSource = null;
        clearTargets();
    },

    /**
     * Advances to the next turn by ending the current player's turn, changing the player in turn, and resetting selections.
     */
    nextTurn: function() {
        playerInTurn.endTurn();
        var next = playerstats.nextPlayer(); // change the player in turn
        if (!next) return; // game over: playerInTurn has won
        playerInTurn = next;
        playerInTurn.startTurn();

        attackerSelection = null;
        defenderSelection = null;
        moveSource = null;
        clearTargets();
    },

    /**
     * Starts the move phase: clears any attack selection.
     */
    startMovePhase: function() {
        if (attackerSelection) attackerSelection.setSelection(false);
        if (defenderSelection) defenderSelection.setSelection(false);
        attackerSelection = null;
        defenderSelection = null;
        moveSource = null;
        clearTargets();
        canvas.enablebattle(false);
    },

    /**
     * Handles a tap in the move phase. Tap one of your regions to pick it up,
     * then tap any of your regions connected to it through your own regions
     * to move one troop there per tap.
     * Tap the picked region again to put it down.
     * @param {Object} region - The tapped region.
     */
    moveTroopClick: function(region) {
        if (!region.getPlayer().isSame(playerInTurn)) return;

        if (moveSource && moveSource.isSame(region)) {
            moveSource.setSelection(false);
            moveSource = null;
            clearTargets();
            return;
        }
        if (moveSource && moveSource.getConnectedOwnRegions().indexOf(region) !== -1) {
            moveSource.moveTroopsTo(region, 1);
            playerstats.updateStats();
            return;
        }
        if (moveSource) moveSource.setSelection(false);
        moveSource = region;
        region.setSelection(true);
        showTargets(region, true);
    },

    /**
     * Returns the player currently in turn.
     * @returns {Object} - The player currently in turn.
     */
    getPlayerInTurn: function() {
        return playerInTurn;
    },

    /** The region picked to attack from, or null. */
    getAttackSelection: function() {
        return attackerSelection || null;
    },

    /** The region picked to attack, or null. */
    getDefendSelection: function() {
        return defenderSelection || null;
    },

    /** The region picked to move troops from, or null. */
    getMoveSource: function() {
        return moveSource || null;
    },

    /**
     * Sets the selected region for the current player. Handles selection and deselection of attacker and defender regions.
     * @param {Object} region - The region to be selected or deselected.
     */
    setSelectedRegion: function(region) {

        if (!region.isSelected()) {
            // Selected false, i.e. deselection
            if (region.getPlayer().isSame(this.getPlayerInTurn())) {
                attackerSelection = null;
                if (defenderSelection) defenderSelection.setSelection(false);
                defenderSelection = null;
                clearTargets();
            } else {
                defenderSelection = null;
            }
            canvas.enablebattle(isBattlePossible());
            return;
        }
        // Selected = true
        if (region.getPlayer().isSame(this.getPlayerInTurn())) {
            // Set the attacker
            if (attackerSelection) attackerSelection.setSelection(false); // deselect if already selected
            if (defenderSelection) defenderSelection.setSelection(false);
            defenderSelection = null;
            attackerSelection = region;
            showTargets(region, false);
        } else if (attackerSelection){
            // Attacker already set. Set defender
            if (!attackerSelection.canAttack(region)) {
                // selection not legal
                region.setSelection(false); 
                return;
            }
            if (defenderSelection) defenderSelection.setSelection(false); // deselect if already selected
            defenderSelection = region;
        } else {
            // Attacker not yet set. Cannot set defender yet.
            region.setSelection(false);
        }
        canvas.enablebattle(isBattlePossible());

    },

    /**
     * Executes the battle between the selected attacker and defender regions.
     * If the attack is successful, the defender region becomes the new attacker.
     * If the attack fails, both selections are cleared.
     */
    goBattle: function() {
        if (!isBattlePossible()) {
            alert('not everything selected!');
            return;
        }
        var win = battle.go(attackerSelection, defenderSelection);
        if (win) {
            // Defender region will become selected as attacker. Defender has to be selected next
            attackerSelection.setSelection(false);
            attackerSelection = defenderSelection;
            defenderSelection = null;
            showTargets(attackerSelection, false);
        } else {
            // nothing selected
            attackerSelection.setSelection(false);
            defenderSelection.setSelection(false);
            attackerSelection = null;
            defenderSelection = null;
            clearTargets();
        }
        canvas.enablebattle(false);
    },
}

module.exports = GameController;
