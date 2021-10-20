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