// use 'w' for wall, 's' for space, 'u' for user
// 'i' for item, 'g' for gold, 'p' for hp potion
// 'e' for enemy and (not every level) 'b' for boss
// 'a' for armour
// need another tile for decending a floor
map: [
    ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 'a', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 'p', 's', 's', 'i', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 'u', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 'e', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 's', 'w', 'w', 'w', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 'p', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 'p', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 'p', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 'e', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 's', 's', 's', 's', 's', 's', 's', 's', 'w', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'w'],
    ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
]

setMap = () => {
    // goes through map matrix and creates map
    let map = [];
    for (let i=0; i<this.state.mapHeight; i++ ) {
        for (let j=0; j<this.state.mapWidth; j++) {
            map.push(this.setTile(this.state.map[i][j]));
        };
    };
    return (
        <div className='map-wrapper'>
            {map}
        </div>
    );
}