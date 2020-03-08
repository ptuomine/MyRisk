var battle = require('./battle.js');
var gameplayers = require('./gameplayers.js');

var attackerSelection;
var defenderSelection;
var players = gameplayers.getAllPlayers();
var playerInTurn;

var GameController = {

    init: function () {
        this.reset();
    },
    reset: function() {
        playerInTurn = 0;
        attackerSelection = null;
        defenderSelection = null;
    },
    nextTurn: function() {
        playerInTurn = playerInTurn < players.length - 1 ? playerInTurn + 1 : 0;
        attackerSelection = null;
        defenderSelection = null;
    },
    getPlayerInTurn: function() {
        return players[playerInTurn];
    },
    setSelectedRegion: function(region) {

        if (!region.isSelected()) {
            // Selected false
            if (region.getPlayer().isSame(this.getPlayerInTurn())) {
                attackerSelection = null;
            } else {
                defenderSelection = null;
            }
            return;
        }
        // Selected = true
        if (region.getPlayer().isSame(this.getPlayerInTurn())) {
            // Set the attacker
            if (attackerSelection) attackerSelection.setSelection(false); // deselect if already selected
            attackerSelection = region;
        } else if (attackerSelection){
            // Attacker already set. Set defender
            if (defenderSelection) defenderSelection.setSelection(false); // deselect if already selected
            defenderSelection = region;
        } else {
            // Attacker not yet set. Cannot set defender yet.
            region.setSelection(false);
        }
    },
    goBattle: function() {
        if (!attackerSelection || !defenderSelection) {
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