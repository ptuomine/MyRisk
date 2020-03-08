var playerstates = [];

var GameState = {
    startGame: function() {

        playerstates.push({
            regions: [],
            continents: [],
            troops: 0,
            cards: 0
        })

    }
}

module.exports = GameState;