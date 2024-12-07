var consts = require('./consts');

/**
 * Represents the Battle object that handles the battle logic between two regions.
 */
var Battle = {

    /**
     * Executes the battle between the attacking and defending regions.
     * @param {Object} regionAttack - The attacking region.
     * @param {Object} regionDefense - The defending region.
     * @returns {boolean} - Returns true if the attack is successful, otherwise false.
     */
    go: function(regionAttack, regionDefense) {

        var defendingtroops = regionDefense.getTroopCount();
        var attackingtroops = regionAttack.getTroopCount() - 1;
        var defendleft = defendingtroops - attackingtroops; // defending troops left after attack
        var attackleft = Math.abs(defendleft);

        regionAttack.setTroopCount(1); // Allways one left in the attacking square

        if (defendleft < 0) {
            // attack successful
            var attackingplayer = regionAttack.getPlayer();
            var defendingplayer = regionDefense.getPlayer();
            regionDefense.setPlayer(attackingplayer);
            regionDefense.setTroopCount(attackleft);
            attackingplayer.addRegion(regionDefense);
            defendingplayer.removeRegion(regionDefense);
            attackingplayer.cardEarned();

            // Check continent
            var continent = regionDefense.getContinent();
            continent.checkContinentOwner();

            return true;
        } else {
            // attack failed
            regionDefense.setTroopCount(defendleft);
            return false;
        }
    }

}

module.exports = Battle;
