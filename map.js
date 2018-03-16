import React from 'react';
import ReactDOM from 'react-dom';
//import Enemy from './enemy';
//import User from './user';

export default class Map extends React.Component {
    state = {
        randMapHeight: 35,
        randMapWidth: 60,
        numberOfEnemies: 5, // constant to determine number of enemies for each floor
        enemyLookup: [], // once map is populated with enemies this stores their positions
        foggy: true // true if foggy, false if fog removed
    }

    // main action handler, when user moves left, right, up or down they either move if the tiles
    // is available, pickup an item if it was there or attack an enemy (which attacks back if able)
    // e --- the keypress event that is being handled
    handleAction = (e) => {
        e.preventDefault(); // scrolling the window while moving up or down is terrible UX
        const keyName = e.key;
        let newCol = this.state.userPosition.col;
        let newRow = this.state.userPosition.row;
        let tilesToFog = []; // only needed if foggy
        if (keyName === 'ArrowLeft' && this.state.userPosition.col > 0) {
            if (this.props.foggy) {
                tilesToFog = [[newRow-3, newCol], [newRow+3, newCol], 
                          [newRow-2, newCol+1], [newRow+2, newCol+1],
                          [newRow-1, newCol+2], [newRow+1, newCol+2],
                          [newRow, newCol+3]];
            }
            newCol = this.state.userPosition.col - 1;
        } else if (keyName === 'ArrowRight' && this.state.userPosition.col < this.state.randMapWidth-1) {
            if (this.props.foggy) {
                tilesToFog = [[newRow-3, newCol], [newRow+3, newCol], 
                          [newRow-2, newCol-1], [newRow+2, newCol-1],
                          [newRow-1, newCol-2], [newRow+1, newCol-2],
                          [newRow, newCol-3]];
            }
            newCol = this.state.userPosition.col + 1;
        } else if (keyName === 'ArrowDown' && this.state.userPosition.row < this.state.randMapHeight-1) {
            if (this.props.foggy) {
                tilesToFog = [[newRow, newCol-3], [newRow, newCol+3],
                          [newRow-1, newCol-2], [newRow-1, newCol+2],
                          [newRow-2, newCol-1], [newRow-2, newCol+1],
                          [newRow-3, newCol]];
            }
            newRow = this.state.userPosition.row + 1;
        } else if (keyName === 'ArrowUp' && this.state.userPosition.row > 0) {
            if (this.props.foggy) {
                tilesToFog = [[newRow, newCol-3], [newRow, newCol+3],
                          [newRow+1, newCol-2], [newRow+1, newCol+2],
                          [newRow+2, newCol-1], [newRow+2, newCol+1],
                          [newRow+3, newCol]];
            }
            newRow = this.state.userPosition.row - 1;
        }

        // remove undefined 'tiles' from the actionable map (when near a wall)
        let insideTiles = [];
        for (let i=0; i < tilesToFog.length; i++) {
            if (tilesToFog[i][0] > -1 && tilesToFog[i][1] > -1) {
                insideTiles.push(tilesToFog[i]);
            }
        }
        tilesToFog = insideTiles;

        // update map as necessary
        const moveToTileType = this.state.randMap[newRow][newCol];
        if (moveToTileType !== 'w' && moveToTileType !== 'u') {
            // the latter condition prevents non-arrow keypresses from attempting anything
            let canMove = true; // false only if moving to an enemy without killing it
            if (moveToTileType === 'e' || moveToTileType === 'b') {
                if (moveToTileType === 'e') {
                    canMove = this.handleAttackEnemy(newRow, newCol);
                } else { // boss
                    canMove = this.handleAttackBoss();
                    if (!canMove) { // boss is still alive
                        this.handleBossAttack();
                    }
                }
            }
            if (canMove) {
                let newMap = this.state.randMap;
                newMap[newRow][newCol] = 'u';
                newMap[this.state.userPosition.row][this.state.userPosition.col] = 's';
                if (this.props.foggy) { // only when fog is up
                    newMap = this.setFogVisibilty(newRow, newCol, newMap);
                    for (let i=0; i < tilesToFog.length; i++) {
                        if (newMap[tilesToFog[i][0]] !== undefined) {
                            newMap[tilesToFog[i][0]][tilesToFog[i][1]] = 
                            this.handleNotFogToFog(newMap[tilesToFog[i][0]][tilesToFog[i][1]]);
                        }
                    }
                }

                this.setState(() => {
                    return {
                        randMap: newMap,
                        userPosition: {
                            row: newRow,
                            col: newCol
                        }
                    };
                });
                // now that we have moved, adjust hp or weapon if necessary
                if (moveToTileType === 'a') {
                    this.handleCollectArmour();
                } else if (moveToTileType === 'i') {
                    this.handleCollectWeapon();
                } else if (moveToTileType === 'p') {
                    this.handleCollectPotion();
                } else if (moveToTileType === 'x') {
                    this.handleDescend();
                }
            }
        }
    }

