const express = require('express');
const app = express();
const bodyParser = require('body-parser');

'use strict';
// Define the objects you will be working with
const five = require ('johnny-five');
// const Shield = require('j5-sparkfun-weather-shield')(five);
// const path = require('path');
const request = require('request');  // HTTP client request

// API for forecast.io
// const apiKey = '92f925ff56c3a45ab18402d3753b3c88';


const GoogleMapsAPI = require('googlemaps');
const publicConfig = {
	key: 'AIzaSyC96KvTvcpdlhlhOtdSf7jAI61DKy3Dq5M',
  // stagger_time:       1000, // for elevationPath
  // encode_polylines:   false,
  // secure:             true, // use https
  // proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};
const gmAPI = new GoogleMapsAPI(publicConfig);

// // print process.argv
// process.argv.forEach(function (val, index, array) {
//   console.log('Args', index + ': ' + val);
// });



// Add the following definition for the Particle plugin for Johnny-Five
const Particle = require('particle-io');

const board = new five.Board({
	io: new Particle({
		token:    '1b67fbedf478e95d045fa7cf08bd9c78b182ab6b',
		deviceId: '1f001f000347353138383138'
	})
});

let servo1;
let servo2;

const processRequest = function(location, callback) {
	const headers = {
		'User-Agent':   'NodeJS/6.0',
		'Content-Type': 'application/json'
	};

    // Add the API key
	const url = 'https://api.forecast.io/forecast/$apiKey/$location';
    // put the latitude and longitude
 
	request({ url, headers }, function(error, response, body) {
        // console.log('Err', error, 'Resp', response)
		if (!error && response.statusCode === 200) {
            // Parse the reply we got
			const json = JSON.parse(body).currently;
            // console.log('Data', json)
			console.log('Wind speed', json.windSpeed);
			console.log('Wind bearing', json.windBearing);

            // callback(json.windSpeed, json.windBearing);
			callback(json.temperature, json.humidity);
			return;
		}
	});
};


// The board.on() executes the anonymous function when the 
// board reports back that it is initialized and ready.
board.on('ready', function() {
	console.log('Board connected...');


	const led1 = new five.Led('D3');
	led1.on();

	servo1 = new five.Servo({
		pin: 'D1',
		startAt: 0
	});
	servo2 = new five.Servo({
		pin: 'D2',
		startAt: 0
	});
});


// app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

app.use(express.static('public'));

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});


// POST method route
app.post('/', function(req, res) {
  // res.send('POST request to the homepage');
	console.log('POST', req.body.location);
	const location = req.body.location;



	// res.end();
	res.redirect('/');



	// geocode API
	const geocodeParams = {
		// 'address':    '222 W Merchandise Mart Plaza, Chicago, IL 60654',
		address:    location,
		components: 'components=country:US',
		language:   'en',
	};

	gmAPI.geocode(geocodeParams, function(err, result) {
		const location = result.results[0].geometry.location;
		console.log('Location', location, result.results[0].formatted_address);
		const arg = '$location.lat,$location.lng';
		// processRequest('41.8781,87.6298');
		processRequest(arg, function(temperature, humidity) {
			console.log('temperature', temperature, 'humidity', humidity);
			if (temperature < 40) {
				// cold
				servo1.to(160);
			} else if (temperature < 70) {
				// average
				servo1.to(90);
			} else {
				// hot
				servo1.to(20);
			}

			if (humidity < 0.2) {
				// dry
				servo2.to(20);
			} else if (humidity < 0.70) {
				// average
				servo2.to(90);
			} else if (humidity < 0.80) {
				// average
				servo2.to(110);
			} else {
				// humid
				servo2.to(140);
			}

			// setTimeout(function() {
			//     process.exit(0);
			// }, 1000);
		});
	});
});










