# dungeon-crawler

<h1>Dungeon crawler game React</h1>

A four level dungeon crawler where you go around each floor collecting health potions and equipment while fighting enemies, the end goal being to defeat the boss on the bottom floor. Controls are simply the arrow keys, while all the pertinent game stats are displayed throughout. The difficulty goes up with each floor, but the game should never be impossible to beat, while also not being far too easy.

The enemies and items to collect are randomly placed on each floor, and apart from the outmost wall that is always generated, the walls are also randomly placed. Your position and the stairs to descend to the next floor (and the boss on the bottom floor) are also randomly placed. To prevent any tile being completely blocked (surrounded) by wall, we also remove any of the randomly placed walls around the non-wall entities, if generated.

<h3>Built with</h3>
<ul>
  <li>React</li>
  <li>Webpack</li>
  <li>Yarn</li>
</ul>

To run, load index.html in the public folder.

