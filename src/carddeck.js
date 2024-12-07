var util = require('./util.js');

var cards = [];

/**
 * Represents an infantry card.
 */
var infantry = {
    id: 1,
    points: 2,
    display: "#"
}

/**
 * Represents a cavalry card.
 */
var cavalry = {
    id: 2,
    points: 3,
    display: "£"
}

/**
 * Represents an artillery card.
 */
var artillery = {
    id: 3,
    points: 4,
    display: "¤"
}

/**
 * Represents a wildcard.
 */
var wildcard = {
    id: 4,
    points: 0,
    display: "%"
}

/**
 * Array containing all three types of cards.
 */
var allthree = [artillery, cavalry, infantry]

var infantryCount = 10;
var cavalryCount = 10;
var artilleryCount = 10;
var wildcardCount = 2;

/**
 * Represents the card deck used in the game.
 */
var CardDeck = {

    infantryPoints: 2,
    cavarlryPoints: 3,
    artilleryPoints: 4,

    WildCard: wildcard,

    AllTreeCards: allthree,

    Infantry: infantry,
    Cavalry: cavalry,
    Artillery: artillery,

    /**
     * Initializes the card deck by populating it with cards and shuffling them.
     */
    init: function() {

        cards = [];

        for (i=0; i<=infantryCount; i++) {
            cards.push(infantry);
        }
        for (i=0; i<=cavalryCount; i++) {
            cards.push(cavalry);
        }
        for (i=0; i<=artilleryCount; i++) {
            cards.push(artillery);
        }
        for (i=0; i<=wildcardCount; i++) {
            cards.push(wildcard);
        }
        util.shuffleArray(cards);

    },

    /**
     * Draws a card from the deck. If the deck is empty, it reinitializes the deck.
     * @returns {Object} The drawn card.
     */
    getCard: function() {

        if (cards.length == 0) this.init();
        return cards.pop();
    },

    /**
     * Checks if the given card is a wildcard.
     * @param {Object} card - The card to check.
     * @returns {boolean} True if the card is a wildcard, otherwise false.
     */
    isWildCard: function(card) {
        return card.id == wildcard.id;
    }

}

module.exports = CardDeck;