    // test if array coords are pairwise equal
    // startPart, mapPart --- both arrays
    positionIsEqual = (statePart, mapPart) => {
        let isEqual = true;
        for (let i=0; i < statePart.length; i++) {
            if (statePart[i] !== mapPart[i]) {
                isEqual = false;
            }
        }
        return isEqual;
    }

    // When the user attacks an enemy, deal damage and take damage (if the enemy is alive)
    // (row, col) --- the enemy position on the map state
    handleAttackEnemy = (row, col) => {
        // find which enemy in the state is being attacked and attack
        let currentEnemy = undefined;
        let currentEnemyName = undefined;
        currentEnemy = this.state.enemy1;

        for (let i=1; i < Math.floor(this.state.numberOfEnemies*Math.pow(1.5, this.props.floor-1))+1; i++ ) {
            const isEqual = this.positionIsEqual(this.state.enemyLookup[i-1], [row, col]);
            if (isEqual) {
                currentEnemyName = ['enemy'] + i;
                currentEnemy = this.state[currentEnemyName];
            }
        };

        // set user attack based off their attack stat
        const userAtk = this.props.userAtk + (Math.floor(3*Math.random()) - 1);

        if (userAtk >= currentEnemy.hp - this.state.enemy.def) {
            // gain xp
            this.props.gainExperience(this.state.enemy.xpGiven);
            if (this.props.userXP > this.props.userXPtoLevel) {
                // level up
                this.props.handleLevelUp();
            }
            return true; // enemy defeated, move successfully
        } else {
            this.setState(() => {
                return ({
                    [currentEnemyName]: {
                        hp: currentEnemy.hp - userAtk + this.state.enemy.def,
                        row: currentEnemy.row,
                        col: currentEnemy.col
                    }
                })
            }, () => { // enemy survived user attack and attacks back
                this.handleEnemyAttack();
            });
            
            return false; // enemy not defeated, stats updated
        }
    }

    // When the user attacks the boss, deal damage and take damage (if the enemy is alive)
    handleAttackBoss = () => {
        // make user attack somewhat random based on atk stat
        const userAtk = this.props.userAtk + (Math.floor(3*Math.random()) - 1);
        if (userAtk >= this.state.boss.hp - this.state.boss.def) {
            // win message
            alert("Hurrah!");
            // despawn boss tile
            let winMap = this.state.randMap;
            winMap[this.state.boss.row][this.state.boss.col] = 's';
            winMap[this.state.boss.row+1][this.state.boss.col] = 's';
            winMap[this.state.boss.row+1][this.state.boss.col+1] = 's';
            winMap[this.state.boss.row][this.state.boss.col+1] = 's';

            return true;
        } else {
            this.setState((prevState) => {
                return ({
                    boss: {
                        hp: prevState.boss.hp - userAtk + prevState.boss.def,
                        atk: prevState.boss.atk,
                        def: prevState.boss.def,
                        row: this.state.boss.row,
                        col: this.state.boss.col
                    }
                });
            });
        }
    }

    // User takes damage from an enemy, loses if HP is 0 or below
    handleEnemyAttack = () => {
        // make enemy attack somewhat random based on atk stat
        const enemyAtk = this.state.enemy.atk + (Math.floor(3*Math.random()) - 1);
        if (this.props.userHP <= enemyAtk - this.props.userDef) {
            // user dead
            this.userLost();
        } else {
            this.props.handleEnemyAttack(enemyAtk)
        }
    }

    // User takes damage from the boss, loses if HP is 0 or below
    handleBossAttack = () => {
        // make boss attack somewhat random based on atk stat
        const bossAtk = this.state.boss.atk + (Math.floor(3*Math.random()) - 1);
        if (this.props.userHP <= bossAtk - this.props.userDef) {
            // user dead
            this.userLost();
        } else {
            this.props.handleEnemyAttack(bossAtk);
        }
    }

    // Item collection
    handleCollectArmour = () => {
        this.props.handleCollectArmour();
    }

