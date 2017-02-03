(function () {
    function SpeechListener(endpoint, ajax) {
        var _this = this;

        this.outSampleRate = 16000;
        this.channels = 1;
        this.isRecording = false;
        this.request = null;
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.node = null;
        this.endpoint = endpoint;
        this.ajax = ajax;

        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            window.URL = window.URL || window.webkitURL;
            window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log('error initializing audio: ' + JSON.stringify(e));
        }


        this.processAudio = function (audio) {
            if (!_this.isRecording) return;
            var mono = audio.inputBuffer.getChannelData(0);
            var ratio = _this.audioContext.sampleRate / _this.outSampleRate;
            var dsCount = mono.length / ratio;
            var offline = new OfflineAudioContext(_this.channels, dsCount, _this.outSampleRate);
            var bufferSource = offline.createBufferSource();

            // downsample audio to 16 kHz in background and then pass result
            // to converation.addAudio()
            bufferSource.buffer = audio.inputBuffer;
            bufferSource.connect(offline.destination);
            bufferSource.start();
            offline.startRendering();
            offline.oncomplete = function (e) {
                var buffer = e.renderedBuffer.getChannelData(0);
                let bufferLength = buffer.length * 2;
                let arrayBuffer = new ArrayBuffer(bufferLength);
                let dataView = new DataView(arrayBuffer);

                // convert raw samples to bytes
                let byteOffset = 0;
                for (let i = 0; i < buffer.length; i++) {
                    let inSample = buffer[i];
                    let sample = Math.max(-1, Math.min(1, inSample));
                    let intSample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
                    dataView.setUint16(byteOffset, intSample, true);
                    byteOffset += 2;
                }

                //let bBuffer = new Uint8Array(dataView.buffer);
                //console.log(bBuffer);

                let xhr = new XMLHttpRequest()
                xhr.open('POST', endpoint);
                xhr.setRequestHeader('Content-Type', 'audio/l16; rate=16000');
                xhr.send(dataView.buffer);
            };
        };

        this.init = function (callback) {
            function _onAudioStart(stream) {
                _this.mediaStreamSource = _this.audioContext.createMediaStreamSource(stream);
                _this.node = _this.audioContext.createScriptProcessor(0, _this.channels, _this.channels);
                _this.node.onaudioprocess = _this.processAudio;
                _this.mediaStreamSource.connect(_this.node);
                _this.node.connect(_this.audioContext.destination);

                callback && callback(true);
            }

            if (navigator.getUserMedia) {
                navigator.getUserMedia({audio: true}, _onAudioStart, function (e) {
                    callback && callback(false);
                });
            } else {
                callback && callback(false);
            }
        };

        this.startAudio = function () {
            this.isRecording = true;
        };

        this.stopAudio = function () {
            this.isRecording = false;
        };
    }

    window.SpeechListener = SpeechListener;
})();
