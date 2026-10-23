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
 *   4. Move troops from safe inner regions to the most threatened border region they connect to.
 */

/*
 * Difficulty levels. None of them cheat: every level gets the same troops and
 * follows the same rules as a person. They differ only in how well they play.
 *   randomDraft     share of new troops placed on a random border region instead of the best one
 *   minEdge         attack only when attackers - 1 exceed defenders by at least this much
 *   maxConquests    most regions to take in one turn
 *   keepGoingScore  after the first win, keep attacking only while the best attack scores at least this
 *   moveTroops      use the Move step
 *   leaderBonus     extra wish to attack whoever is ahead (most regions)
 *   blockBonus      extra wish to stop an opponent who is one region from a whole continent
 */
var LEVELS = {
    easy:   { label: "Easy",   randomDraft: 0.6, minEdge: 3, maxConquests: 1,  keepGoingScore: Infinity, moveTroops: false, leaderBonus: 0, blockBonus: 0 },
    normal: { label: "Normal", randomDraft: 0.3, minEdge: 2, maxConquests: 3,  keepGoingScore: 4,        moveTroops: true,  leaderBonus: 0, blockBonus: 0 },
    hard:   { label: "Hard",   randomDraft: 0,   minEdge: 1, maxConquests: 50, keepGoingScore: -1,       moveTroops: true,  leaderBonus: 4, blockBonus: 8 },
};

function allRegions() {
    return continentFactory.getAllContinents().reduce(function (all, c) {
        return all.concat(c.getRegions());
    }, []);
}

function regionName(region) {
    return region.getName();
}

class AIPlayer {
    constructor(player, level) {
        this.player = player;
        this.level = LEVELS[level] || LEVELS.normal;
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

        // Hard: go after the leader, and stop anyone about to complete a continent
        if (this.level.leaderBonus && this.isLeader(enemy)) value += this.level.leaderBonus;
        if (this.level.blockBonus && !enemyOwnsCont) {
            var enemyInCont = contRegions.filter(function (r) { return r.getPlayer().isSame(enemy); }).length;
            if (enemyInCont === contRegions.length - 1) value += this.level.blockBonus;
        }
        return value;
    }

    /**
     * Whether `player` holds the most regions among this AI's opponents.
     */
    isLeader(player) {
        var self = this;
        var most = 0;
        var counts = {};
        allRegions().forEach(function (r) {
            var owner = r.getPlayer();
            if (owner.isSame(self.player)) return;
            counts[owner.getName()] = (counts[owner.getName()] || 0) + 1;
        });
        Object.keys(counts).forEach(function (k) { most = Math.max(most, counts[k]); });
        return counts[player.getName()] === most;
    }

