var util = require('./util.js');

var cards = [];

var infantry = {
    id: 1,
    points: 2,
    display: "#"
}

var cavalry = {
    id: 2,
    points: 3,
    display: "£"
}

var artillery = {
    id: 3,
    points: 4,
    display: "¤"
}

var wildcard = {
    id: 4,
    points: 0,
    display: "%"
}

var allthree = [artillery, cavalry, infantry]

var infantryCount = 10;
var cavalryCount = 10;
var artilleryCount = 10;
var wildcardCount = 2;

var CardDeck = {

    infantryPoints: 2,
    cavarlryPoints: 3,
    artilleryPoints: 4,

    WildCard: wildcard,

    AllTreeCards: allthree,

    Infantry: infantry,
    Cavalry: cavalry,
    Artillery: artillery,

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
    getCard: function() {

        if (cards.length == 0) this.init();
        return cards.pop();
    },
    isWildCard: function(card) {
        return card.id == wildcard.id;
    }

}

module.exports = CardDeck;