/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';

let AWS = require('aws-sdk');
let Dtc = require('./dtc.js');

module.exports.respond = function(event, cb) {

    let _dtc = new Dtc();
    let _message = {};

    if (typeof event === 'object') {
        _message = event;
    } else {
        _message = JSON.parse(event);
    }

    if (event.action) {

    }else {
        // identify message as dtc object to be created from IoT platform
        console.log('--------- identify message as dtc object to be created from IoT platform ------------')

        _dtc.createDtc(event, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            return cb(null, data);
        });

        /*
        let id = '1'
        let vin = 'P0100'

        _dtc.getDtc(id, vin, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            console.log('----data:  ')
            console.log(data)
            return cb(null, data);
        })
        */


    }

};
