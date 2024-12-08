var battle = require('./battle.js');
var playerstats = require('./playerstats.js');
var canvas = require('./canvas');
var AIPlayerFactory = require('./aiplayer.js');

var attackerSelection;
var defenderSelection;
var playerInTurn;

/**
 * Checks if a battle is possible by verifying if both attacker and defender are selected.
 * @returns {boolean} - Returns true if both attacker and defender are selected, otherwise false.
 */
function isBattlePossible() {
    return attackerSelection && defenderSelection
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
    },

    /**
     * Advances to the next turn by ending the current player's turn, changing the player in turn, and resetting selections.
     */
    nextTurn: function() {
        playerInTurn.endTurn();
        playerInTurn = playerstats.nextPlayer(); // change the player in turn
        playerInTurn.startTurn(this);

        if (playerInTurn.isAI) {
            var aiPlayer = AIPlayerFactory.GetAIPlayerInstance(playerInTurn, this);
            var battleActions = aiPlayer.executeTurn();
        }

        attackerSelection = null;
        defenderSelection = null;
    },

    startAI: function() {
        if (playerInTurn.isAI) {
            var aiPlayer = AIPlayerFactory.GetAIPlayerInstance(playerInTurn, this);
            aiPlayer.executeTurn();
        }
    },

    /**
     * Returns the player currently in turn.
     * @returns {Object} - The player currently in turn.
     */
    getPlayerInTurn: function() {
        return playerInTurn;
    },

    setAttackerRegion: function(region) {
        attackerSelection = region;
    },

    setDefenderRegion: function(region) {
        defenderSelection = region
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
            attackerSelection = region;
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
        } else {
            // nothing selected
            attackerSelection.setSelection(false);
            defenderSelection.setSelection(false);
            attackerSelection = null;
            defenderSelection = null;
        }
    },
    disableHumanInteraction: function() {
        document.getElementById("gamepanel").style.pointerEvents = "none";
        document.getElementById("newgame").style.pointerEvents = "auto";
    },
    summarizeAIMoves: function() {
        const summaryElement = document.getElementById("aiMoveList");
        summaryElement.innerHTML = "";
        playerInTurn.moveSummary.forEach(move => {
            const listItem = document.createElement("li");
            listItem.innerText = move;
            summaryElement.appendChild(listItem);
        });
    }
}

module.exports = GameController;
