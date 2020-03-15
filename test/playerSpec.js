//var player = require('../src/player');
var consts = require('../src/consts');
var deck = require('../src/carddeck');
var proxyquire = require('../node_modules/proxyquire');
var carddeckstub = {};

var player = proxyquire('../src/player', { '../src/carddeck': carddeckstub });

function stubCardDeck(cardtype) {
    carddeckstub.getCard = function () {
        return cardtype;
    };
}

function addCardToPlayer(player, cardtype) {
    stubCardDeck(cardtype);
    player.cardEarned();
    player.endTurn();
}

function testSellCards(cards, newPoints) {

    var p = player.getPlayerInstance();

    cards.forEach(c => addCardToPlayer(p, c));
    
    var state = p.getState();

    expect(state.cards.length).toBe(3);
    expect(state.draft).toBe(consts.TOTAL_TROOPS_EACH);

    p.sellCards();

    expect(state.cards.length).toBe(0);
    expect(state.draft).toBe(consts.TOTAL_TROOPS_EACH + newPoints);
}

describe("player tests", function () {
    var a;

    it("getPlayerInstance", function () {


        var p1 = player.getPlayerInstance();
        var name1 = p1.getName();

        var p2 = player.getPlayerInstance();
        var name2 = p2.getName();

        var p3 = player.getPlayerInstance();
        var name3 = p3.getName();

        expect(name1).toBe("player1");
        expect(name2).toBe("player2");
        expect(name3).toBe("player3");
    });

    it("sellCards - three infantry cards", function () {

        var cards = [deck.Infantry, deck.Infantry, deck.Infantry];
        testSellCards(cards, deck.infantryPoints*3);
    });

    it("sellCards - three cavalry cards", function () {

        var cards = [deck.Cavalry, deck.Cavalry, deck.Cavalry];
        testSellCards(cards, deck.cavarlryPoints*3);
    });

    it("sellCards - three artillery cards", function () {

        var cards = [deck.Artillery, deck.Artillery, deck.Artillery];
        testSellCards(cards, deck.artilleryPoints*3);
    });

    it("sellCards - three different cards", function () {

        var cards = [deck.Infantry, deck.Cavalry, deck.Artillery];
        var points = deck.infantryPoints + deck.cavarlryPoints + deck.artilleryPoints;
    });
});