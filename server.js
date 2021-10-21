require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io')

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page
app.route('/').get(function(req, res){
    res.sendFile(process.cwd() + '/views/index.html');
})

const portNum = process.env.PORT || 3000;

const server = app.listen(portNum, () => {
    console.log(`Listening on port ${portNum}`);
    if(process.env.NODE_ENV == 'test'){
        console.log('Running tests...')
        setTimeout(() => {
            try {
                console.log('Tessssssssst')
            } catch (error) {
                console.log('Tests are not valid');
                console.error(error)
            }
        }, 1500)
    }
});

// set io
const io = socket(server);

let currentPlayers = 0;
let arrayOfPlayers = [];
let collectibleItem;

const updatePlayersList = (player) => {
    arrayOfPlayers.map(p => {
        if(p.id == player.id){
            p.x = player.x; 
            p.y = player.y;
            p.score = player.score;
        }
    })
}

io.sockets.on('connection', socket => {
    currentPlayers++;
    console.log(`New connection: ${socket.id}, Current players: ${currentPlayers}`);

    // handle initial
    socket.emit('init', socket.id, arrayOfPlayers, collectibleItem);

    // handle update
    socket.on('update', (player, item) => {
        let playerIndex = arrayOfPlayers.map(p => p.id).indexOf(player.id)

        playerIndex == -1 ? arrayOfPlayers.push(player) : updatePlayersList(player);
        !collectibleItem || collectibleItem.id !== item.id ? collectibleItem = item : null;

        io.emit('update', arrayOfPlayers, collectibleItem)
    })

    // handle disconnect
    socket.on('disconnect', () => {
        
        arrayOfPlayers = arrayOfPlayers.filter(p => p.id !== socket.id);

        currentPlayers--;
        if(currentPlayers < 1){
            collectibleItem = null;
        }

        console.log(`${socket.id} disconnected. Current players: ${currentPlayers}`);

        socket.broadcast.emit('remove-player', socket.id);
    })

})