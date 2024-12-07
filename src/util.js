/**
 * Utility functions used throughout the game.
 */
var Util = {
    /**
     * Shuffles an array in place.
     * @param {Array} array - The array to be shuffled.
     */
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },
    /**
     * Checks if all elements in an array are unique.
     * @param {Array} array - The array to be checked.
     * @returns {boolean} True if all elements are unique, otherwise false.
     */
    isAllUnique: function(array) {
        for (let i=0; i < array.length - 1;i++) {
            for (let j=i+1; j < array.length;j++) {
                if (array[i] == array[j]) return false;
            }
        }
        return true;
    }
}

module.exports = Util;
