// require dependencies
const express 	= require('express'),
bodyParser 		= require('body-parser'),
logger 			= require('morgan'),
mongoose 		= require('mongoose'),
Routes 			= require('./routes.js'),
config			= require('./config'),
fetchRecords	= require('./fetchrecords');

// define port (feel free to change this) and express app
// port defined in config.js, based on NODE_ENV
let app = express();

// instantiate fetchFiles class (but do not start just yet...)
let fetcher = new fetchRecords();

// connect to database (feel free to change the connection info or name of the database)
mongoose.connect(config.db.host, { 
	useUnifiedTopology: true, 
	useNewUrlParser: true,
	useCreateIndex: true
}, (err, results) => {
	if (err) {
		console.log("Error connecting to database:", err);
	} else {
		console.log("Successfully connected to database:", results.name);
		
		// start the file fetcher (if not already)...
		if (fetcher.isStarted !== true)
			fetcher.startFetcher();
	}
});

let db = mongoose.connection;

// reconnects
db.on('error', err => {
	console.error.bind(console, "Error: Mongoose connection error...");
});

// mount middleware
app.use(logger('common'));
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// app routes
Routes(app);

// api endpoint
app.get('/api/v1/records', (req, res) => {
	fetcher.getRecords((err, results) => {
		if (err) throw err;
		
		res.status(200).send({
			success: 'true',
			records: results
		});		
	});
});

// listen for connections
app.server = app.listen(config.app.port, (err) => {
	if (err) {
		console.log("Error starting", process.env.NODE_ENV.toUpperCase(), "server:", err);
	} else {
		console.log(process.env.NODE_ENV.toUpperCase() + " Server started on port:", config.app.port);
	}
});