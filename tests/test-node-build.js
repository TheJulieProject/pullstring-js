import test from 'ava';

const PS = require('../dist/node');
const TestBase = require('./TestBase.js').TestBase;

const API_KEY = '36890c35-8ecd-4ac4-9538-6c75eb1ea6f6';
const PROJECT = '841cbd2c-e1bf-406b-9efe-a9025399aab4';
const BUILD_TYPE = 'production';

let conversation = new PS.Conversation();
let request = new PS.Request({
    apiKey: API_KEY,
    buildType: BUILD_TYPE,
});

let testBase = new TestBase(conversation, request, PROJECT, PS.VersionInfo);

test.cb.serial('feature info', t => {
    testBase.versionInfo(t);
});

test.cb.serial('bad request', t => {
    testBase.badRequest(t);
});

test.cb.serial('bad project', t => {
    testBase.badProject(t);
});

test.cb.serial('bad audio', t => {
    testBase.badAudio(t);
});

test.cb.serial('introduction', t => {
    testBase.introduction(t);
});

test.cb.serial('intro with asr', t => {
    testBase.introAsr(t);
});

test.cb.serial('go to response', t => {
    testBase.goToResponse(t);
});

test.cb.serial('entities', t=> {
    testBase.entities(t);
});

test.cb.serial('conversation', t=> {
    testBase.convo(t);
});

test.cb.serial('timed response', t=> {
    testBase.timedResponse(t);
});

test.cb.serial('events and behaviors', t=> {
    testBase.eventsAndBehaviors(t);
});

test.cb.serial('schedule timer', t=> {
    testBase.scheduleTimer(t);
});
