const express 	= require('express'),
bodyParser 		= require('body-parser'),
logger 			= require('morgan'),
mongoose 		= require('mongoose'),
Routes 			= require('./routes.js'),
config			= require('./config'),
fetchRecords	= require('./fetchrecords');

let app = express();

let fetcher = new fetchRecords();

mongoose.connect(config.db.host, { 
	useUnifiedTopology: true, 
	useNewUrlParser: true,
	useCreateIndex: true
}, (err, results) => {
	if (err) {
		void 0;
	} else {
		void 0;

		if (fetcher.isStarted !== true)
			fetcher.startFetcher();
	}
});

let db = mongoose.connection;

db.on('error', err => {
	console.error.bind(console, "Error: Mongoose connection error...");
});

app.use(logger('common'));
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

Routes(app);

app.get('/api/v1/records', (req, res) => {
	fetcher.getRecords((err, results) => {
		if (err) throw err;

				res.status(200).send({
			success: 'true',
			records: results
		});		
	});
});

app.server = app.listen(config.app.port, (err) => {
	if (err) {
		void 0;
	} else {
		void 0;
	}
});