const mongoose  = require('mongoose'),
config			= require('./config'),
_               = require('lodash'),
moment          = require('moment'),
TrackingNumber  = require('./models/trackingNumbers');

class FetchRecords {
    // constructor
    constructor() {
        this.isStarted = false;
    }

    startFetcher() {    
        console.log("-> FetchRecords.startFetcher()", process.env.NODE_ENV);

        this.isStarted = true;

        let interval = 1000 * 60 * config.app.timerInMinutes;
        this.timer = setInterval(this.processRecords.bind(this), interval);

        // begin processing records
        this.processRecords();
    }

    stopFetcher() {
        console.log("-> FetchRecords.stopFetcher");

        clearInterval(this.timer);
        this.isStarted = false;
    }

    getRecords(callback) {
        console.log("-> FetchRecords.getRecords");

        // get records from the past 3 days...
        var start = moment().subtract(3,'d');
        var end = moment().endOf('day');

        TrackingNumber.find( { created: { '$gte': start, '$lte': end } } )
        .then((mongooseDocuments) => {
            console.log("success!");
            return callback(null, mongooseDocuments);
        })
        .catch((error) => {
            console.log("fail", error);
            return callback(error, null);
        });
    }

    processRecords() {
        console.log("-> FetchRecords.processRecords (%s)", process.env.NODE_ENV);

        let fetchFnc;
        switch(process.env.NODE_ENV) {
            case "dev":
                fetchFnc = this.getRecordsHttps;//getRecordsLocal;
                break;
            case "test":
                fetchFnc = this.getRecordsLocal;//getRecordsHttp;
                break;
            default: // prod
                fetchFnc = this.getRecordsHttps;
        }
        
        // fetch the json file
        fetchFnc((err, results) => {
            if (err) throw err;

            console.log("* returned %s records", results.length);

            // discard duplicates within file
            let jsonClean = _.uniqBy(results, 'tracking_number');
            console.log("* removed %s duplicate records", results.length - jsonClean.length);

            // parse date strings to mongoose-friendly dates
            jsonClean.forEach(element => {
                element.ship_date = moment(element.ship_date, "YYYYMMDD").format("YYYY-MM-DD");
            });

            // finally, if the dataset is large let's try and batch insert the data....
            // however, if batch fails there's likely a duplicate in the db 
            // (which indexing will catch). If this happens, we'll simply revert 
            // to inserting records one at a time and filter the duplicates...
            
            if (jsonClean.length > config.db.batchThreshold)
                this.saveRecordsInBatch(jsonClean);
            else this.saveRecordsIndividually(jsonClean);
        });
    }

    saveRecordsInBatch(records) {
        console.log("-> FetchRecords.saveRecordsInBatch");

        TrackingNumber.insertMany(records)
        .then((mongooseDocuments) => {
            console.log("* records successfully saved (batch)!");
        })
        .catch((error) => {
            // if error 11000, indexing caught a duplicate tracking_number
            if (error.code == 11000) {
                console.log("* error: duplicate caught");

                // instead, let's store the data one at a time...
                this.saveRecordsIndividually(records);
            }
            else throw(error);
        });
    }

    saveRecordsIndividually(records) {
        console.log("-> FetchRecords.saveRecordsIndividually");

        // store each record individually
        records.forEach(element => {
            TrackingNumber.create(element)
                .then((mongooseDocuments) => {
                    console.log("* record successfully saved!");
                })
                .catch((error) => {
                    // if error 11000, indexing has caught a duplicate tracking_number
                    if (error.code == 11000) {
                        console.log("* error: duplicate found, ignoring...");
                    }
                    else throw error;
                });
        });
    }

    /**
     * Load local file.
     * 
     * @param { Function(error, results) }    callback    Standard (err, results) callback function.
     * @return { JSON }
     */
    getRecordsLocal(callback) {
        console.log("-> FetchRecords.getRecords (local)");

        var fs = require('fs');
        fs.readFile('tracking_data_stub.json', (err, data) => {
            if (err) return callback(err, null);
            else {
                return callback(null, JSON.parse(data));
            }
        });
    }

    /**
     * Load remote file via HTTP.
     * 
     * @param { Function(error, results) }    callback    Standard (err, results) callback function.
     * @return { JSON }
     */
    getRecordsHttp(callback) {
        console.log("-> getRecords (http)");

        const request = require('request');

        request('http://localhost:3000/tracking_data_stub.json', { json: true }, (err, res, body) => {
            if (err) { 
              return console.log(err); 
            }
            console.log(body.url);
            console.log(body.explanation);
        });    
    }

    /**
     * Load remote file via HTTPS.
     * 
     * @param { Function(error, results) }    callback    Standard (err, results) callback function.
     * @return { JSON }
     */
    getRecordsHttps(callback) {
        console.log("-> getRecords (https)");

        const https = require('https');

        let url = "https://automation.bigdaddyunlimited.com/tracking_data.json";
        
        https.get(url,(res) => {
            let body = "";
        
            res.on("data", (chunk) => {
                body += chunk;
            });
        
            res.on("end", () => {
                try {
                    // let json = JSON.parse(body);
                    return callback(null, JSON.parse(body));
                    // do something with JSON
                } catch (error) {
                    console.error(error.message);
                }
            });
        
        }).on("error", (error) => {
            console.error(error.message);
        });
    }
}

module.exports = FetchRecords;