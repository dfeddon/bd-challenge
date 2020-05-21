const mongoose  = require('mongoose'),
config			= require('./config'),
_               = require('lodash'),
moment          = require('moment'),
TrackingNumber  = require('./models/trackingNumbers');

class FetchRecords {
    constructor() {
        this.isStarted = false;
    }

    startFetcher() {    
        void 0;

        this.isStarted = true;

        let interval = 1000 * 60 * config.app.timerInMinutes;
        this.timer = setInterval(this.processRecords.bind(this), interval);

        this.processRecords();
    }

    stopFetcher() {
        void 0;

        clearInterval(this.timer);
        this.isStarted = false;
    }

    getRecords(callback) {
        void 0;

        var start = moment().subtract(3,'d');
        var end = moment().endOf('day');

        TrackingNumber.find( { created: { '$gte': start, '$lte': end } } )
        .then((mongooseDocuments) => {
            void 0;
            return callback(null, mongooseDocuments);
        })
        .catch((error) => {
            void 0;
            return callback(error, null);
        });
    }

    processRecords() {
        void 0;

        let fetchFnc;
        switch(process.env.NODE_ENV) {
            case "dev":
                fetchFnc = this.getRecordsHttps;
                break;
            case "test":
                fetchFnc = this.getRecordsLocal;
                break;
            default: 
                fetchFnc = this.getRecordsHttps;
        }

        fetchFnc((err, results) => {
            if (err) throw err;

            void 0;

            let jsonClean = _.uniqBy(results, 'tracking_number');
            void 0;

            jsonClean.forEach(element => {
                element.ship_date = moment(element.ship_date, "YYYYMMDD").format("YYYY-MM-DD");
            });


                        if (jsonClean.length > config.db.batchThreshold)
                this.saveRecordsInBatch(jsonClean);
            else this.saveRecordsIndividually(jsonClean);
        });
    }

    saveRecordsInBatch(records) {
        void 0;

        TrackingNumber.insertMany(records)
        .then((mongooseDocuments) => {
            void 0;
        })
        .catch((error) => {
            if (error.code == 11000) {
                void 0;

                this.saveRecordsIndividually(records);
            }
            else throw(error);
        });
    }

    saveRecordsIndividually(records) {
        void 0;

        records.forEach(element => {
            TrackingNumber.create(element)
                .then((mongooseDocuments) => {
                    void 0;
                })
                .catch((error) => {
                    if (error.code == 11000) {
                        void 0;
                    }
                    else throw error;
                });
        });
    }

    getRecordsLocal(callback) {
        void 0;

        var fs = require('fs');
        fs.readFile('tracking_data_stub.json', (err, data) => {
            if (err) return callback(err, null);
            else {
                return callback(null, JSON.parse(data));
            }
        });
    }

    getRecordsHttp(callback) {
        void 0;

        const request = require('request');

        request('http://localhost:3000/tracking_data_stub.json', { json: true }, (err, res, body) => {
            if (err) { 
              return void 0; 
            }
            void 0;
            void 0;
        });    
    }

    getRecordsHttps(callback) {
        void 0;

        const https = require('https');

        let url = "https://automation.bigdaddyunlimited.com/tracking_data.json";

                https.get(url,(res) => {
            let body = "";

                    res.on("data", (chunk) => {
                body += chunk;
            });

                    res.on("end", () => {
                try {
                    return callback(null, JSON.parse(body));
                } catch (error) {
                    void 0;
                }
            });

                }).on("error", (error) => {
            void 0;
        });
    }
}

module.exports = FetchRecords;