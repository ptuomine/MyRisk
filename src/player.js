var emptystate = {
    regions: [],
    continents: [],
    troops: 0,
    cards: 0
};

function player(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.state = emptystate;

    this.reset = function() {
        this.state = emptystate;
    }

    this.addRegion = function(region) {
        regions.push(region);
    }

    this.addContinent = function(continent) {
        continents.push(continent);
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
        return newplayer;

    }
}

module.exports = PlayerFactory;