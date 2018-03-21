import React from 'react';
import ReactDOM from 'react-dom';
import Map from './map';

export default class GameWindow extends React.Component {
    state = {
        // user data could be stored in the map component, but as the user
        // continues through each floor of the dungeon we leave it here instead
        user: {
            level: 1,
            hp: 100,
            atk: 5,
            def: 0,
            xp: 0,
            nextLvl: 33,
            weapon: 'fists',
            armour: 'loin cloth'
        },
        floor: 1,
        foggy: true,
        potionStrength: 20,
        weapons: [ // weapons do not increment by floor, they increment only when collected
            'fists',
            'dagger',
            'short sword',
            'candy coated in salmonella',
            "a giant's thumb tack"
        ],
        armour: [ // armour does not increment by floor, they increment only when collected
            'loin cloth',
            'XL t-shirt',
            'heavy wool onesie',
            'tin suit of armour',
            'tin suit of armour WITH LASERS'
        ]

        // need to add atk and def stats to equips
    }

    // increase experience
    gainExperience = (xpGained) => {
        this.setState((prevState) => ({
            user: {
                level: prevState.user.level,
                hp: prevState.user.hp,
                atk: prevState.user.atk,
                def: prevState.user.def,
                xp: prevState.user.xp + xpGained,
                nextLvl: prevState.user.nextLvl,
                weapon: prevState.user.weapon,
                armour: prevState.user.armour
            }
        }))
    }

    // increase health
    handleCollectPotion = () => {
        this.setState((prevState) => ({
            user: {
                level: prevState.user.level,
                hp: prevState.user.hp + prevState.potionStrength*(prevState.floor+1)/2,
                atk: prevState.user.atk,
                def: prevState.user.def,
                xp: prevState.user.xp,
                nextLvl: prevState.user.nextLvl,
                weapon: prevState.user.weapon,
                armour: prevState.user.armour
            }
        }));
    };

    // upgrade armour
    handleCollectArmour = () => {
        this.setState((prevState) => ({
            user: {
                level: prevState.user.level,
                hp: prevState.user.hp,
                atk: prevState.user.atk,
                def: Math.floor(1+prevState.user.def*5/2),
                xp: prevState.user.xp,
                nextLvl: prevState.user.nextLvl,
                weapon: prevState.user.weapon,
                armour: prevState.armour[prevState.armour.indexOf(prevState.user.armour)+1],
            }
        }));
    };

    // upgrade weapon
    handleCollectWeapon = () => {
        this.setState((prevState) => ({
            user: {
                level: prevState.user.level,
                hp: prevState.user.hp,
                atk: Math.floor(prevState.user.atk*5/3),
                def: prevState.user.def,
                xp: prevState.user.xp,
                nextLvl: prevState.user.nextLvl,
                weapon: prevState.weapons[prevState.weapons.indexOf(prevState.user.weapon)+1],
                armour: prevState.user.armour
            }
        }));
    };

    // take damage from an enemy attack, subtracting amount user defends
    // enemyAtk --- raw amount of damage enemy can give
    handleEnemyAttack = (enemyAtk) => {
        const damageTaken = enemyAtk - this.state.user.def;
        this.setState((prevState) => ({
            user: {
                level: prevState.user.level,
                hp: prevState.user.hp - damageTaken,
                atk: prevState.user.atk,
                def: prevState.user.def,
                xp: prevState.user.xp,
                nextLvl: prevState.user.nextLvl,
                weapon: prevState.user.weapon,
                armour: prevState.user.armour
            }
        }));
    };

    // move from one floor in the dungeon to another
    handleDescend = () => {
        this.setState((prevState) => {
            return ({
                floor: prevState.floor+1
            });
        });
    };

    // when user gets enough experience they level up, increasing hp, atk, and def
    // also changing how much experience is needed for the next level up
    handleLevelUp = () => {
        this.setState((prevState) => ({
            user: {
                level: prevState.user.level+1,
                hp: Math.floor(prevState.user.hp*1.2*prevState.user.level),
                atk: Math.floor(prevState.user.atk*1.3),
                def: Math.floor(prevState.user.def*1.2),
                xp: prevState.user.xp,
                nextLvl: Math.floor(prevState.user.nextLvl*2.4),
                weapon: prevState.user.weapon,
                armour: prevState.user.armour
            }
        }));
    }

    // if the user is hit to having no hit points remaining, reset the dungeon
    // for another attempt
    handleUserLoss = () => {
        this.setState(() => ({
            user: {
                level: 1,
                hp: 100,
                atk: 5,
                def: 0,
                xp: 0,
                nextLvl: 33,
                weapon: 'fists',
                armour: 'loin cloth'
            },
            floor: 1
        }), () => {
            return true;
        });
    }

    // allows the user to play with a foggy darkness blocking their view of the dungeon,
    // or an open view of the entire dungeon
    toggleFog = () => {
        const currentFog = this.state.foggy;
        this.setState(() => {
            return (
                {
                    foggy: !currentFog
                }
            )
        })
    }

    render() {
        return (
            <div className='center-panel'>
                <div className='header'>
                    <div className='title'>
                        <h1>React Rogue-like Dungeon Crawler</h1>
                    </div>
                    <div className='subtitle'>
                        <h3>Kill the boss in dungeon 4</h3>
                    </div>
                </div>
                <div className='game-window'>
                    <div className='game-data'>
                        <div className='user-data'>
                            <div className='column-display'>
                                <div className='user-datum user-level'>
                                    Level: {this.state.user.level}
                                </div>
                                <div className='user-datum userHP'>
                                    HP: {this.state.user.hp}
                                </div>
                            </div>
                            <div className='column-display'>
                                <div className='user-datum user-attack'>
                                    Atk: {this.state.user.atk}
                                </div>
                                <div className='user-datum user-def'>
                                    Def: {this.state.user.def}
                                </div>
                            </div>
                            <div className='column-display'>
                                <div className='user-datum user-xp'>
                                    XP: {this.state.user.xp}
                                </div>
                                <div className='user-datum user-next-level'>
                                    Next Level: {this.state.user.nextLvl}
                                </div>
                            </div>
                            <div className='column-display'>
                                <div className='user-datum user-weapon'>
                                    Weapon: {this.state.user.weapon}
                                </div>
                                <div className='user-datum user-defence'>
                                    Armour: {this.state.user.armour}
                                </div>
                            </div>
                        </div>
                        <div className='column-display'>
                            <div className='dungeon-floor'>
                                Floor: {this.state.floor}
                            </div>
                            <div className='toggle-button'>
                                <button className='button'
                                    onClick={() => this.child.handleFogToggle() }
                                >
                                    Toggle Fog
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='map-window'>
                        <Map
                            ref={instance => {this.child = instance; }}
                            gainExperience={this.gainExperience}
                            handleCollectArmour={this.handleCollectArmour}
                            handleCollectPotion={this.handleCollectPotion}
                            handleCollectWeapon={this.handleCollectWeapon}
                            handleEnemyAttack={this.handleEnemyAttack}
                            handleDescend={this.handleDescend}
                            handleLevelUp={this.handleLevelUp}
                            handleUserLoss={this.handleUserLoss}
                            toggleFog={this.toggleFog}
                            floor={this.state.floor}
                            foggy={this.state.foggy}
                            // user attack grows with both weapon upgrade and leveling up
                            userAtk={this.state.user.atk}
                            userDef={this.state.user.def}
                            userHP={this.state.user.hp}
                            userXP={this.state.user.xp}
                            userXPtoLevel={this.state.user.nextLvl}
                        />
                    </div>
                </div>
            </div>
        );
    };
}