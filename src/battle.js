var Battle = {

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
            return true;
        } else {
            // attack failed
            regionDefense.setTroopCount(defendleft);
            return false;
        }
    }

}

module.exports = Battle;