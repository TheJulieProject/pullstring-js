require('babel-core/register');
import test from 'ava';
const XMLHttpRequest = require('xhr2');
const jsdom = require('jsdom');
const TestBase = require('./TestBase.js').TestBase;

const API_KEY = '36890c35-8ecd-4ac4-9538-6c75eb1ea6f6';
const PROJECT = '841cbd2c-e1bf-406b-9efe-a9025399aab4';
const INTENT_PROJECT = '176a87fb-4d3c-fde5-4b3c-54f18c2d99a4';
const BUILD_TYPE = 'production';

jsdom.defaultDocumentFeatures = {
    FetchExternalResources: ["script"],
    ProcessExternalResources: ["script"],
};

// to test the transpiled build, first mock a browser environment
test.cb.before(t => {
    let htmlDoc = '<html><body></body></html>';
    jsdom.env(
        htmlDoc,
        ['../dist/web/pullstring.min.js'],
        function(err, window) {
            global.pullstring = window.pullstring;
            global.conversation = new pullstring.Conversation(XMLHttpRequest);
            global.request = new pullstring.Request({
                apiKey: API_KEY,
                buildType: BUILD_TYPE,
            });

            global.testBase = new TestBase(conversation, request, PROJECT, pullstring.VersionInfo);
            global.intentTest = new TestBase(conversation, request, INTENT_PROJECT, pullstring.VersionInfo);
            t.end();
        }
    );
});

test.cb.serial('feature info', t => {
    testBase.versionInfo(t, true);
});

test.cb.serial('bad request', t => {
    testBase.badRequest(t);
});

test.cb.serial('bad project', t => {
    testBase.badProject(t);
});

test.cb.serial('bad audio', t => {
    testBase.badAudio(t, true);
});

test.cb.serial('introduction', t => {
    testBase.introduction(t);
});

test.cb.serial('intro with asr', t=> {
    testBase.introAsr(t, true);
});

test.cb.serial('intro with intent', t => {
    intentTest.introIntent(t);
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
