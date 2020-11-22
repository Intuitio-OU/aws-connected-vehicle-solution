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
    'accessKeyId': process.env.SERVERLESS_AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.SERVERLESS_AWS_SECRET_ACCESS_KEY
  }
  AWS.config.update(awsConfig);



let creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
const dynamoConfig = {
    credentials: creds,
    // region: 'us-east-1'
    region: process.env.AWS_REGION
};
const ddbTable = process.env.VEHICLE_DTC_TBL;
const dtcTable = process.env.DTC_TBL;

var docClient = new AWS.DynamoDB.DocumentClient();

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
    dtc.prototype.createDtc = function(record, cb) {

        lookupDtc(record.value, async function(err, dtc_info) {
            if (err) {
                return cb(err, null);
            }

            /*
            let dtc = {
                dtc_id: shortid.generate(),
                vin: record.vin,
                dtc: record.value,
                description: 'No description available.',
                steps: [],
                //generated_at: moment.utc(record.timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSSSSS').format(),
                created_at: moment().utc().format(),
                updated_at: moment().utc().format(),
                acknowledged: false
            };
            */

            // if (!_.isEmpty(dtc_info)) {
            //     // dtc.description = dtc_info.Item.description;
            //     dtc.description = dtc_info;
            // }

            let params = {
                TableName: ddbTable,
                Item: {vin: 'sampla sample sample', dtc_id: 'P1011'},
                ReturnValues: "ALL_NEW",
                ReturnConsumedCapacity: "TOTAL"
            };


            async function runQuery() {
                try {
                    const result = await docClient.put(params).promise();
                } catch(ex) {
                    console.log(ex)
                }
            }

            await runQuery();

        });

    };



    let lookupDtc = function(code, cb) {

        let params = {
            TableName: dtcTable,
            Key: {
                dtc: code
            }
        };

        // let docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);

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