    /**
     * Value of attacking now, or null if the attack would not win
     * (or, on Easy, would not win by a wide enough margin).
     */
    attackScore(attacker, defender, regions) {
        var a = attacker.getTroopCount();
        var d = defender.getTroopCount();
        if (a - 1 - d < this.level.minEdge) return null;
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

        // Easy: often just drop the troop on any border region
        if (this.level.randomDraft && Math.random() < this.level.randomDraft) {
            var borders = this.player.getState().regions.filter(function (r) { return self.enemyNeighbours(r, regions).length; });
            if (borders.length) return borders[Math.floor(Math.random() * borders.length)];
        }

        // Prefer a region that can turn into a winning attack with the troops left.
        this.player.getState().regions.forEach(function (region) {
            var a = region.getTroopCount();
            self.enemyNeighbours(region, regions).forEach(function (defender) {
                var needed = Math.max(0, defender.getTroopCount() + 1 + self.level.minEdge - a);
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
     * Plans troop moves for the end of the turn. Troops in regions with no enemy
     * neighbours go straight to a border region connected through the AI's own
     * regions: the one where the enemy outnumbers it the most, counting troops
     * already sent there this turn.
     * @returns {Array} list of { from, to, count }
     */
    planMoves(regions) {
        var self = this;
        var own = this.player.getState().regions.slice();
        var sent = new Map();

        var shortfall = function (r) {
            var strongest = self.enemyNeighbours(r, regions)
                .reduce(function (m, e) { return Math.max(m, e.getTroopCount()); }, 0);
            return strongest - r.getTroopCount() - (sent.get(r) || 0);
        };

        var moves = [];
        own.forEach(function (r) {
            if (r.getTroopCount() <= 1 || self.enemyNeighbours(r, regions).length) return;
            var best = null;
            r.getConnectedOwnRegions().forEach(function (n) {
                if (!self.enemyNeighbours(n, regions).length) return;
                if (!best || shortfall(n) > shortfall(best)) best = n;
            });
            if (!best) return;
            var count = r.getTroopCount() - 1;
            sent.set(best, (sent.get(best) || 0) + count);
            moves.push({ from: r, to: best, count: count });
        });
        return moves;
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
    /**
     * Trades the best set of cards while it has one.
     * @returns {boolean} true if it traded
     */
    tradeCards(opts) {
        var traded = false;
        var trade;
        while ((trade = this.player.getBestTrade())) {
            this.player.sellCards();
            opts.log(this.player.getName() + " traded " + trade.cards.map(function (c) { return c.name; }).join(", ") + " for " + trade.troops + " troops");
            traded = true;
        }
        if (traded) opts.onChange();
        return traded;
    }

    /**
     * Places all troops waiting to be placed, one at a time where they help most.
     */
    placeDraft(regions, opts) {
        var name = this.player.getName();
        var state = this.player.getState();
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
    }

    async playTurn(opts) {
        var player = this.player;
        var name = player.getName();
        var regions = allRegions();
        var state = player.getState();

        // 1. Trade cards, 2. Draft
        this.tradeCards(opts);
        this.placeDraft(regions, opts);

        await opts.delay(opts.stepMs);
        if (opts.isCancelled()) return;

        // 3. Attack
        var conquered = 0;
        for (var guard = 0; guard < 50; guard++) {
            var move = this.bestAttack(regions);
            if (!move) break;
            // After the first win (which earns a card), only keep attacking when it pays off.
            if (conquered >= this.level.maxConquests) break;
            if (conquered > 0 && move.score < this.level.keepGoingScore) break;

            var from = regionName(move.attacker);
            var to = regionName(move.defender);
            var loser = move.defender.getPlayer().getName();
            if (!battle.go(move.attacker, move.defender)) break; // cannot happen: only winning attacks are chosen
            conquered++;
            opts.log(name + " took " + to + " from " + loser + " (attacked from " + from + ")");

            // Knocked a player out: their cards are ours, trade them and place the troops now
            if (state.lastElimination) {
                var e = state.lastElimination;
                state.lastElimination = null;
                opts.log(name + " knocked out " + e.loser + " and took " + e.cards + " " + (e.cards === 1 ? "card" : "cards"));
                if (this.tradeCards(opts)) this.placeDraft(regions, opts);
            }
            opts.onChange();

            await opts.delay(opts.stepMs);
            if (opts.isCancelled()) return;
            if (state.regions.length === regions.length) break; // owns the whole map
        }

        if (conquered === 0) opts.log(name + " held its positions");

        // 4. Move troops toward the front
        var moves = this.level.moveTroops ? this.planMoves(regions) : [];
        if (moves.length) {
            moves.forEach(function (m) {
                var moved = m.from.moveTroopsTo(m.to, m.count);
                if (moved) opts.log(name + " moved " + moved + " from " + regionName(m.from) + " to " + regionName(m.to));
            });
            opts.onChange();
            await opts.delay(opts.stepMs);
        }
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
    GetAIPlayerInstance: function (player, level) {
        return new AIPlayer(player, level);
    },

    /** Difficulty levels: { easy, normal, hard } with a label each. */
    LEVELS: LEVELS
}

module.exports = AIPlayerFactory;
