// let heightMin, heightMax;
const async = require('async');
const Client = require('krpc-node');
const krpcThings = require('./setup');
const clamp = require('./util/clamp');
const rollOver = require('./util/rollOver');
const toDeg = require('./util/toDeg');

let client = null;
let state = {
	clientId: null,
	camera: {
		id: null,
		minPitch: null,
		maxPitch: null,
		minDistance: null,
		maxDistance: null,
		pitch: null,
		heading: null,
		distance: null
	},
	vessel: {
		id: null,
		controlId: null,
		kerbinFlight: null,
		kerbinNonRotatingFlight: null
	},
	celestialBodies: null,
	kerbinReferenceFrame: null,
	kerbinNonRotatingReferenceFrame: null
};

const onClientCreated = (err, clientCreated) => {
	console.log('client connected');
	if (err) {
		throw err;
	}
	client = clientCreated;


	function pollGameScene() {
		console.log('Polling');

		krpcThings.getGameScene(client, state, function (err) {
			if (err) {
				throw err;
			}

			if (state.gameScene !== 'Flight') {
				setTimeout(pollGameScene, 5000);
			} else {
				async.series(
					[
						(callback) => { krpcThings.getInitialInfo(client, state, callback);	},
						// (callback) => { krpcThings.connectToStreamServer(client, state, callback); },
						(callback) => { krpcThings.getVesselInfo(client, state, callback); },
						(callback) => { krpcThings.getCameraInfo(client, state, callback); },
						(callback) => { krpcThings.getKerbinReferenceFrames(client, state, callback);	},
						(callback) => { krpcThings.getKerbinFlight(client, state, callback); },
						// (callback) => { krpcThings.addSpeedToStream(client, state, callback);	},
						// (callback) => { krpcThings.connectBoard(client, state, callback);	}
					],
					function (err) {
						if (err) {
							throw err;
						}
					}
				);
			}
		});
	}

	pollGameScene();
};

Client(null, onClientCreated);

var Leap = require('leapjs');



// function minMax(value) {
// 	if (isNaN(heightMax) && isNaN(heightMin)) {
// 		heightMax = value;
// 		heightMin = value;
// 	} else if (value < heightMin) {
// 		heightMin = value;
// 	} else if (value > heightMax) {
// 		heightMax = value;
// 	}

// }

// const leapRange = 150;
// const leapMin = 0;
const kspMin = 0.5;
const kspMax = 150000;
// const kspRange = kspMax - kspMin;
let headingChanged = false;
let pitchChanged = false;
let zoomChanged = false;

// function scaleZoom(fromLeap) {
// 	return (((fromLeap - leapMin) * kspRange) / leapRange) + kspMin;
// }

function grabZoom(grabStrength, pitch, roll) {
	if (pitch > -45 && pitch < 45 &&
		roll > -45 && roll < 45) {
		if (grabStrength > 0.98) {
			state.camera.distance = clamp(state.camera.distance - 0.5, kspMin, kspMax);
			zoomChanged = true;
		} else if (grabStrength < 0.02) {
			state.camera.distance = clamp(state.camera.distance + 0.5, kspMin, kspMax);
			zoomChanged = true;
		}
	}
	return state.camera.distance;
}

function adjustPitch(handPitch) {
	if (handPitch > 80) {
		state.camera.pitch = clamp(state.camera.pitch - 0.5, state.camera.minPitch, state.camera.maxPitch);
		pitchChanged = true;
	} else if (handPitch < -80) {
		state.camera.pitch = clamp(state.camera.pitch + 0.5, state.camera.minPitch, state.camera.maxPitch);
		pitchChanged = true;
	}

	return state.camera.pitch;
}

function adjustHeading(handRoll, pitch) {
	if (pitch < 45 && pitch > -45) {
		if (handRoll > 80) {
			state.camera.heading = rollOver(state.camera.heading - 0.5, 0, 360);
			headingChanged = true;
		} else if (handRoll < -80) {
			state.camera.heading = rollOver(state.camera.heading + 0.5, 0, 360);
			headingChanged = true;
		}
	}
	return state.camera.heading;
}

var controller = new Leap.Controller({
	enableGestures: false
});
controller.loop(function (frame) {
	for (var i in frame.handsMap) {
		var hand = frame.handsMap[i];
		// minMax(hand.palmPosition[2]);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Roll: ${toDeg(hand.roll()).toFixed(3)}\t\tPitch: ${toDeg(hand.pitch()).toFixed(3)}\t\Grab Str: ${hand.grabStrength}`);
		// process.stdout.write(`Roll: ${toDeg(hand.roll())} deg`);
		const roll = toDeg(hand.roll());
		const pitch = toDeg(hand.pitch());
		const newZoomDist = grabZoom(hand.grabStrength, pitch, roll);
		const newHeading = adjustHeading(roll, pitch);
		const newPitch = adjustPitch(pitch);

		if (pitchChanged) {
			pitchChanged = false;
			client.send(client.services.spaceCenter.cameraSetPitch(state.camera.id, newPitch));
		} else if (headingChanged) {
			headingChanged = false;
			client.send(client.services.spaceCenter.cameraSetHeading(state.camera.id, newHeading));
		} else if (zoomChanged) {
			zoomChanged = false;
			client.send(client.services.spaceCenter.cameraSetDistance(state.camera.id, newZoomDist));
		}
	}
});
controller.on('ready', function () {
	console.log('ready');
});
controller.on('connect', function () {
	console.log('connect');
});
controller.on('disconnect', function () {
	console.log('disconnect');
});
controller.on('focus', function () {
	console.log('focus');
});
controller.on('blur', function () {
	console.log('blur');
});
controller.on('deviceStreaming', function () {
	console.log('deviceStreaming');
});
controller.on('deviceStopped', function () {
	console.log('deviceStopped');
});
