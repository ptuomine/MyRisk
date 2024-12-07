# Game Architecture

This document describes the architecture of the game and the role of each component.

## Rules of the Game

The game is a turn-based strategy game where players compete to conquer territories and continents. The objective is to eliminate all other players and control the entire game board.

### Game Setup

1. The game board is divided into continents, each containing multiple regions.
2. Players are assigned a color and start with a certain number of troops.
3. Each player is randomly assigned regions on the game board.

### Human and AI Players

- **Human Players:** Players controlled by real people.
- **AI Players:** Players controlled by the computer. The AI player logic is defined in the `src/aiplayer.js` file.

### How the Game is Played

1. **Initial Troop Placement:** Players take turns placing their initial troops on their assigned regions.
2. **Draft Phase:** At the beginning of each turn, players receive additional troops based on the number of regions and continents they control.
3. **Attack Phase:** Players can attack adjacent regions controlled by other players. Battles are resolved using the `src/battle.js` logic.
4. **Fortify Phase:** Players can move troops between their own adjacent regions.
5. **End Turn:** The turn ends, and the next player takes their turn.

## Components

### AI Player

- **File:** `src/aiplayer.js`
- **Description:** Represents an AI player in the game and provides a factory to create instances of AI players.

### Battle

- **File:** `src/battle.js`
- **Description:** Represents the Battle object that handles the battle logic between two regions.

### Game Canvas

- **File:** `src/canvas.js`
- **Description:** Represents the game canvas where the game board is displayed and provides methods to interact with the canvas.

### Card Deck

- **File:** `src/carddeck.js`
- **Description:** Represents the card deck used in the game and provides methods to initialize, draw, and check cards.

### Constants

- **File:** `src/consts.js`
- **Description:** Defines constants used throughout the game, including dimensions, player information, and game statistics.

### Continent

- **File:** `src/continent.js`
- **Description:** Represents a continent in the game and provides methods to manage regions and determine the owner of the continent.

### Game Board

- **File:** `src/gameboard.js`
- **Description:** Manages the game board, including building continents and regions, starting the game, and handling game phases.

### Game Controller

- **File:** `src/gamecontroller.js`
- **Description:** Manages the game state, player turns, and battle logic.

### Game Players

- **File:** `src/gameplayers.js`
- **Description:** Manages the players in the game, including creating player instances and resetting players.

### Game State

- **File:** `src/gamestate.js`
- **Description:** Manages the current state of the game and provides methods to start, initialize, and reset the game state.

### Main

- **File:** `src/main.js`
- **Description:** Initializes the game components and provides window functions to interact with the game.

### Player

- **File:** `src/player.js`
- **Description:** Represents a player in the game and provides methods to manage the player's state, regions, and cards.

### Player Stats

- **File:** `src/playerstats.js`
- **Description:** Manages the player statistics in the game and provides methods to update and reset player stats.

### Region

- **File:** `src/region.js`
- **Description:** Represents a region in the game and provides methods to manage troops, selection, and interactions with other regions.

### Utility

- **File:** `src/util.js`
- **Description:** Provides utility functions used throughout the game, such as shuffling arrays and checking uniqueness.
