var battle = require('./battle.js');
var gameplayers = require('./gameplayers.js');

var attackerSelection;
var defenderSelection;
var players = gameplayers.getAllPlayers();
var playerInTurn;

function getPlayerInTurn() {
    return players[playerInTurn];
}

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
        playerInTurn = playerInTurn < players.length - 1 ? playerInTurn ++ : 0;
    },
    setSelectedRegion: function(region) {
        if (region.getPlayer().isSame(getPlayerInTurn())) {
            // Set the attacker
            if (attackerSelection) attackerSelection.toggleSelection(); // deselect if already selected
            attackerSelection = region;
        } else if (attackerSelection){
            // Attacker already set. Set defender
            if (defenderSelection) defenderSelection.toggleSelection(); // deselect if already selected
            defenderSelection = region;
        } else {
            // Attacker not yet set. Cannot set defender yet.
            region.toggleSelection();
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
            attackerSelection.toggleSelection();
            attackerSelection = defenderSelection;
            defenderSelection = null;
        } else {
            // nothing selected
            attackerSelection.toggleSelection();
            defenderSelection.toggleSelection();
            attackerSelection = null;
            defenderSelection = null;
        }
    }
}

module.exports = GameController;