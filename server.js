var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

//We normally never have to make some other path other than this root
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(process.env.PORT || 8080,function(){
    console.log('Listening on '+server.address().port);
});

//*******GLOBAL VARS**************
server.lastPlayerID = 0;
//*******END OF GLOBAL VAR********

/* A NEW USER JUST CONNECTED HERE IS ALL THE EVENT HE CAN SEND US
*  This function from 'io' create an socket object on the connection
*  the socket represent the connection between sevrer and user
*/
io.on('connection',function(socket){

    // THis was arbitrary given by the dev, used client side too
    socket.on('newplayer',function(){

        /*We can give any attribute to the socket object and it will be specific to the sockets
        * here we create an object player which's linked to the the sockets
        * so we can say that socket.player is litterally the object materialisation of the User
        */

        console.log('create player id:'+server.lastPlayerID);
        socket.player = {
            id: server.lastPlayerID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };

        // This is to notify the User of all the player present on the server
        socket.emit('allplayers',getAllPlayers());

        // this is to notify all the player present on the server that this user as connected with this Object
        // NOTE : We don't send directly the socket, that qould be irresponsible, but just the "object" player
        socket.broadcast.emit('newplayer',socket.player);

        // THE USER JUST CLICKED
        socket.on('click',function(data){
            console.log(socket.player.id + ': click to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;

            /* We could have make the player move directly on the client side but here we
            *  want to wait that the server has correctly registered the position of the players
            *  and that send the computed player object to the client so that the client can move
            *  the player according to the server
            */
            io.emit('move',socket.player);
        });

        //THE USER FROM BEFORE JUST DISCONNECTED
        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

//pretty self explanatory
function getAllPlayers(){
    var players = [];

    // foreach active connections
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
