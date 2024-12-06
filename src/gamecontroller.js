var battle = require('./battle.js');
var playerstats = require('./playerstats.js');
var canvas = require('./canvas');

var attackerSelection;
var defenderSelection;
var playerInTurn;

function isBattlePossible() {
    return attackerSelection && defenderSelection
}

var GameController = {

    init: function () {
        this.reset();
    },
    reset: function() {
        playerInTurn = playerstats.getFirstPlayer();
        attackerSelection = null;
        defenderSelection = null;
    },
    nextTurn: function() {
        playerInTurn.endTurn();
        playerInTurn = playerstats.nextPlayer(); // change the player in turn
        playerInTurn.startTurn();

        attackerSelection = null;
        defenderSelection = null;

        if (playerInTurn.isAIPlayer) {
            playerInTurn.makeMove();
        }
    },
    getPlayerInTurn: function() {
        return playerInTurn;
    },
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
    }
}

module.exports = GameController;
