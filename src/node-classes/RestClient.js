/*
 * Make REST calls to PullString's Web API.
 *
 * Copyright (c) 2016 PullString, Inc.
 *
 * The following source code is licensed under the MIT license.
 * See the LICENSE file, or https://opensource.org/licenses/MIT.
 */

'use strict';

import https from 'https';

class RestClient {
    constructor(options) {
        this.decode = options.decode || JSON.parse;
        this.encode = options.encode || JSON.stringify;
        this.baseUrl = options.baseUrl || '';
    }

    post(endpoint, params, headers, body, callback, doEncode = true) {
        if (!this.baseUrl) return;
        let url = this._url(endpoint, params);
        if (doEncode && this.encode) {
            body = this.encode(body);
        }
        this._sendRequest(url, 'POST', headers, callback, body);
    }

    start(endpoint, params, headers, callback) {
        if (!this.baseUrl) return;
        let url = this._url(endpoint, params);
        this._stream = this._start(url, 'POST', headers, callback);
    }

    write(data) {
        if (!this._stream || !(data instanceof Buffer)) {
            return;
        }
        this._stream.write(data);
    }

    stop() {
        if (!this._stream) return;
        this._stream.end();
        this._stream = null;
    }

    _url(endpoint, params) {
        let query = [];
        for (let p in params) {
            if (params.hasOwnProperty(p)) {
                let key = encodeURIComponent(p);
                let val = encodeURIComponent(params[p]);
                let param = `${key}=${val}`;
                query.push(param);
            }
        };

        let pathIndex = this.baseUrl.indexOf('/');
        let path = this.baseUrl.substring(pathIndex);
        return `${path}${endpoint}?${query.join('&')}`;
    }

    _start(path, method, headers, callback) {
        let pathIndex = this.baseUrl.indexOf('/');
        let host = this.baseUrl.substring(0, pathIndex);
        let options = {
            hostname: host,
            path: path,
            method: method,
            headers: headers
        };

        let status = {};
        let response = {};

        let request = https.request(options, (res) => {
            let resBody = '';
            res.setEncoding('utf8');
            res.on('data', (data) => {
                resBody += data;
            });

            res.on('end', () => {
                status.code = res.statusCode;
                status.success = res.statusCode < 400;

                if (status.success) {
                    response = resBody;
                    if (this.decode) {
                        response = this.decode(response);
                    }
                } else {
                    let resStatus = this.decode(resBody);
                    status.message = resStatus.error.message;
                }

                response.status = status;
                callback && callback(response);
            });
        });

        request.on('error', (e) => {
            console.log(JSON.stringify(e));
            status.code = 501;
            status.success = false;
            status.message = e.message;
            response.status = status;
            callback && callback(response);
        });

        return request;
    }

    _sendRequest(path, method, headers, callback, body = null) {
        this._start(path, method, headers, callback)
            .end(body);
    }
}

module.exports = { RestClient };
