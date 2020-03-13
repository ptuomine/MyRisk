var consts = require('./consts.js');
var deck = require('./carddeck.js');

function player(id, name, color) {
    var id = id;
    var name = name;
    var color = color;
    var state = {};
    var cardEarned = false;

    this.reset = function() {
        state.regions = [];
        state.continents = [];
        state.getTroopCount = function() {
            return state.regions.reduce((a,b) => a+b.getTroopCount(), 0);
        };
        state.cards = [];
        state.draft = consts.TOTAL_TROOPS_EACH;
        cardEarned = false;
    }

    this.addRegion = function(region) {
        state.regions.push(region);
        state.troops = state.troops + region.getTroopCount();
    }

    this.removeRegion = function(region) {
        state.regions = state.regions.filter(reg=>!reg.isSame(region));
    }

    this.addContinent = function(continent) {
        state.continents.push(continent);
    }

    this.removeContinent = function(continent) {
        state.continents = state.continents.filter(c=>continent.getId() != c.getId());
    }

    this.getName = function() {
        return name;
    }

    this.getColor = function() {
        return color;
    }

    this.getState = function() {
        return state;
    }

    this.setDraft = function(count) {
        state.draft = count;
    }

    this.isSame = function(p) {
        return p.getName() == this.getName();
    }

    this.isDead = function() {
        return state.regions.length == 0;
    }

    this.reduceDraft = function() {
        
        if (state.draft == 0) return false; // cannot reduce
        state.draft--;
        return true;

    }

    this.endTurn = function() {
        if (cardEarned) {
            var card = deck.getCard();
            state.cards.push(card);
        }

        cardEarned = false;
    }

    this.startTurn = function() {

        // Set the draft count
        var regionpoints = state.regions.length < 3 ? state.regions.length / 3 : 3;
        var continentpoints = state.continents.reduce((a,b) => a + b.getContinentPoints(), 0);
        state.draft += regionpoints + continentpoints;
    }

    this.AssignTroopsToRegions = function() {

        do {
            var randomregionindex = Math.floor(Math.random() * state.regions.length);
            var success = state.regions[randomregionindex].addTroops();
        } while (success);
    }

    this.cardEarned = function() {
        cardEarned = true;
    }
}

var consts = require('./consts.js');
var colors = consts.PLAYER_COLORS;
var playerid = 0;

var PlayerFactory = {
    getPlayerInstance: function() {
        
        if (playerid > colors.length - 1) return null; // no more colors left

        var color = colors[playerid];
        playerid++;
        var newplayer = new player(playerid, "player"+playerid, color);
        newplayer.reset();
        return newplayer;

    }
}

module.exports = PlayerFactory;