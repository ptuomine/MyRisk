# Game Architecture

This document describes the architecture of the game and the role of each component.

## Rules of the Game

The game is a turn-based strategy game where players compete to conquer territories and continents. The objective is to eliminate all other players and control the entire game board.

### Game Setup

1. The map has six continents of different sizes (3 to 5 regions, 24 regions in all). Regions border each other by land, and dashed sea routes connect continents. Holding a whole continent gives its bonus troops (shown next to its name) each turn.
2. Players are assigned a color and start with a certain number of troops.
3. Each player is randomly assigned regions on the game board.

### Human and AI Players

- **Human Players:** Players controlled by real people.
- **AI Players:** Players controlled by the computer. The AI player logic is defined in the `src/aiplayer.js` file.

### How the Game is Played

1. **Initial Troop Placement:** Players take turns placing their initial troops on their assigned regions.
2. **Draft Phase:** At the beginning of each turn, players receive new troops: 1 for every 2 regions they own (rounded down, at least 3), plus the bonus of every continent they hold in full. The move list shows the breakdown, e.g. "player1 gets 7 troops: 4 for 8 regions + 3 for Nordhavn". The numbers are `REGIONS_PER_TROOP` and `MIN_REINFORCEMENTS` in `src/consts.js`.
3. **Attack Phase:** Players can attack adjacent regions controlled by other players. Battles are resolved using the `src/battle.js` logic.
4. **Move Phase:** After attacking (or instead of attacking), press **Move Troops**. Tap one of your regions, then tap any of your regions connected to it through an unbroken chain of your own regions (land borders or sea routes) to move one troop per tap. Those regions light up; tap the first region again to put it down. At least one troop always stays behind. No more attacks are allowed after moving.
5. **End Turn:** The turn ends, and the next player takes their turn.

## Components

### AI Player

- **File:** `src/aiplayer.js`
- **Description:** Represents an AI player in the game and provides a factory to create instances of AI players.
- **Difficulty:** Easy, Normal or Hard, chosen on the page (remembered in the browser) and read at the start of each computer turn. No level cheats; they differ only in how well they play (see `LEVELS` in `src/aiplayer.js`). Easy places many troops at random, attacks only with a margin of 3+, takes at most one region a turn and never moves troops. Normal places some troops at random, wants a margin of 2+, takes at most 3 regions a turn. Hard plays its best, keeps attacking while it can win, goes after whoever holds the most regions and blocks anyone one region away from a whole continent. Against a scripted player that places on its strongest border and attacks whenever it can win, the scripted player won about 9 in 10 games on Easy, about half on Normal and about 1 in 15 on Hard.
- **How it plays:** `src/main.js` starts a computer turn automatically whenever a player marked as AI is in turn, and ends the turn when it finishes. Because battles have no dice (an attack wins exactly when attacking troops - 1 > defending troops), the AI never makes a losing attack. Each turn it:
  1. Trades cards for troops when it has a valid set.
  2. Places troops one at a time on the region that best sets up a winning attack, valuing targets that complete a continent, break an enemy continent bonus or knock a player out. If no attack is in reach, it reinforces its most threatened border.
  3. Attacks while it has winning attacks worth making. The first win earns a card; after that it stops when the remaining attacks would leave it too thin.
  4. Moves troops from inner regions (no enemy neighbours) straight to the connected border region that is most outnumbered.

### Battle

- **File:** `src/battle.js`
- **Description:** Represents the Battle object that handles the battle logic between two regions.

### Game Canvas

- **File:** `src/canvas.js`
- **Description:** Draws the map as an SVG picture (sea, sea routes, continents, and a top layer for region names) and enables or disables the action buttons.

### Card Deck

- **File:** `src/carddeck.js`
- **Description:** Represents the card deck used in the game and provides methods to initialize, draw, and check cards.
- **Trading:** You earn a card at the end of any turn in which you conquered a region. In the Draft step you can trade a set of 3 cards for extra troops: three of a kind, or one of each type (Infantry 2, Cavalry 3, Artillery 4 points; a Wild card stands in for any type). The set is worth the sum of its points. `Player.getBestTrade()` tries every combination of 3 cards and picks the most valuable set. When you knock a player out, you take all their cards. If that gives you a set, you can trade straight away, even in the middle of attacking: trading takes you back to the Draft step to place the troops, then tap Attack to keep going. Computer players do the same.

### Constants

- **File:** `src/consts.js`
- **Description:** Defines constants used throughout the game, including dimensions, player information, and game statistics.

### Continent

- **File:** `src/continent.js`
- **Description:** Represents a continent in the game and provides methods to manage regions and determine the owner of the continent.

### Map Data

- **Files:** `src/mapdata.js` (generated), `tools/genmap.js` (generator)
- **Description:** The continents, region shapes (SVG paths), region neighbours and sea routes. Do not edit `mapdata.js` by hand: change the continent list, names, bonuses or sea routes in `tools/genmap.js` and run `node tools/genmap.js`, then `npm run build`. The generator draws each continent as a blob-shaped landmass and splits it into regions around seed points (a Voronoi diagram), which gives regions of different sizes and shapes. It also checks that every region has a neighbour and that the whole map is connected.

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
- **Description:** Represents a region on the map (an SVG shape with a troop badge and a name) and provides methods to manage troops, selection and target highlighting. `canAttack` checks the region's neighbour list from the map data; the same rule applies to moving troops.

### Turn Panel

- **File:** `src/turnpanel.js`
- **Description:** The bar above the map. It shows whose turn it is (in that player's colour, and whether a person or the computer is playing), a phase stepper (Draft → Attack → Move → End turn) with the current phase outlined and the usual next step highlighted, and a hint saying what to do next (for example "Place 4 more troops" or "Ulvik → Skarholm: 8 attacking vs 4 defending"). The Attack! button appears once both regions are picked; Trade cards appears when you have a set. It redraws whenever the stats or a selection change.

### Utility

- **File:** `src/util.js`
- **Description:** Provides utility functions used throughout the game, such as shuffling arrays and checking uniqueness.
