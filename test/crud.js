let assert      = require('chai').assert,
expect          = require('chai').expect,
mongoose        = require('mongoose'),
_               = require('lodash'),
moment          = require('moment'),
TrackingNumber  = require('../src/node/models/trackingNumbers');

describe ('Connect to Mongoose',function(){

    before(function (done) {
        mongoose.connect('mongodb://localhost/challenger-test', {
            useUnifiedTopology: true, 
            useNewUrlParser: true,
            useCreateIndex: true
        });
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            done();
        });
    });
    
    let json, jsonClean;

    it('Load tracking JSON file', (done) => {
        var fs = require('fs');
        fs.readFile(__dirname + '/stub_data.json', (err, data) => {
            if (err) done(err);
            else {
                json = JSON.parse(data);
                done();
            }
        });
    });

    it('Validate record total (30)', () => {
        assert.equal(json.length, 30);
    });

    it('Process records, removing duplicates (via lodash)', () => {
        jsonClean = _.uniqBy(json, 'tracking_number');
        assert.equal(jsonClean.length, 5); 
    });

    it('Convert ship_dates (string) to Mongoose-friendly dates (via moment)', () => {
        jsonClean.forEach(element => {
            element.ship_date = moment(element.ship_date, "YYYYMMDD").format("YYYY-MM-DD");
        });
        assert.equal(jsonClean[0].ship_date.toString(), "2020-05-15");
    });

    it('Batch save records', (done) => {
        TrackingNumber.insertMany(jsonClean)
        .then((mongooseDocuments) => {
            done();
        })
        .catch((error) => {
            done(error);
        });
    });

    it('Save records individually', (done) => {
        let counter = 0;
        jsonClean.forEach(element => {
            TrackingNumber.create(element)
                .then((mongooseDocuments) => {
                    counter++;
                    if (counter === 5)
                        done();
                })
                .catch((error) => {
                    if (error.code == 11000) {
                        counter++;
                        if (counter === 5)
                            done();
                    }
                    else done(error);
                });
        });
    });

    it('Validate getRecords', (done) => {
        const start = moment().subtract(3,'d');
        const end = moment().endOf('day');

        TrackingNumber.find( { created: { '$gte': start, '$lte': end } } )
        .then((mongooseDocuments) => {
            assert(mongooseDocuments.length, 10);
            done();
        })
        .catch((error) => {
            console.log("fail", error);
            done(error);
        });
    });

    after(function(done){
        mongoose.connection.db.dropDatabase(function(){
            mongoose.connection.close(done);
        });
    });
});