    handleCollectPotion = () => {
        this.props.handleCollectPotion();
    }

    handleCollectWeapon = () => {
        this.props.handleCollectWeapon();
    }

    // When the user hits the exit tile and descends a floor in the dungeon
    handleDescend = () => {
        this.props.handleDescend();
        this.initializeNewMap();
        // reset fog
        this.handleFogToggle();
        this.handleFogToggle();
    }

    // Create the JSX map from randMap in state for rendering
    setRandMap = () => {
        let map = [];
        for (let i=0; i <= this.state.randMapHeight-1; i++) {
            for (let j=0; j <= this.state.randMapWidth; j++) {
                map.push(this.setTile(this.state.randMap[i][j], [i,j]));
            }
        }

        return (
            <div className='map-wrapper'>
                {map}
            </div>
        );
    }

    // Takes an individusal string an returns the corresponding JSX for the type
    // of tile to render on the map
    // tileType --- string
    // key --- unique key to distinguish the JSX elements from all others created
    setTile = (tileType, keyParam) => {
        let tile = undefined;
        if (tileType === 'a') {
            tile = <div className='armour-tile tile' key={keyParam}></div>;
        } else if (tileType === 'a-fog') {
            tile = <div className='armour-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 'b') {
            tile = <div className='boss-tile tile' key={keyParam}></div>;
        } else if (tileType === 'b-fog') {
            tile = <div className='boss-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 'e') {
            tile = <div className='enemy-tile tile' key={keyParam}></div>;
        } else if (tileType === 'e-fog') {
            tile = <div className='enemy-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 'i') {
            tile = <div className='item-tile tile' key={keyParam}></div>;
        } else if (tileType === 'i-fog') {
            tile = <div className='item-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 'p') {
            tile = <div className='hp-tile tile' key={keyParam}></div>;
        } else if (tileType === 'p-fog') {
            tile = <div className='hp-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 's') {
            tile = <div className='blank-tile tile' key={keyParam}></div>;
        } else if (tileType === 's-fog') {
            tile = <div className='blank-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 'u') { // never foggy
            tile = <div className='user-tile tile' key={keyParam}></div>;
        } else if (tileType === 'w') {
            tile = <div className='wall-tile tile' key={keyParam}></div>;
        } else if (tileType === 'w-fog') {
            tile = <div className='wall-tile tile fog-tile' key={keyParam}></div>;
        } else if (tileType === 'x') {
            tile = <div className='stair-tile tile' key={keyParam}></div>
        } else if (tileType === 'x-fog') {
            tile = <div className='stair-tile tile fog-tile' key={keyParam}></div>
        }

        return (
            tile
        );
    }

    // returns a random set of coordinates on the map, excluding the outer wall,
    // that are not occupied by any entity
    // map --- the map to return coordinates on
    // boss --- an integer multiplier to determine if the outer layer to avoid is
    // one tile in width, or two
    getRandomInteriorCoords = (map, boss) => {
        // only return coordinates that are on an open space
        let openSpace = false;
        let randomRow = undefined;
        let randomCol = undefined;

        while (!openSpace) {
            // cannot return 0 or maximum value, or maximum value - 1 with a boss
            randomRow = 1 + Math.floor((this.state.randMapHeight-1*boss)*Math.random());
            randomCol = 1 + Math.floor((this.state.randMapWidth-1*boss)*Math.random());
            if ((map[randomRow][randomCol] === 's' || map[randomRow][randomCol] === 's-fog') && 
              boss === 1) {
                openSpace = true;
            } else if (boss === 2) {
                if ((map[randomRow][randomCol] === 's' || map[randomRow][randomCol] === 's-fog') &&
                  (map[randomRow+1][randomCol] === 's' || map[randomRow+1][randomCol] === 's-fog') &&
                  (map[randomRow+1][randomCol+1] === 's' || map[randomRow+1][randomCol+1] === 's-fog') &&
                  (map[randomRow][randomCol+1] === 's' || map[randomRow][randomCol+1] === 's-fog')) {
                    openSpace = true;
                }
            }
        }

        return [randomRow, randomCol];
    }

    // for use with surroundWithSpace() below, small for clearing walls away from
    // single tiles entities, and a large one for the boss in-line with the boss
    // initialization code
    // (row, col) --- pair of integers
    smallSurroundingSpace = (row, col) => {
        return [[row-1, col], [row+1, col], [row, col-1], [row, col+1]];
    }

