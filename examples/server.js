'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PS = require('../dist/node');

const PORT = 8080;
const KEY = '9fd2a189-3d57-4c02-8a55-5f0159bff2cf';
const PROJECT = 'e50b56df-95b7-4fa1-9061-83a7a9bea372';

let currentResponse = null;
let conversation = new PS.Conversation();
conversation.onResponse = (response) => {
    currentResponse && currentResponse.send(response);
};

let server = express();

server.use(bodyParser.text());
server.use('/css', express.static(__dirname + '/node/css'));
server.use('/js', express.static(__dirname + '/node/js'));
server.use('/add_audio', (req, res, next) => {
    let data;
    req.on('data', (chunk) => {
        if (data) {
            Buffer.concat([data, chunk]);
        } else {
            data = chunk;
        }
    });

    req.on('end', () => {
        req.buffer = data;
        next();
    });
});

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/node/chat-text.html'));
});

server.post('/start', (req, res) => {
    currentResponse = res;
    const request = new PS.Request({
        apiKey: KEY
    });
    console.log('starting conversation');
    conversation.start(PROJECT, request);
});

server.post('/text', (req, res) => {
    currentResponse = res;
    console.log(`sending text: ${req.body}`);
    conversation.sendText(req.body);
});

server.post('/continue', (req, res) => {
    currentResponse = res;
    conversation.checkForTimedResponse();
});

server.post('/start_audio', (req, res) => {
    console.log('starting audio');
    conversation.startAudio();
    res.end();
});

server.post('/add_audio', (req, res) => {
    conversation.addAudio(req.buffer);
    res.end();
});

server.post('/end_audio', (req, res) => {
    console.log('ending audio');
    currentResponse = res;
    conversation.stopAudio();
});

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
