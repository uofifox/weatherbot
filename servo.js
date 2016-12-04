
'use strict';
// Define the objects you will be working with
const five = require ('johnny-five');
// const Shield = require('j5-sparkfun-weather-shield')(five); 

// Add the following definition for the Particle plugin for Johnny-Five
const Particle = require('particle-io');

const board = new five.Board({
	io: new Particle({
		token:    '1b67fbedf478e95d045fa7cf08bd9c78b182ab6b',
		deviceId: '1f001f000347353138383138'
	})
});

// The board.on() executes the anonymous function when the 
// board reports back that it is initialized and ready.
board.on('ready', function() {
	console.log('Board connected...');


	const servo1 = new five.Servo({
		pin: 'D1',
		startAt: 0
	});
	const servo2 = new five.Servo({
		pin: 'D2',
		startAt: 0
	});

	let angle = 0;
	let step = 10;
	setInterval(function() {
		angle += step;
		if (angle > 180 || angle < 0) {
			step *= -1;
		}
		console.log('Angle', angle);
		servo1.to(angle);
		servo2.to(angle);
	}, 1000);
});
