/*
 * Encapsulate a response from the PullString Web API.
 *
 * Copyright (c) 2016 PullString, Inc.
 *
 * The following source code is licensed under the MIT license.
 * See the LICENSE file, or https://opensource.org/licenses/MIT.
 */

'use strict';

/**
 * Define features to check if they are supported.
 * @readonly
 * @property {int} EFeatures.StreamingAsr
 */
const EFeatures = {
    StreamingAsr: 0,
};

/**
 * Encapsulates version information for PullString's' Web API.
 */
class VersionInfo {
    /**
     * Check if the endpoint currently supports a feature.
     * @param {EFeatures} feature The feature to check.
     */
    static hasFeature(feature) {
        switch (feature) {
        case EFeatures.StreamingAsr:
            return true;
        default:
            return false;
        }
    }
}

/**
 * The public-facing endpoint of the PullString Web API.
 */
Object.defineProperty(VersionInfo, 'ApiBaseUrl', {
    value: 'conversation.pullstring.ai/v1/',
    writable: false,
    enumerable: true,
    configurable: false,
});

VersionInfo.EFeatures = EFeatures;

module.exports = { VersionInfo };
