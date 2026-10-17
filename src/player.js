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
    this.isAI = false;

    this.getId = function() {
        return id;
    }

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
        state.draft += this.getReinforcements().total;
    }

    /**
     * New troops at the start of a turn: 1 for every 2 regions owned (at least 3),
     * plus the bonus of every continent held in full.
     * @returns {{regions: number, regionTroops: number, continents: Array, total: number}}
     */
    this.getReinforcements = function () {
        var regionTroops = Math.max(consts.MIN_REINFORCEMENTS, Math.floor(state.regions.length / consts.REGIONS_PER_TROOP));
        var continents = state.continents.map(c => ({ name: c.getName(), bonus: c.getContinentPoints() }));
        var total = regionTroops + continents.reduce((a, c) => a + c.bonus, 0);
        return { regions: state.regions.length, regionTroops: regionTroops, continents: continents, total: total };
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
     * Finds the most valuable set of 3 cards the player can trade.
     * A set is three of the same type or one of each type; a wild card stands in
     * for any type. Each card is worth its type's points (infantry 2, cavalry 3,
     * artillery 4); a wild card takes the points of the type it stands in for.
     * @returns {{cards: Array, troops: number}|null} the cards to hand in and the troops they give, or null
     */
    this.getBestTrade = function () {
        var cards = state.cards;
        var types = deck.AllTreeCards; // artillery, cavalry, infantry: highest points first
        var best = null;
        for (var i = 0; i < cards.length; i++)
            for (var j = i + 1; j < cards.length; j++)
                for (var k = j + 1; k < cards.length; k++) {
                    var set = [cards[i], cards[j], cards[k]];
                    var troops = setValue(set, types);
                    if (troops > 0 && (!best || troops > best.troops)) best = { cards: set, troops: troops };
                }
        return best;
    }

    /**
     * Trades the best set of cards for extra troops to place.
     * @returns {number} troops gained (0 if the player has no set)
     */
    this.sellCards = function () {
        var trade = this.getBestTrade();
        if (!trade) return 0;
        trade.cards.forEach(function (card) {
            state.cards.splice(state.cards.indexOf(card), 1); // remove this exact card
        });
        state.draft += trade.troops;
        return trade.troops;
    }
}

/**
 * Troops a set of 3 cards is worth, or 0 if it is not a valid set.
 */
function setValue(set, types) {
    var real = set.filter(c => !deck.isWildCard(c));
    var wilds = set.length - real.length;
    var ids = real.map(c => c.id);
    var realPoints = real.reduce((a, c) => a + c.points, 0);

    if (real.length === 0) return types[0].points * 3; // three wilds: best type three times

    if (util.isAllUnique(ids)) {
        // one of each: wilds take the missing types, best points first
        var missing = types.filter(t => ids.indexOf(t.id) === -1).slice(0, wilds);
        var allSame = real.length > 0 && wilds > 0
            ? real[0].points * 3 // e.g. artillery + 2 wilds can also count as three artillery
            : 0;
        return Math.max(realPoints + missing.reduce((a, t) => a + t.points, 0), allSame);
    }
    if (ids.every(id => id === ids[0])) {
        return real[0].points * 3; // three of a kind (wilds fill in)
    }
    return 0;
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
