var Client = {};
Client.socket = io.connect();
// We connected to the server, but didn't sent any signal, we need to send
// a signal we agreed with the server to start all the process, here we chose the keyword 'newplayer'

//*********  EMITERS *****************
Client.sendTest = function() {
  console.log("test sent");
  Client.socket.emit('test');
};

Client.sendNewPlayer = function() {
  Client.socket.emit('newplayer');
};

Client.sendClick = function(x, y) {
  Client.socket.emit('click', {
    x: x,
    y: y
  });
};

Client.wantToMove = function(orientation) {
  switch (orientation) {
    case 'up':
      Client.socket.emit('req_move', {
        orientation: orientation,
        x: 0,
        y: -1
      });
      break;
    case 'down':
      Client.socket.emit('req_move', {
        orientation: orientation,
        x: 0,
        y: 1
      });
      break;
    case 'left':
      Client.socket.emit('req_move', {
        orientation: orientation,
        x: -1,
        y: 0
      });
      break;
    case 'right':
      Client.socket.emit('req_move', {
        orientation: orientation,
        x: 1,
        y: 0
      });
      break;
  }
};

//************* RECEPTIONERS ***************
Client.socket.on('newplayer', function(data) {
  Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function(data) {
  for (var i = 0; i < data.length; i++) {
    Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
  }

  /* 'move' and 'remove' could be written outside this function but that
  *  means it would be possible to remove a player from a list
  *  not yet received. SO always create your sender and receiver when they
  * need to be created, even it's inside another async events
  */
  Client.socket.on('move', function(data) {
    Game.movePlayer(data.id, data.x, data.y);
  });

  Client.socket.on('resp_move', function(data) {
    Game.movePlayer(data);
  });

  Client.socket.on('remove', function(id) {
    Game.removePlayer(id);
  });
});
