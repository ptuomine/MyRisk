/**
 * Represents an AI player in the game.
 */
function aiplayer() {

}

/**
 * Factory object to create instances of AI players.
 */
var AIPlayerFactory = {
    /**
     * Creates and returns a new instance of an AI player.
     * @returns {aiplayer} A new AI player instance.
     */
    GetAIPlayerInstance: function() {
        return new aiplayer();
    }
}
