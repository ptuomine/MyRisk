var consts = require('./consts.js');
var deck = require('./carddeck.js');

function player(id, name, color) {
    var id = id;
    var name = name;
    var color = color;
    var state = {};
    var cardEarned = false;

    this.reset = function () {
        state.regions = [];
        state.continents = [];
        state.getTroopCount = function () {
            return state.regions.reduce((a, b) => a + b.getTroopCount(), 0);
        };
        state.cards = [];
        state.draft = consts.TOTAL_TROOPS_EACH;
        cardEarned = false;
    }

    this.addRegion = function (region) {
        state.regions.push(region);
        state.troops = state.troops + region.getTroopCount();
    }

    this.removeRegion = function (region) {
        state.regions = state.regions.filter(reg => !reg.isSame(region));
    }

    this.addContinent = function (continent) {
        state.continents.push(continent);
    }

    this.removeContinent = function (continent) {
        state.continents = state.continents.filter(c => continent.getId() != c.getId());
    }

    this.getName = function () {
        return name;
    }

    this.getColor = function () {
        return color;
    }

    this.getState = function () {
        return state;
    }

    this.setDraft = function (count) {
        state.draft = count;
    }

    this.isSame = function (p) {
        return p.getName() == this.getName();
    }

    this.isDead = function () {
        return state.regions.length == 0;
    }

    this.reduceDraft = function () {

        if (state.draft == 0) return false; // cannot reduce
        state.draft--;
        return true;

    }

    this.endTurn = function () {
        if (cardEarned) {
            var card = deck.getCard();
            state.cards.push(card);
            state.cards.push(card);
            state.cards.push(card);
        }

        cardEarned = false;
    }

    this.startTurn = function () {

        // Set the draft count
        var regionpoints = state.regions.length < 3 ? state.regions.length / 3 : 3;
        var continentpoints = state.continents.reduce((a, b) => a + b.getContinentPoints(), 0);
        state.draft += regionpoints + continentpoints;
    }

    this.AssignTroopsToRegions = function () {

        do {
            var randomregionindex = Math.floor(Math.random() * state.regions.length);
            var success = state.regions[randomregionindex].addTroops();
        } while (success);
    }

    this.cardEarned = function () {
        cardEarned = true;
    }

    this.sellCards = function () {

        if (state.cards.length < 3) return; // not enough cards

        // number of wild cards
        var wilds = state.cards.filter(c => c.id == 4).length;

        var points = [4, 3, 2];

        // Get wildcard permutations
        var permutations = [];
        for (i = 0; i < wilds; i++) {
            for (j = i; j < points.length; j++) {
                var permutation = points[i] + "" + points[j];
                permutations.push(permutation);
            }
        }

        // Get all cards that are not wild cards
        var nonwildspoints = state.cards.filter(c => c.id != 4).map(c => c.points);
        // add the non wild cards to the permutations
        var permutatedCards = permutations.map(p => nonwildspoints.concat(p).sort((a, b) => {
            return a.points - b.points;
        }));

        // If there are no wild card permutations then use just the one, but sorted
        if (!permutatedCards.length) permutatedCards = [state.cards.sort((a, b) => {
            return a.points - b.points;
        })];

        // Go through all possible sets of cards
        permutatedCards.forEach(p => {
            var set = p.slice(0, 3);
            if (checkcards(set)) {
                // sell the cards
                var points = set.reduce((a, b) => a + b.points,0);
                state.draft += points;
                set.forEach(s => {
                    // find the card with the same amount of points
                    var index = state.cards.findIndex(function (c) {
                        return c.points == s.points;
                    });
                    if (index == -1) {
                        // find a wild card instead
                        index = state.cards.findIndex(function (c) {
                            return c.id == deck.WildCardId;
                        });
                    }
                    state.cards.splice(index, 1); // remove the card from the found index
                })
            }
            return;
        });

        function checkcards(setoftree) {
            // all different
            if (setoftree.every(c => c.id !== setoftree[0].id)) return true;
            // all same
            if (setoftree.every(c => c.id === setoftree[0].id)) return true;

            return false;
        }
    }
}

var colors = consts.PLAYER_COLORS;
var playerid = 0;

var PlayerFactory = {
    getPlayerInstance: function () {

        if (playerid > colors.length - 1) return null; // no more colors left

        var color = colors[playerid];
        playerid++;
        var newplayer = new player(playerid, "player" + playerid, color);
        newplayer.reset();
        return newplayer;

    }
}

module.exports = PlayerFactory;