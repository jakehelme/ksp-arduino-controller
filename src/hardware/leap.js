const Leap = require('leapjs');
const clamp = require('./../util/clamp');
const rollOver = require('./../util/rollOver');
const toDeg = require('./../util/toDeg');

const kspZoomMin = 0.5;
const kspZoomMax = 150000;

const zoomDeadZone = 45;
const grabStrengthCutoff = 0.02;
const zoomSpeed = 0.25;
const pitchSpeed = 0.3;
const rollSpeed = 0.5;
const pitchCutoffAngle = 80;
const pitchCancelAngle = 45;
const rollCutoffAngle = 80;

let headingChanged = false;
let pitchChanged = false;
let zoomChanged = false;
let controller = null;

function listenToLeap(client, state, callback) {
	function grabZoom(grabStrength, pitch, roll) {
		if (pitch > -zoomDeadZone && pitch < zoomDeadZone && roll > -zoomDeadZone && roll < zoomDeadZone) {
			if (grabStrength > 1 - grabStrengthCutoff) {
				state.camera.distance = clamp(state.camera.distance - zoomSpeed, kspZoomMin, kspZoomMax);
				zoomChanged = true;
			} else if (grabStrength < grabStrengthCutoff) {
				state.camera.distance = clamp(state.camera.distance + zoomSpeed, kspZoomMin, kspZoomMax);
				zoomChanged = true;
			}
		}
		return state.camera.distance;
	}

	function adjustPitch(handPitch) {
		if (handPitch > pitchCutoffAngle) {
			state.camera.pitch = clamp(state.camera.pitch - pitchSpeed, state.camera.minPitch, state.camera.maxPitch);
			pitchChanged = true;
		} else if (handPitch < -pitchCutoffAngle) {
			state.camera.pitch = clamp(state.camera.pitch + pitchSpeed, state.camera.minPitch, state.camera.maxPitch);
			pitchChanged = true;
		}

		return state.camera.pitch;
	}

	function adjustHeading(handRoll, pitch) {
		if (pitch < pitchCancelAngle && pitch > -pitchCancelAngle) {
			if (handRoll > rollCutoffAngle) {
				state.camera.heading = rollOver(state.camera.heading - rollSpeed, 0, 360);
				headingChanged = true;
			} else if (handRoll < -rollCutoffAngle) {
				state.camera.heading = rollOver(state.camera.heading + rollSpeed, 0, 360);
				headingChanged = true;
			}
		}
		return state.camera.heading;
	}

	controller.loop(function(frame) {
		for (var i in frame.handsMap) {
			var hand = frame.handsMap[i];
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

function disable() {
	controller.disconnect();
}

function enable() {
	controller.connect();
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
	listenToLeap,
	disable,
	enable
};