    // remove surrounding walls around map[row][col] unless it is the outer wall
    // which should remain
    // tiles --- a collection (array) of arrays
    // map --- the map being searched to clear
    surroundWithSpaces = (tiles, map) => {
        for (let i=0; i < tiles.length; i++) {
            if ((map[tiles[i][0]][tiles[i][1]] === 'w' || 
                map[tiles[i][0]][tiles[i][1]] === 'w-fog') &&
                tiles[i][0] !== 0 && tiles[i][1] !== 0 &&
                tiles[i][0] !== this.state.randMapHeight-1 &&
                tiles[i][1] !== this.state.randMapWidth-1 ) {
                map[tiles[i][0]][tiles[i][1]] = (this.props.foggy ? 's-fog' : 's');
            }
        }
    }

    // Take any foggy tile and return the not foggy equivalent
    // tile --- a string
    handleFogToNotFog = (tile) => {
        let notFoggyTile = undefined;
        if (tile === 'a-fog') {
            notFoggyTile = 'a';
        } else if (tile === 'b-fog') {
            notFoggyTile = 'b';
        } else if (tile === 'e-fog') {
            notFoggyTile = 'e';
        } else if (tile === 'i-fog') {
            notFoggyTile = 'i';
        }  else if (tile === 'p-fog') {
            notFoggyTile = 'p';
        } else if (tile === 's-fog') {
            notFoggyTile = 's';
        } else if (tile === 'u') {
            // do nothing to user tile
            notFoggyTile = 'u';
        } else if (tile === 'w-fog') {
            notFoggyTile = 'w';
        }  else if (tile === 'x-fog') {
            notFoggyTile = 'x';
        } else {
            notFoggyTile = tile;
        }

        return notFoggyTile
    }

    // Take any not foggy tile and return the foggy equivalent
    // tile --- a string
    handleNotFogToFog = (tile) => {
        let foggyTile = undefined;
        if (tile === 'a') {
            foggyTile = 'a-fog';
        } else if (tile === 'b') {
            foggyTile = 'b-fog';
        } else if (tile === 'e') {
            foggyTile = 'e-fog';
        } else if (tile === 'i') {
            foggyTile = 'i-fog';
        } else if (tile === 'p') {
            foggyTile = 'p-fog';
        } else if (tile === 's') {
            foggyTile = 's-fog';
        } else if (tile === 'u') {
            // do nothing to user tile
            foggyTile = 'u';
        } else if (tile === 'w') {
            foggyTile = 'w-fog';
        } else if (tile === 'x') {
            foggyTile = 'x-fog';
        } else { // 
            foggyTile = tile;
        }

        return foggyTile;
    }

    // Takes any position on the map windows and returns a small cloud of
    // tiles surrounding the given position, all without the foggy attribute
    // (userRow, userCol) --- pair of integers
    // map --- the map to clear tiles around the coordinates above
    setFogVisibilty = (userRow, userCol, map) => {
        const visibleCloud = [
            [userRow-1, userCol], [userRow+1, userCol],
            [userRow, userCol-1], [userRow, userCol+1],
            [userRow-1, userCol-1], [userRow-1, userCol+1],
            [userRow+1, userCol-1], [userRow+1, userCol+1]
        ];

        // only add the tiles on the sides if you are not near an outer wall
        if (userRow > 1) {
            visibleCloud.push([userRow-2, userCol+1], [userRow-2, userCol-1], [userRow-2, userCol]);
            if (userRow > 2) {
                visibleCloud.push([userRow-3, userCol]);
            }
        }
        if (userRow < this.state.randMapHeight-2) {
            visibleCloud.push([userRow+2, userCol], [userRow+2, userCol+1], [userRow+2, userCol-1]);
            if (userRow < this.state.randMapHeight-3) {
                visibleCloud.push([userRow+3, userCol])
            }
        }

        if (userCol > 1) {
            visibleCloud.push([userRow+1, userCol-2], [userRow-1, userCol-2], [userRow, userCol-2]);
            if (userCol > 0) {
                visibleCloud.push([userRow, userCol-3]);
            }
        }
        if (userCol < this.state.randMapWidth-1) {
            visibleCloud.push([userRow+1, userCol+2], [userRow-1, userCol+2], [userRow, userCol+2]);
            if (userCol < this.state.randMapWidth) {
                visibleCloud.push([userRow, userCol+3])
            }
        }

    for (let i=0; i < visibleCloud.length; i++) {
        map[visibleCloud[i][0]][visibleCloud[i][1]] = 
            this.handleFogToNotFog(map[visibleCloud[i][0]][visibleCloud[i][1]]);
    }

    return map;
    }

