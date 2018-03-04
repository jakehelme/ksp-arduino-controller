const Leap = require('leapjs');
const clamp = require('./util/clamp');
const rollOver = require('./util/rollOver');
const toDeg = require('./util/toDeg');

const kspMin = 0.5;
const kspMax = 150000;

let headingChanged = false;
let pitchChanged = false;
let zoomChanged = false;
let controller = null;

function listenToLeap(client, state, callback) {
	function grabZoom(grabStrength, pitch, roll) {
		if (pitch > -45 && pitch < 45 && roll > -45 && roll < 45) {
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

	controller.loop(function(frame) {
		for (var i in frame.handsMap) {
			var hand = frame.handsMap[i];
			// process.stdout.clearLine();
			// process.stdout.cursorTo(0);
			// process.stdout.write(`Roll: ${toDeg(hand.roll()).toFixed(3)}\t\tPitch: ${toDeg(hand.pitch()).toFixed(3)}\t\tGrab Str: ${hand.grabStrength}`);
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

	return callback();
}

function initLeap(callback) {
	controller = new Leap.Controller({
		enableGestures: false
	});

	controller.on('ready', function() {
		console.log('ready');
	});

	controller.on('connect', function() {
		console.log('connect');
	});

	controller.on('disconnect', function() {
		console.log('disconnect');
	});

	controller.on('focus', function() {
		console.log('focus');
	});

	controller.on('blur', function() {
		console.log('blur');
	});

	controller.on('deviceStreaming', function() {
		console.log('deviceStreaming');
	});

	controller.on('deviceStopped', function() {
		console.log('deviceStopped');
	});
	return callback();
}

module.exports = {
	initLeap,
	listenToLeap
};
