var mongoose = require("mongoose");


let TrackingNumberSchema = new mongoose.Schema({
    ship_date: {
        type: Date,
    },
    tracking_number: {
        type: String,
        index: { unique: true },
        required: true
    },
    shipping_carrier: {
        type: String,
        enum: ["FEDEX", "UPS", "USPS"]
    },
    shipping_method: {
        type: String,
        enum: ["Grnd", "2Day", "PRIO"]
    },
    tracking_url: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
}, {
    autoIndex: (process.env.NODE_ENV === "dev") ? true : false
});

module.exports = mongoose.model('TrackingNumber', TrackingNumberSchema);