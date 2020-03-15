var player = require('../src/player');
var consts = require('../src/consts');
var deck = require('../src/carddeck');
// var proxyquire = require('proxyquire');

// var player = proxyquire('../src/player', {'carddeck': carddeckstub });
// carddeckstub.getCard = function() {
//     return deck.Infantry;
// };

describe("player tests", function() {
    var a;
  
    it("getPlayerInstance", function() {


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

    it("sellCards", function() {
        var p = player.getPlayerInstance();
        p.cardEarned();
        p.endTurn();
        p.cardEarned();
        p.endTurn();
        p.cardEarned();
        p.endTurn();

        var state = p.getState();

        expect(state.cards.length).toBe(3);
        expect(state.draft).toBe(consts.TOTAL_TROOPS_EACH);

        p.sellCards();

        expect(state.cards.length).toBe(0);
        expect(state.draft).toBe(consts.TOTAL_TROOPS_EACH + deck.infantryPoints * 3);
    });
});