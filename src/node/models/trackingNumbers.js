var mongoose = require("mongoose");

/* Sample Dataset:
{
    "ship_date":"20200515",
    "tracking_number":"184954026950",
    "shipping_carrier":"FEDEX",
    "shipping_method":"Grnd",
    "tracking_url":"http://www.fedex.com/Tracking?action=track&tracknumbers=184954026950"
}*/

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
    // disable auto indexing for production
    autoIndex: (process.env.NODE_ENV === "dev") ? true : false
});

module.exports = mongoose.model('TrackingNumber', TrackingNumberSchema);