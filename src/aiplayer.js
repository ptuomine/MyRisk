var continentFactory = require('./continent.js');
var consts = require('./consts.js');

class AIPlayer {
    constructor(player, gamecontroller) {
        this.player = player;
        this.gamecontroller = gamecontroller;
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
    
        regionsInDominantContinent.forEach(region => {
            const adjacentOpponentRegions = this.filterOpponentRegions(
                this.getAdjacentRegions(region, allRegionsInDominantContinent),
                this.player
            );
    
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
    
        return regions.filter(r => {
            const rowDiff = Math.abs(r.getRow() - regionRow);
            const colDiff = Math.abs(r.getColumn() - regionCol);
    
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
        return battles.map(battle => {
            return {
                attacker: battle.attacker,
                defender: battle.defender,
                action: () => {
                    battle.attacker.setSelection(true);
                    battle.defender.setSelection(true);
                    this.gamecontroller.goBattle();
                    this.moveSummary.push(`Attacked region ${battle.defender.getId()} from region ${battle.attacker.getId()}`);
                }
            };
        });
    }
}

var AIPlayerFactory = {
    GetAIPlayerInstance: function(player, gamecontroller) {
        return new AIPlayer(player, gamecontroller);
    }
}

module.exports = AIPlayerFactory;
