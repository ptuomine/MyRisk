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
        const regionsInDominantContinent = regions.filter(region => region.getContinent().getId() === dominantContinentId);
        if (regionsInDominantContinent.length > 0) {
            return regionsInDominantContinent[Math.floor(Math.random() * regionsInDominantContinent.length)];
        }
        return regions[Math.floor(Math.random() * regions.length)];
    }

    selectBattles() {
        const regions = this.player.getState().regions;
        const dominantContinent = this.getDominantContinentId();
        const battles = [];

        regions.forEach(region => {
            const adjacentRegions = this.getAdjacentRegions(region);
            adjacentRegions.forEach(adjRegion => {
                if (adjRegion.getPlayer() !== this.player && region.getTroopCount() > adjRegion.getTroopCount() && adjRegion.getContinent() === dominantContinent) {
                    battles.push({ attacker: region, defender: adjRegion });
                }
            });
        });

        return battles;
    }

    getAdjacentRegions(region) {
        return this.player.getState().regions.filter(r => r !== region);
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
