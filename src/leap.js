let heightMin, heightMax;
const async = require('async');
const Client = require('krpc-node');
const krpcThings = require('./setup');
const clamp = require('./util/clamp');

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
	async.series(
		[
			(callback) => {
				krpcThings.getInitialInfo(client, state, callback);
			},
			// (callback) => { krpcThings.connectToStreamServer(client, state, callback); },
			(callback) => {
				krpcThings.getVesselInfo(client, state, callback);
			},
			(callback) => {
				krpcThings.getCameraInfo(client, state, callback);
			},
			// (callback) => { krpcThings.getKerbinReferenceFrames(client, state, callback); },
			// (callback) => { krpcThings.getKerbinFlight(client, state, callback); },
			// (callback) => { krpcThings.addSpeedToStream(client, state, callback); },
			// (callback) => { krpcThings.connectBoard(client, state, callback) ;}
		],
		function (err) {
			if (err) {
				throw err;
			}
		}
	);
};

Client(null, onClientCreated);

var Leap = require('leapjs');

function toDeg(radians) {
	return radians * 180 / Math.PI;
}

function minMax(value) {
	if (isNaN(heightMax) && isNaN(heightMin)) {
		heightMax = value;
		heightMin = value;
	} else if (value < heightMin) {
		heightMin = value;
	} else if (value > heightMax) {
		heightMax = value;
	}

}

const leapRange = 150;
const leapMin = 0;
const kspMin = 0.5;
const kspMax = 150000;
const kspRange = kspMax - kspMin;
let hasChanged = false;

function scaleZoom(fromLeap) {
	return (((fromLeap - leapMin) * kspRange) / leapRange) + kspMin;
}

function pinchZoom(pinchStrength) {
	if (pinchStrength > 0.97) {
		state.camera.distance = clamp(state.camera.distance - 0.5, kspMin, kspMax);
		hasChanged = true;
	} else if (pinchStrength < 0.025) {
		state.camera.distance = clamp(state.camera.distance + 0.5, kspMin, kspMax);
		hasChanged = true;
	}
	return state.camera.distance;
}

var controller = new Leap.Controller({
	enableGestures: true
});
controller.loop(function (frame) {
	for (var i in frame.handsMap) {
		var hand = frame.handsMap[i];
		minMax(hand.palmPosition[2]);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Roll: ${toDeg(hand.roll()).toFixed(3)}\t\tPitch: ${toDeg(hand.pitch()).toFixed(3)}\t\tYaw: ${toDeg(hand.yaw()).toFixed(3)}\t\tPinch Str: ${hand.pinchStrength}\t\tDistance: ${state.camera.distance}`);
		const newZoomDist = pinchZoom(hand.pinchStrength);
		if(hasChanged){
			hasChanged = false;
			client.send([
				// client.services.spaceCenter.cameraSetPitch(state.camera.id, toDeg(hand.pitch())),
				// client.services.spaceCenter.cameraSetHeading(state.camera.id, toDeg(hand.yaw() * 3)),
				client.services.spaceCenter.cameraSetDistance(state.camera.id, newZoomDist)
			]);
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
