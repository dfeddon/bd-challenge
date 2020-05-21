let request = require('request');
let path = require('path'); 
let config = require('./config');

module.exports = (app) => {
	app.get("/", (req, res) => {
		let _path = "../public/html";
		if (process.env.NODE_ENV !== 'prod')
			_path = "../angular/html";

				res.sendFile("app.html", { root: path.join(__dirname, _path) });
	});
};