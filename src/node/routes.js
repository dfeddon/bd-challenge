let request = require('request');
let path = require('path'); // path required to join dirname below...
let config = require('./config');

module.exports = (app) => {
	// home route - serves angular application
	app.get("/", (req, res) => {
		// res.sendFile("app.html", { root: __dirname + "/public/html" });
		let _path = "../../public/html";
		if (process.env.NODE_ENV !== 'prod')
			_path = "../angular/html";
		
		res.sendFile("app.html", { root: path.join(__dirname, _path) });
	});
};