import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

// var for color and text
const bgColor = '#04C5D4';
const strokeColor = '#FFF';
const textColor = strokeColor;
const playerColor = 'rgb(230,0,19)';
const enemyColor = 'rgb(204,5,185)';
const eyesColor = '#fff';
const itemColor = 'rgb(255, 255, 0)';
const fontStyle = `16px 'Press Start 2P'`;

// var for measure and others
const widthArea = canvas.width;
const heightArea = canvas.height;
const borderTop = 50;
const borderOthers = 10;
const pixels = 2;
const speed = 10;
const borderLine = borderOthers - 3;

let player;
let item;
let arrayOfPlayers;

document.addEventListener('DOMContentLoaded', function() {
    
    // handle init
    socket.on('init', (id, playersArr, collectibleItem) => {
        arrayOfPlayers = [...playersArr];

        let [posPlayerX, posPlayerY] = getRandomPosition(playerObj.width*pixels, playerObj.height*pixels);
        player = new Player({ x: posPlayerX, y: posPlayerY, score: 0, id, dimension:[playerObj.width*pixels, playerObj.height*pixels] });

        arrayOfPlayers.push(player);

        if(!collectibleItem){
            let [posItemX, posItemY] = getRandomPosition(collectibleObj.width*pixels, collectibleObj.height*pixels);
            item = new Collectible({
                x: posItemX, y: posItemY, value: 1, id: Date.now(), dimension: [collectibleObj.width*pixels, collectibleObj.height*pixels]
            })
        } else {
            item = new Collectible({
                x: collectibleItem.x, y: collectibleItem.y, value: collectibleItem.value, id: collectibleItem.id, dimension: collectibleItem.dimension
            });
        }

        window.requestAnimationFrame(update);
        socket.emit('update', player, item);

        // handle movement
        document.onkeydown = e => {
            let dir = null;
            switch (e.key) {
                case 'ArrowUp':
                    dir = 'up';
                    break;
                case 'ArrowDown':
                    dir = 'down';
                    break;
                case 'ArrowLeft':
                    dir = 'left';
                    break;
                case 'ArrowRight':
                    dir = 'right';
                    break;
            }

            if(dir){
                let currItem = item;

                movement(dir);
                if(playerCollision()){
                    let [posPlayerX, posPlayerY] = getRandomPosition(collectibleObj.width*pixels, collectibleObj.height*pixels);

                    currItem = new Collectible({ x: posPlayerX, y: posPlayerY, value:1, id: Date.now(), dimension: [collectibleObj.width*pixels, collectibleObj.height*pixels] });
                }
                socket.emit('update', player, currItem);
                window.requestAnimationFrame(update)
            }
        }

    })

    // handle update
    socket.on('update', (playersArr, collectibleItem) =>{
        arrayOfPlayers = [...playersArr];

        if(collectibleItem.id !== item.id){
            item = new Collectible({ x: collectibleItem.x, y: collectibleItem.y,  value: 1, id: collectibleItem.id, dimension:[collectibleObj.width*pixels, collectibleObj.height*pixels] })
            // console.log('new item', item)
        }
        
        window.requestAnimationFrame(update);
    })

    // handle disconnect
    socket.on('remove-player', removedId => {
        arrayOfPlayers = arrayOfPlayers.filter(p => p.id !== removedId);
        console.log('currentPlayers', arrayOfPlayers);
        window.requestAnimationFrame(update);
    })

    
})

// function needed
const random = (min, max, size) => {
    return Math.floor(Math.random() * (max-min-size+1)) + min;
}

const getRandomPosition = (objWidth, objHeight) => {
    let x = random(borderOthers, widthArea-borderOthers, objWidth);
    let y = random(borderTop, heightArea-borderOthers, objHeight);

    return [x, y];
}

const update = () => {
    let rank;
    setBackground();

    arrayOfPlayers.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    rank = player.calculateRank(arrayOfPlayers);

    context.fillText(`Score: ${player.score} rank: ${rank}`, 480, 32);

    arrayOfPlayers.map(p => {
        p.id == player.id ? draw(playerObj, p.x, p.y) : draw(playerObj, p.x, p.y, true);
    })

    draw(collectibleObj, item.x, item.y);
}

