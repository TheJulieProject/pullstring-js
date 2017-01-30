/*
 * Control collection and processing of audio data for ASR.
 *
 * Copyright (c) 2016 PullString, Inc.
 *
 * The following source code is licensed under the MIT license.
 * See the LICENSE file, or https://opensource.org/licenses/MIT.
 */

'use strict';

class Speech {
    constructor(client) {
        this._client = client;
        this._isRecording = false;
    }

    start(endpoint, params, headers, callback) {
        if (!this._client) return;

        this._client.start(
            endpoint,
            params,
            headers,
            (response) => callback(response)
        );

        this._isRecording = true;
    }

    add(buffer) {
        if (!this._isRecording || !this._client) {
            return;
        }
        this._client.write(buffer);
    }

    stop() {
        if (!this._isRecording || !this._client) {
            return;
        }

        this._isRecording = false;
        this._client.stop();
    }

    sendAudio(audio, endpoint, params, headers, callback) {
        if (!(audio instanceof Buffer)) {
            return 'Audio sent to sendAudio is not a Buffer';
        }

        let audioData = this.getWavData(audio);

        if (audioData.error) {
            return audioData.error;
        }

        this._client.post(
            endpoint,
            params,
            headers,
            audioData,
            (response) => callback(response),
            doEncode
        );
    }

    static getWavData(data) {
        let riff = data.toString('ascii', 0, 4);

        if (riff !== 'RIFF') {
            return { error: 'Data is not a WAV file' };
        }

        let channels = data.readUInt16LE(22);
        let rate = data.readUInt32LE(24);
        let bitsPerSample = data.readUInt16LE(34);

        if (channels !== 1 || rate !== 16000 || bitsPerSample !== 16) {
            return { error: 'WAV data is not mono 16-bit data at 16k sample rate' };
        }

        let dataOffset = 12;
        let chunkSize = data.readUInt32LE(16);
        let fileSize = data.readUInt32LE(4);

        while (data.toString('ascii', dataOffset, dataOffset + 4) !== 'data') {
            if (dataOffset > fileSize) {
                return { error: 'Cannot find data segment in WAV file' };
            }

            dataOffset += chunkSize + 8;
            chunkSize = data.readUInt32LE(dataOffset + 4);
        }

        let dataStart = dataOffset + 8;
        return data.slice(dataStart);
    };
}

Object.defineProperty(Speech, 'AsrSampleRate', {
    value: 16000,
    writable: false,
    enumerable: true,
    configurable: false,
});

Object.defineProperty(Speech, 'AsrChannels', {
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false,
});

module.exports = { Speech: Speech };
