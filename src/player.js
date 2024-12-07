var consts = require('./consts');
var deck = require('./carddeck');
var util = require('./util');

/**
 * Represents a player in the game.
 * @constructor
 * @param {number} id - The ID of the player.
 * @param {string} name - The name of the player.
 * @param {string} color - The color associated with the player.
 */
function player(id, name, color) {
    var id = id;
    var name = name;
    var color = color;
    var state = {};
    var cardEarned = false;

    /**
     * Resets the player's state.
     */
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

    /**
     * Adds a region to the player's control.
     * @param {Object} region - The region to be added.
     */
    this.addRegion = function (region) {
        state.regions.push(region);
        state.troops = state.troops + region.getTroopCount();
    }

    /**
     * Removes a region from the player's control.
     * @param {Object} region - The region to be removed.
     */
    this.removeRegion = function (region) {
        state.regions = state.regions.filter(reg => !reg.isSame(region));
    }

    /**
     * Adds a continent to the player's control.
     * @param {Object} continent - The continent to be added.
     */
    this.addContinent = function (continent) {
        state.continents.push(continent);
    }

    /**
     * Removes a continent from the player's control.
     * @param {Object} continent - The continent to be removed.
     */
    this.removeContinent = function (continent) {
        state.continents = state.continents.filter(c => continent.getId() != c.getId());
    }

    /**
     * Returns the name of the player.
     * @returns {string} The name of the player.
     */
    this.getName = function () {
        return name;
    }

    /**
     * Returns the color associated with the player.
     * @returns {string} The color of the player.
     */
    this.getColor = function () {
        return color;
    }

    /**
     * Returns the current state of the player.
     * @returns {Object} The current state of the player.
     */
    this.getState = function () {
        return state;
    }

    /**
     * Sets the draft count for the player.
     * @param {number} count - The draft count to be set.
     */
    this.setDraft = function (count) {
        state.draft = count;
    }

    /**
     * Checks if the given player is the same as the current player.
     * @param {Object} p - The player to compare.
     * @returns {boolean} True if the players are the same, otherwise false.
     */
    this.isSame = function (p) {
        return p.getName() == this.getName();
    }

    /**
     * Checks if the player is dead (has no regions).
     * @returns {boolean} True if the player is dead, otherwise false.
     */
    this.isDead = function () {
        return state.regions.length == 0;
    }

    /**
     * Reduces the draft count by one.
     * @returns {boolean} True if the draft count was reduced, otherwise false.
     */
    this.reduceDraft = function () {

        if (state.draft == 0) return false; // cannot reduce
        state.draft--;
        return true;

    }

    /**
     * Ends the player's turn and earns a card if applicable.
     */
    this.endTurn = function () {
        if (cardEarned) {
            var card = deck.getCard();
            state.cards.push(card);
        }

        cardEarned = false;
    }

    /**
     * Starts the player's turn and sets the draft count.
     */
    this.startTurn = function () {

        // Set the draft count
        var regionpoints = state.regions.length < 3 ? state.regions.length / 3 : 3;
        var continentpoints = state.continents.reduce((a, b) => a + b.getContinentPoints(), 0);
        state.draft += regionpoints + continentpoints;
    }

    /**
     * Assigns troops to the player's regions.
     */
    this.AssignTroopsToRegions = function () {

        do {
            var randomregionindex = Math.floor(Math.random() * state.regions.length);
            var success = state.regions[randomregionindex].addTroops();
        } while (success);
    }

    /**
     * Marks that the player has earned a card.
     */
    this.cardEarned = function () {
        cardEarned = true;
    }

    /**
     * Sells the player's cards and updates the draft count.
     */
    this.sellCards = function () {

        if (state.cards.length < 3) return; // not enough cards

        // number of wild cards
        var wilds = state.cards.filter(c => c.id == 4).length;

        var allthree = deck.AllTreeCards;

        var permutations = [];
        var permutatedCards = [];

        if (wilds == 1) {
            permutations = allthree;

        } else if (wilds == 2) {
            // Get permutations for two wild cards
            for (var i = 0; i < allthree.length; i++) {
                for (var j = i; j < allthree.length; j++) {
                    var permutation = [allthree[i], allthree[j]];
                    permutations.push(permutation);
                }
            }
        }

        // Get all cards that are not wild cards
        var nonwildcards = state.cards.filter(c => c.id != 4);
        // add the non wild cards to the permutations
        permutatedCards = permutations.map(p => nonwildcards.concat(p).sort((a, b) => {
            return b.points - a.points;
        }));

        // If there are no wild card permutations then use just the one, but sorted
        if (!permutatedCards.length) permutatedCards = [state.cards.sort((a, b) => {
            return b.points - a.points;
        })];

        // Go through all possible permutations of the (wild) cards
        var validSetsOfThree = [];
        permutatedCards.forEach(p => {
            var sets = checkcards(p);
            validSetsOfThree = validSetsOfThree.concat(sets);
        });

        // Atleast one valid set of three was found
        if (validSetsOfThree.length > 0) {

            function getPoints(set) {
                return set.reduce((a, b) => a + b.points, 0);
            }

            // Find the set with best points
            const bestset = validSetsOfThree.reduce(function (setA, setB) {
                return (getPoints(setA) > getPoints(setB)) ? setA : setB
            })

            // trade/sell the cards in the set
            var points = getPoints(bestset);
            state.draft += points;
            bestset.forEach(s => {
                // find the card with the same amount of points
                var index = state.cards.findIndex(function (c) {
                    return c.points == s.points;
                });
                if (index == -1) {
                    // find a wild card instead
                    index = state.cards.findIndex(function (c) {
                        return deck.isWildCard(c);
                    });
                }
                state.cards.splice(index, 1); // remove the card from the found index
            });
        }

        function checkcards(permutation) {

            // array of valid sets found
            var setsfound = [];

            // current set
            var setofthree = permutation.slice(0, 3);

            // all different
            if (util.isAllUnique(setofthree.map(s => s.id))) {
                setsfound.push(setofthree);
            } else
                // all same
                if (setofthree.every(c => c.id === setofthree[0].id)) {
                    setsfound.push(setofthree);
                }
            // check next three (if exists)
            if (permutation.length > 3) {
                var moresets = checkcards(permutation.slice(1, permutation.length));
                setsfound = setsfound.concat(moresets);
            }
            return setsfound; // no valid set found
        }
    }
}

var colors = consts.PLAYER_COLORS;
var playerid = 0;

/**
 * Factory object to create instances of players.
 */
var PlayerFactory = {
    /**
     * Creates and returns a new instance of a player.
     * @returns {player} A new player instance.
     */
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
