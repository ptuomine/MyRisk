var continentFactory = require('./continent.js');
var consts = require('./consts.js');
//var gamecontroller = require('./gamecontroller.js');

/**
 * Represents an AI player in the game.
 */
class AIPlayer {
    constructor(player) {
        this.player = player;
        this.moveSummary = [];
    }

    draftTroops() {
        const regions = this.player.getState().regions;
        const draftCount = this.player.getState().draft;
        const dominantContinentId = this.getDominantContinentId();

        for (let i = 0; i < draftCount; i++) {
            let targetRegion = this.selectRegionToDraft(regions, dominantContinentId);
            targetRegion.addTroops();
            this.moveSummary.push(`Drafted troops to region ${targetRegion.id}`);
        }
    }

    selectRegionToDraft(regions, dominantContinentId) {
        var dominantContinent = continentFactory.getContinentInstanceById(dominantContinentId);
        var regionsInDominantContinent = dominantContinent.getPlayerRegions(this.player);

        if (regionsInDominantContinent.length > 0) {
            return regionsInDominantContinent[Math.floor(Math.random() * regionsInDominantContinent.length)];
        }
        return regions[Math.floor(Math.random() * regions.length)];
    }

    selectBattles() {
        const dominantContinentId = this.getDominantContinentId();
        const dominantContinent = continentFactory.getContinentInstanceById(dominantContinentId);
        const regionsInDominantContinent = dominantContinent.getPlayerRegions(this.player);
        const allRegionsInDominantContinent = dominantContinent.getRegions();
        const battles = [];
    
        // Iterate through player's regions in the dominant continent
        regionsInDominantContinent.forEach(region => {
            // Get adjacent regions and filter out regions belonging to the player
            const adjacentOpponentRegions = this.filterOpponentRegions(
                this.getAdjacentRegions(region, allRegionsInDominantContinent),
                this.player
            );
    
            // Find valid battles
            adjacentOpponentRegions.forEach(adjRegion => {
                if (region.getTroopCount() > adjRegion.getTroopCount()) {
                    battles.push({ attacker: region, defender: adjRegion });
                }
            });
        });
    
        return battles;
    }
    

    filterOpponentRegions(regions, player) {
        return regions.filter(region => region.getPlayer() !== player);
    }    

    getAdjacentRegions(region, regions) {
        const regionRow = region.getRow();
        const regionCol = region.getColumn();
    
        // Assuming a simple rule where adjacent regions share a border
        return regions.filter(r => {
            const rowDiff = Math.abs(r.getRow() - regionRow);
            const colDiff = Math.abs(r.getColumn() - regionCol);
    
            // Adjacent if they are horizontally, vertically, or diagonally neighboring
            return (rowDiff <= 1 && colDiff <= 1) && r !== region;
        });
    }
    
    

    getDominantContinentId() {
        const continentCounts = {};
        this.player.getState().regions.forEach(region => {
            const continent = region.getContinent().getId();
            if (!continentCounts[continent]) {
                continentCounts[continent] = 0;
            }
            continentCounts[continent] += region.getTroopCount();
        });

        let dominantContinent = null;
        let maxCount = 0;
        for (const continent in continentCounts) {
            if (continentCounts[continent] > maxCount) {
                maxCount = continentCounts[continent];
                dominantContinent = continent;
            }
        }

        return dominantContinent;
    }

    summarizeMoves() {
        const summaryElement = document.getElementById("aiMoveList");
        summaryElement.innerHTML = "";
        this.moveSummary.forEach(move => {
            const listItem = document.createElement("li");
            listItem.innerText = move;
            summaryElement.appendChild(listItem);
        });
    }

    executeTurn() {
        this.moveSummary = [];
        this.draftTroops();
        const battles = this.selectBattles();
        battles.forEach(battle => {
            battle.attacker.setSelection(true);
            battle.defender.setSelection(true);
            gamecontroller.goBattle();
            this.moveSummary.push(`Attacked region ${battle.defender.getId()} from region ${battle.attacker.getId()}`);
        });
        this.summarizeMoves();
    }
}

/**
 * Factory object to create instances of AI players.
 */
var AIPlayerFactory = {
    /**
     * Creates and returns a new instance of an AI player.
     * @returns {aiplayer} A new AI player instance.
     */
    GetAIPlayerInstance: function(player) {
        return new AIPlayer(player);
    }
}

module.exports = AIPlayerFactory;
