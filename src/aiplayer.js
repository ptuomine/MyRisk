class AIPlayer {
    constructor(player) {
        this.player = player;
        this.moveSummary = [];
    }

    draftTroops() {
        const regions = this.player.getState().regions;
        const draftCount = this.player.getState().draft;

        for (let i = 0; i < draftCount; i++) {
            let targetRegion = this.selectRegionToDraft(regions);
            targetRegion.addTroops();
            this.moveSummary.push(`Drafted troops to region ${targetRegion.id}`);
        }
    }

    selectRegionToDraft(regions) {
        return regions[Math.floor(Math.random() * regions.length)];
    }

    selectBattles() {
        const regions = this.player.getState().regions;
        const battles = [];

        regions.forEach(region => {
            const adjacentRegions = this.getAdjacentRegions(region);
            adjacentRegions.forEach(adjRegion => {
                if (adjRegion.getPlayer() !== this.player && region.getTroopCount() > adjRegion.getTroopCount()) {
                    battles.push({ attacker: region, defender: adjRegion });
                }
            });
        });

        return battles;
    }

    getAdjacentRegions(region) {
        return this.player.getState().regions.filter(r => r !== region);
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

var AIPlayerFactory = {
    GetAIPlayerInstance: function(player) {
        return new AIPlayer(player);
    }
}

module.exports = AIPlayerFactory;
