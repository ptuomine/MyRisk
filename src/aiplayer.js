var battle = require('./battle.js');
var continentFactory = require('./continent.js');

/*
 * Computer player.
 *
 * Battles in this game have no dice: an attack wins exactly when
 * (attacking troops - 1) > defending troops. So the AI never makes an attack
 * it would lose. It spends its turn in three steps:
 *   1. Trade cards for troops when it has a valid set.
 *   2. Place new troops one at a time, each on the region that best sets up
 *      a winning attack (or, if none is in reach, on its most threatened border).
 *   3. Attack while it has winning attacks worth making.
 */

function allRegions() {
    return continentFactory.getAllContinents().reduce(function (all, c) {
        return all.concat(c.getRegions());
    }, []);
}

function regionName(region) {
    return "row " + region.getRow() + ", col " + region.getColumn();
}

class AIPlayer {
    constructor(player) {
        this.player = player;
    }

    owns(region) {
        return region.getPlayer().isSame(this.player);
    }

    neighbours(region, regions) {
        return regions.filter(function (other) {
            return other !== region && region.canAttack(other);
        });
    }

    enemyNeighbours(region, regions) {
        var self = this;
        return this.neighbours(region, regions).filter(function (r) { return !self.owns(r); });
    }

    /**
     * How much the AI wants to take `defender`, ignoring whether it can win.
     * Higher is better.
     */
    targetValue(defender, regions) {
        var self = this;
        var continent = defender.getContinent();
        var contRegions = continent.getRegions();
        var ownedInCont = contRegions.filter(function (r) { return self.owns(r); }).length;
        var enemy = defender.getPlayer();
        var enemyOwnsCont = contRegions.every(function (r) { return r.getPlayer().isSame(enemy); });

        var value = 0;
        if (ownedInCont + 1 === contRegions.length) value += 12; // completes a continent
        value += 6 * (ownedInCont / contRegions.length);       // builds toward a continent
        if (enemyOwnsCont) value += 7;                          // breaks an enemy continent bonus
        if (enemy.getState().regions.length === 1) value += 10; // knocks a player out
        value -= 0.3 * defender.getTroopCount();               // cheaper targets first
        return value;
    }

    /**
     * Value of attacking now, or null if the attack would not win.
     */
    attackScore(attacker, defender, regions) {
        var a = attacker.getTroopCount();
        var d = defender.getTroopCount();
        if (a - 1 <= d) return null;
        var remaining = a - 1 - d; // troops that move into the conquered region

        // Troops that move in can be hit next turn by the defender's other neighbours.
        var self = this;
        var threat = this.neighbours(defender, regions)
            .filter(function (r) { return r !== defender && !self.owns(r); })
            .reduce(function (max, r) { return Math.max(max, r.getTroopCount()); }, 0);

        return this.targetValue(defender, regions)
            + 0.6 * Math.min(remaining, 6)
            - 0.25 * Math.max(0, threat - remaining);
    }

    bestAttack(regions) {
        var self = this;
        var best = null;
        this.player.getState().regions.forEach(function (attacker) {
            self.enemyNeighbours(attacker, regions).forEach(function (defender) {
                var score = self.attackScore(attacker, defender, regions);
                if (score !== null && (!best || score > best.score)) {
                    best = { attacker: attacker, defender: defender, score: score };
                }
            });
        });
        return best;
    }

    /**
     * Picks the region for the next drafted troop.
     */
    draftTarget(draftLeft, regions) {
        var self = this;
        var best = null;

        // Prefer a region that can turn into a winning attack with the troops left.
        this.player.getState().regions.forEach(function (region) {
            var a = region.getTroopCount();
            self.enemyNeighbours(region, regions).forEach(function (defender) {
                var needed = Math.max(0, defender.getTroopCount() + 2 - a);
                if (needed > draftLeft) return;
                var score = self.targetValue(defender, regions) - 0.5 * needed;
                if (!best || score > best.score) best = { region: region, score: score };
            });
        });
        if (best) return best.region;

        // Otherwise reinforce the most threatened border region.
        var bestThreat = -Infinity;
        var target = null;
        this.player.getState().regions.forEach(function (region) {
            var enemies = self.enemyNeighbours(region, regions);
            if (!enemies.length) return;
            var strongest = enemies.reduce(function (m, r) { return Math.max(m, r.getTroopCount()); }, 0);
            var threat = strongest - region.getTroopCount();
            if (threat > bestThreat) { bestThreat = threat; target = region; }
        });
        return target || this.player.getState().regions[0];
    }

    /**
     * Plays a full turn. Steps are spaced out by `opts.delay` so a person can follow.
     * @param {Object} opts
     * @param {function(number): Promise} opts.delay - waits the given milliseconds
     * @param {function(): boolean} opts.isCancelled - true when a new game has started
     * @param {function()} opts.onChange - refreshes the stats table
     * @param {function(string)} opts.log - records a move for the move list
     * @param {number} opts.stepMs - pause between steps
     */
    async playTurn(opts) {
        var player = this.player;
        var name = player.getName();
        var regions = allRegions();
        var state = player.getState();

        // 1. Trade cards
        if (state.cards.length >= 3) {
            var before = state.draft;
            player.sellCards();
            if (state.draft > before) {
                opts.log(name + " traded cards for " + (state.draft - before) + " troops");
                opts.onChange();
            }
        }

        // 2. Draft
        var placed = new Map();
        while (state.draft >= 1) {
            var target = this.draftTarget(Math.floor(state.draft), regions);
            if (!target || !target.addTroops()) break;
            placed.set(target, (placed.get(target) || 0) + 1);
        }
        placed.forEach(function (count, region) {
            opts.log(name + " placed " + count + " at " + regionName(region));
        });
        opts.onChange();

        await opts.delay(opts.stepMs);
        if (opts.isCancelled()) return;

        // 3. Attack
        var conquered = 0;
        for (var guard = 0; guard < 50; guard++) {
            var move = this.bestAttack(regions);
            if (!move) break;
            // After the first win (which earns a card), only keep attacking when it pays off.
            if (conquered > 0 && move.score < 2) break;

            var from = regionName(move.attacker);
            var to = regionName(move.defender);
            var loser = move.defender.getPlayer().getName();
            if (!battle.go(move.attacker, move.defender)) break; // cannot happen: only winning attacks are chosen
            conquered++;
            opts.log(name + " took " + to + " from " + loser + " (attacked from " + from + ")");
            opts.onChange();

            await opts.delay(opts.stepMs);
            if (opts.isCancelled()) return;
            if (state.regions.length === regions.length) break; // owns the whole map
        }

        if (conquered === 0) opts.log(name + " held its positions");
    }
}

/**
 * Factory object to create instances of AI players.
 */
var AIPlayerFactory = {
    /**
     * Creates and returns a new instance of an AI player.
     * @returns {AIPlayer} A new AI player instance.
     */
    GetAIPlayerInstance: function (player) {
        return new AIPlayer(player);
    }
}

module.exports = AIPlayerFactory;
