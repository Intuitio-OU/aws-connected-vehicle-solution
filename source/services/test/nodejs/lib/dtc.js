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

let shortid = require('shortid');
let moment = require('moment');
let _ = require('underscore');
let AWS = require('aws-sdk');

let awsConfig = {
    'region': 'us-east-1',
    // 'endpoint': '',
  }

  AWS.config.update(awsConfig);

    // let docClient = new AWS.DynamoDB.DocumentClient();
    var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

let creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
const dynamoConfig = {
    credentials: creds,
    // region: 'us-east-1'
    region: process.env.AWS_REGION
};
const ddbTable = process.env.VEHICLE_DTC_TBL;
const dtcTable = process.env.DTC_TBL;

/**
 * Performs operations for dtc recording and management actions interfacing primiarly with
 * Amazon DynamoDB table.
 *
 * @class dtc
 */
let dtc = (function() {

    /**
     * @class dtc
     * @constructor
     */
    let dtc = function() {};


    /**
     * Creates a dtc record for a vehicle.
     * @param {JSON} record - dtc message
     * @param {createDtc~callback} cb - The callback that handles the response.
     */
    dtc.prototype.createDtc = async function(record, cb) {

        lookupDtc(record.value, await function(err, dtc_info) {
            if (err) {
                return cb(err, null);
            }

            /*{
                "battery_current": 0,
                "battery_level": 82,
                "battery_voltage": 3.928,
                "channel_id": 26261,
                "counter_impulses_1": 0,
                "custom_param_238": 0,
                "custom_param_263": 1,
                "custom_param_387": "2B3235323233392E343333332B303535323839382E303136372D3030302E3031312F",
                "din": 0,
                "eco_driving_events_number": 10,
                "engine_ignition_status": false,
                "event_priority_enum": 0,
                "external_powersource_voltage": 13.986,
                "gnss_state_enum": 1,
                "gnss_status": true,
                "gps_fuel_rate": 1.55,
                "gps_fuel_used": 75.893,
                "gsm_cellid": 19912,
                "gsm_lac": 426,
                "gsm_mnc": "42403",
                "gsm_network_roaming_status": false,
                "gsm_signal_level": 60,
                "gsm_sim_iccid": "8997103101009777237",
                "ident": "352094085163613",
                "movement_status": true,
                "peer": "5.31.240.236:15016",
                "position_altitude": -11,
                "position_direction": 318,
                "position_hdop": 0.30000000000000004,
                "position_latitude": 25.223943,
                "position_longitude": 55.289801,
                "position_pdop": 0.5,
                "position_satellites": 14,
                "position_speed": 7,
                "position_valid": true,
                "protocol_id": 14,
                "segment_vehicle_mileage": 0,
                "server_timestamp": 1605811850.445558,
                "timestamp": 1605811847,
                "vehicle_mileage": 5325.615,
                "x_acceleration": -0.026000000000000002,
                "y_acceleration": -0.043000000000000003,
                "z_acceleration": 0.024
                }*/

            let dtc = {
                'dtc_id': shortid.generate(),
                /*vin: record.vin,
                dtc: record.value,*/
                'vin': 'record.din',
                'dtc': 'P0100',
                'description': 'No description available.',
                'steps': [],
                //generated_at: moment.utc(record.timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSSSSS').format(),
                'created_at': moment().utc().format(),
                'updated_at': moment().utc().format(),
                'acknowledged': false
            };

            // if (!_.isEmpty(dtc_info)) {
            //     // dtc.description = dtc_info.Item.description;
            //     dtc.description = dtc_info;
            // }

            let params = {
                TableName: ddbTable,
                Item: dtc
                // ReturnValues: 'ALL_NEW'
            };

            docClient.get(params, function(err, data) {
                if (err) {
                    console.log(err);
                    return cb(err, null);
                }

                let _mobile = [
                    'Connected Car Notification. Your vehicle issued a diagnostic trouble code of',
                    dtc.description, '[', record.value, '].'
                ].join(' ');

                let _hud = [
                    'A trouble code was detected for \'',
                    dtc.description, '\' [', record.value, '].'
                ].join('');

                let _message = {
                    type: 'dtc',
                    mobile: _mobile,
                    mqtt: _hud
                }

                // sendNotification(record.vin, _message, function(err, msg_data) {
                //     if (err) {
                //         return cb(err, null);
                //     }

                //     return cb(null, dtc);

                // });

                // return cb(null, dtc);
                return cb(null, data);

            });

        });

    };


    dtc.prototype.getDtc = function(id, vin, cb) {

        let params = {
            TableName: ddbTable,
            Key: {
                dtc_id: id,
                vin: vin
            }
        };

        let docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);

        docClient.get(params, function(err, dtc) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }

            return cb(null, dtc);

        });

    };



    let lookupDtc = function(code, cb) {

        let params = {
            TableName: dtcTable,
            Key: {
                dtc: code
            }
        };

        let docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);

        // docClient.get(params, function(err, dtc) {
        //     // if (err) {
        //     //     return cb(err, null);
        //     // }

            return cb(null, code);

        // });

    };

    return dtc;
    // return code;

})();

module.exports = dtc;
