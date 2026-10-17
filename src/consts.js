/**
 * Constants used throughout the game.
 * These constants define player information and game statistics. The map itself is in mapdata.js.
 */

var mapdata = require('./mapdata.js');

var noplayer = "FREE"
var players = [ "p1", "p2" ];
var player_count = 3;
var player_colors = ['#00af9d','#ffb652','#cd66cc','#66bc29','#0096db','#3a7dda','#ffe100'];

var total_regions = mapdata.continents.reduce((n, c) => n + c.regions.length, 0);
var total_troops_each = Math.floor(total_regions * 1.25); // whole troops only

var gamestats = ["player", "continents", "regions", "troops", "drafts", "cards"];

var exports = module.exports = {};

exports.PLAYERS = players;
exports.NOPLAYER = noplayer;
exports.PLAYER_COLORS = player_colors;
exports.TOTAL_TROOPS_EACH = total_troops_each;
exports.PLAYER_COUNT = player_count;
exports.GAMESTATS_HEADINGS = gamestats;
