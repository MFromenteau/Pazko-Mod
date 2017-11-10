var Game = {};

// ************** INITIALISATION ****************
Game.init = function() {
  game.stage.disableVisibilityChange = true;
};

//preload all ressources, you can load it on the fly to but what can be preloaded should be here
Game.preload = function() {
  game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.spritesheet('tileset', 'assets/map/tilesheet.png', 32, 32);
  game.load.image('player', 'assets/sprites/player.png');
};

var upKey;
var downKey;
var leftKey;
var rightKey;

Game.create = function() {

  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.defaultRestitution = 0.9;

  Game.playerMap = {};
  var map = game.add.tilemap('map');
  map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
  var layer;
  for (var i = 0; i < map.layers.length; i++) {
    layer = map.createLayer(i);
  }

  layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer

  //from now on : on ANY input, send coordinate
  //layer.events.onInputUp.add(Game.getCoordinates, this);

  upKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
  downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  leftKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
  rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

  //function to notify of our presence on the Server
  /* NOTE : We dosen't exist in the game yet, we will instanciate our presence
  *  just before, or after everybody else. Cause the process is :
  *  - Me : I connected ! (emit('newplayer'))
  *  - Se : Ok here is your getCoordinates
  *  - Me : Got it ! displaying all that shit
  *  - Se : And here is all the players
  *  - Me : Got it ! displaying all that shit
  */
  Client.sendNewPlayer();
};

Game.update = function(){
  if (upKey.isDown)
    {
      Client.wantToMove("up");
    }
    else if (downKey.isDown)
    {
      Client.wantToMove("down");
    }

    if (leftKey.isDown)
    {
      Client.wantToMove("left");
    }
    else if (rightKey.isDown)
    {
      Client.wantToMove("right");
    }
}

// ************ GAME FUNCTIONS **********************

Game.getCoordinates = function(layer, pointer) {
  Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.addNewPlayer = function(id, x, y) {
  Game.playerMap[id] = game.add.sprite(x, y, 'player');
};

Game.movePlayer = function(data) {
  var player = Game.playerMap[data.id];
  var distance = Phaser.Math.distance(player.x, player.y, data.x, data.y);

  //Tween is to initaite a change over a period of time,
  // like a character moving or a sprite fading
  var tween = game.add.tween(player);
  var duration = distance * 10;
  tween.to({
    x: data.x,
    y: data.y
  }, duration);
  tween.start();
};

Game.removePlayer = function(id) {
  Game.playerMap[id].destroy();
  delete Game.playerMap[id];
};