const setBackground = () => {
    context.clearRect(0, 0, widthArea, heightArea);
    context.fillStyle = bgColor;
    context.fillRect(0, 0, widthArea, heightArea);
    context.strokeStyle = strokeColor;
    context.strokeRect(borderLine, borderTop-3, widthArea-2*borderLine, heightArea-borderLine-borderTop+3);

    context.fillStyle = textColor;
    context.font = `16px 'Press Start 2P'`;
    context.textAlign = 'center';
    context.fillText('Controls: WASD', 120, 32);
}

const draw = (obj, x, y, enemy=false) => {
    obj.rows.map(row => {
        let loc = { x: (x||0)+row.x*pixels, y: (y||0)+row.y*pixels};
        let currColor;

        switch(row.color){
            case 'body':
                currColor = enemy ? enemyColor : playerColor;
                // currColor = playerColor;
                break;
            case 'eyes':
                currColor = eyesColor;
                break;
            case 'fruit':
                currColor = itemColor;
                break;
        }

        context.fillStyle = currColor;
        context.fillRect(loc.x, loc.y, row.width*pixels, row.height*pixels);
    })   
}

const movement = (dir) => {
    switch(dir){
        case 'up':
            player.movePlayer(dir, Math.min(player.y-borderTop, speed))
            break;
        case 'down':
            player.movePlayer(dir, Math.min(heightArea-borderOthers-player.y-playerObj.height*pixels, speed))
            break;
        case 'left':
            player.movePlayer(dir, Math.min(player.x-borderOthers, speed));
            break;
        case 'right':
            player.movePlayer(dir, Math.min(widthArea-borderOthers-player.x-playerObj.width*pixels, speed));
            break;
    }

    
}

const playerCollision = () => {
    if(player.collision(item)){
        // console.log('HIT');
        
        return true  
    } 
    return false
}

// objects
const playerObj = {
  name: 'icon_pacman_enemy',
  rows: [
    {x: 7, y: 0, width: 6, height: 1, color: 'body'},
    {x: 5, y: 1, width: 10, height: 1, color: 'body'},
    {x: 3, y: 2, width: 14, height: 1, color: 'body'},
    {x: 2, y: 3, width: 16, height: 2, color: 'body'},
    {x: 1, y: 5, width: 18, height: 2, color: 'body'},
    {x: 0, y: 7, width: 20, height: 14, color: 'body'},
    {x: 0, y: 21, width: 3, height: 1, color: 'body'},
    {x: 4, y: 21, width: 5, height: 1, color: 'body'},
    {x: 11, y: 21, width: 5, height: 1, color: 'body'},
    {x: 17, y: 21, width: 3, height: 1, color: 'body'},
    {x: 0, y: 22, width: 2, height: 1, color: 'body'},
    {x: 5, y: 22, width: 3, height: 1, color: 'body'},
    {x: 12, y: 22, width: 3, height: 1, color: 'body'},
    {x: 18, y: 22, width: 2, height: 1, color: 'body'},
    {x: 0, y: 23, width: 1, height: 1, color: 'body'},
    {x: 6, y: 23, width: 1, height: 1, color: 'body'},
    {x: 13, y: 23, width: 1, height: 1, color: 'body'},
    {x: 19, y: 23, width: 1, height: 1, color: 'body'},
    {x: 4, y: 7, width: 2, height: 1, color: 'eyes'},
    {x: 14, y: 7, width: 2, height: 1, color: 'eyes'},
    {x: 3, y: 8, width: 4, height: 4, color: 'eyes'},
    {x: 13, y: 8, width: 4, height: 4, color: 'eyes'},
    {x: 4, y: 12, width: 2, height: 1, color: 'eyes'},
    {x: 14, y: 12, width: 2, height: 1, color: 'eyes'},
  ],
  width: 20,
  height: 24
}

const collectibleObj = {
  name: 'fruit',
  rows: [
    {x: 5, y: 0, width: 5, height: 1, color: 'fruit'},
    {x: 3, y: 1, width: 9, height: 1, color: 'fruit'},
    {x: 2, y: 2, width: 11, height: 1, color: 'fruit'},
    {x: 1, y: 3, width: 13, height: 2, color: 'fruit'},
    {x: 0, y: 5, width: 15, height: 5, color: 'fruit'},
    {x: 1, y: 10, width: 13, height: 2, color: 'fruit'},
    {x: 2, y: 12, width: 11, height: 1, color: 'fruit'},
    {x: 3, y: 13, width: 9, height: 1, color: 'fruit'},
    {x: 5, y: 14, width: 5, height: 1, color: 'fruit'},
  ],
  width: 15,
  height: 15
}