    // Swap the entire map window from foggy to not foggy and vice versa
    handleFogToggle = () => {
        const currentFog = this.props.foggy;
        let map = this.state.randMap;
        if (currentFog) { // foggy, clear things up
            for (let i=0; i < this.state.randMapHeight; i++) {
                for (let j=0; j < this.state.randMapWidth; j++) {
                    // leave a small visible window around user tile
                    map[i][j] = this.handleFogToNotFog(map[i][j]);
                }
            }
        } else { // not foggy, fog it up
            for (let i=0; i < this.state.randMapHeight; i++) {
                for (let j=0; j < this.state.randMapWidth; j++) {
                    map[i][j] = this.handleNotFogToFog(map[i][j]);
                }
            }
            // add fog visibility window back
            map = this.setFogVisibilty(this.state.userPosition.row, this.state.userPosition.col, map);
        }
        this.setState(() => {
            return (
                {
                    randMap: map
                }
            )
        });
        this.props.toggleFog();
    }

    // On startup and each floor descent this initializes a new dungeon floor
    // The outer layer is always wall, and the inside is populated at random
    // The items to be placed on the map are all given their properties based on
    // the current floor being initialized and there are safety check methods to
    // make sure no tiles are closely surrounded (and inaccesible!) by wall tiles
    // It is still possible for an entity to be surrounded by a wall, but this
    // requires at least 3 tiles (in a corner), 5 tiles (on the wall) or or 8 tiles
    // elsewhere on the map placed next to one another, which is respectively a
    // 4/(58*33)*1/(13^3) ~  9.5*10^(-7)
    // 2*(31+56)/(58*33)*1/(13^5) ~ 2.4*10^(-7)
    // 1/(13^-8) ~ 1.2*10^(-9)
    // and should not occur more than once ever 10 million loads, so in the spirit of
    // traditional roguelike dungeon crawlers where you could (frustratingly!) almost
    //  never win, this is certainly acceptable!
    initializeNewMap = () => {
        // first set the matrix containing the data for the map,
        // ensure the dugeon has a wall
        let startMap = new Array(this.state.randMapHeight);
        startMap[0] = new Array(this.state.randMapWidth).fill('w-fog');
        for (let i=1; i < this.state.randMapHeight-1; i++) {
            startMap[i] = new Array(this.state.randMapWidth).fill('s-fog');
            startMap[i][0] = 'w-fog';
            startMap[i][this.state.randMapWidth-1] = 'w-fog';
        }
        startMap[this.state.randMapHeight-1] = new Array(this.state.randMapWidth).fill('w-fog');
        
        // randomly set wall tiles inside the dungeon
       for (let i=1; i < this.state.randMapHeight-1; i++) {
           for (let j=1; j < this.state.randMapWidth-1; j++) {
               if (Math.random() > 0.87) {
                   startMap[i][j] = 'w-fog';
               }
           }
       }
       
        // set starting coordinates for user
        let [userRow, userCol] = this.getRandomInteriorCoords(startMap, 1);
        // get starting coordinates for a weapon on the map
        let [weaponRow, weaponCol] = this.getRandomInteriorCoords(startMap, 1);
        // get starting coordinates for armour on the map
        let [armourRow, armourCol] = this.getRandomInteriorCoords(startMap, 1);
        // get starting coordinates for hp potions
        let [hp1Row, hp1Col] = this.getRandomInteriorCoords(startMap, 1);
        let [hp2Row, hp2Col] = this.getRandomInteriorCoords(startMap, 1);
        let [hp3Row, hp3Col] = this.getRandomInteriorCoords(startMap, 1);
        let [hp4Row, hp4Col] = this.getRandomInteriorCoords(startMap, 1);
        let [hp5Row, hp5Col] = this.getRandomInteriorCoords(startMap, 1);
        
        startMap[userRow][userCol] = 'u';
        startMap[weaponRow][weaponCol] = 'i-fog';
        startMap[armourRow][armourCol] = 'a-fog';
        startMap[hp1Row][hp1Col] = 'p-fog';
        startMap[hp2Row][hp2Col] = 'p-fog';
        startMap[hp3Row][hp3Col] = 'p-fog';
        startMap[hp4Row][hp4Col] = 'p-fog';
        startMap[hp5Row][hp5Col] = 'p-fog';

        // ensure none of the spaces are obstructed by walls or other items
        this.surroundWithSpaces(this.smallSurroundingSpace(userRow, userCol), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(weaponRow, weaponCol), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(armourRow, armourCol), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(hp1Row, hp1Col), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(hp2Row, hp2Col), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(hp3Row, hp3Col), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(hp4Row, hp4Col), startMap);
        this.surroundWithSpaces(this.smallSurroundingSpace(hp5Row, hp5Col), startMap);

        // get position for exit if on floors 1, 2 or 3
        if (this.props.floor < 4) {
            let [exitRow, exitCol] = this.getRandomInteriorCoords(startMap, 1);
            startMap[exitRow][exitCol] = 'x-fog';
            this.surroundWithSpaces(this.smallSurroundingSpace(exitRow, exitCol), startMap);
        }

        let enemyLookup = [];
        // get starting coordinates for enemies
        for (let i=1; i < Math.floor(5*Math.pow(1.5, this.props.floor-1))+1; i++) {
            let [enemyRow, enemyCol] = this.getRandomInteriorCoords(startMap, 1);
            startMap[enemyRow][enemyCol] = 'e-fog';
            // ensure enemies are not obstructed by walls
            this.surroundWithSpaces(this.smallSurroundingSpace(enemyRow, enemyCol), startMap);
            enemyLookup.push([enemyRow, enemyCol]);
            this.setState((prevState) => {
                return (
                    {
                        ["enemy" + i]: {
                            hp: Math.floor(20*Math.pow(Math.pow(1.5, this.props.floor-1), 2)),
                            row: enemyRow,
                            col: enemyCol
                        },
                    }
                );
            });
        }

        // Now set the visible cloud in the fog
        startMap = this.setFogVisibilty(userRow, userCol, startMap);

        // set all the above character coordinates to state
        this.setState(() => {
            return ({
                enemy: {
                    atk: Math.floor(Math.pow(3.5,this.props.floor)),
                    def: 1*this.props.floor,
                    xpGiven: 7*this.props.floor,
                    numberOfEnemies: 5
                },
                enemyLookup: enemyLookup,
                userPosition: {
                    row: userRow,
                    col: userCol
                },
                randMap: startMap
            });
        });
        
        // if only 4th floor, add boss info to state as well
        // get position for boss if on floor 4
        if (this.props.floor === 4) {
            let [bossRow, bossCol] = this.getRandomInteriorCoords(startMap, 2);
            startMap[bossRow][bossCol] = 'b';
            startMap[bossRow+1][bossCol] = 'b';
            startMap[bossRow+1][bossCol+1] = 'b';
            startMap[bossRow][bossCol+1] = 'b';
            // boss requires its own surround with space function
            const surroundingTiles = [[bossRow-1, bossCol], [bossRow-1, bossCol+1],
                [bossRow+2, bossCol], [bossRow+2, bossCol+1], [bossRow, bossCol-1],
                [bossRow+1, bossCol-1], [bossRow, bossCol+2], [bossRow+1, bossCol+2]];
            this.surroundWithSpaces(surroundingTiles, startMap);
            this.setState(() => {
                return (
                    {
                        boss: {
                            hp: 300,
                            atk: 75,
                            def: 17,
                            row: bossRow,
                            col: bossCol
                        }
                    }
                );
            });
        }
    }

    // When user loses, i.e., hp <= 0, alert defeat and reset dungeon for
    // another attempt if they would like
    userLost = () => {
        alert('Not your proudest moment... to play again, click OK');
        const reset = this.props.handleUserLoss();
        setTimeout(() => {
            this.initializeNewMap();
            // reset fog
            this.handleFogToggle();
            this.handleFogToggle();
        }, 100);
    }

    // initial map generation on page load
    componentWillMount = () => {
        this.initializeNewMap();
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.handleAction);
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.handleAction);
    }

    render() {
        return (
            <div>
                {this.setRandMap()}
                <div className='legend'>
                    <h4>Legend</h4>
                    <div className='legend-contents'>
                        <div className='user-tile tile'></div>You, the hero!
                        <div className='item-tile tile'></div>Equipment (Armour/Weapon)
                        <div className='hp-tile tile'></div>HP Potion
                        <div className='enemy-tile tile'></div>Enemy
                        <div className='stair-tile tile'></div>Stairs
                    </div>
                </div>
            </div>
        );
    }
}