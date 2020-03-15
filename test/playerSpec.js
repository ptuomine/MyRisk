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

    expect(state.cards.length).toBe(cards.length);
    expect(state.draft).toBe(consts.TOTAL_TROOPS_EACH);

    p.sellCards();

    expect(state.cards.length).toBe(cards.length - 3);
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
        testSellCards(cards, points);
    });

    it("sellCards - three different cards with wild card", function () {

        var cards = [deck.Infantry, deck.Cavalry, deck.WildCard];
        var points = deck.infantryPoints + deck.cavarlryPoints + deck.artilleryPoints;
        testSellCards(cards, points);
    });

    it("sellCards - three same cards with wild card", function () {

        var cards = [deck.Infantry, deck.Infantry, deck.WildCard];
        var points = deck.infantryPoints*3;
        testSellCards(cards, points);
    });

    it("sellCards - four cards with 3 same cards", function () {

        var cards = [deck.Infantry, deck.Infantry, deck.Infantry, deck.Cavalry];
        var points = deck.infantryPoints*3;
        testSellCards(cards, points);
    });

    it("sellCards - five cards with 3 same cards", function () {

        var cards = [deck.Infantry, deck.Infantry, deck.Infantry, deck.Cavalry, deck.Cavalry];
        var points = deck.infantryPoints*3;
        testSellCards(cards, points);
    });

    it("sellCards - five cards with 3 same cards (in different order)", function () {

        var cards = [deck.Cavalry, deck.Cavalry, deck.Infantry, deck.Infantry, deck.Infantry];
        var points = deck.infantryPoints*3;
        testSellCards(cards, points);
    });

    it("sellCards - five cards with 3 same cards and 3 different cards", function () {

        var cards = [deck.Cavalry, deck.Cavalry, deck.WildCard, deck.Infantry, deck.Infantry];
        var points = deck.cavarlryPoints*3;
        testSellCards(cards, points);
    });

    it("sellCards - five cards with 3 same cards and 3 different cards (in different order)", function () {

        var cards = [deck.Infantry, deck.Infantry, deck.WildCard, deck.Cavalry, deck.Cavalry];
        var points = deck.cavarlryPoints*3;
        testSellCards(cards, points);
    });
});