const { getFirstResult, getResultN } = require('./util/getResults');

const getInitialInfo = (client, state, callback) => {
	let calls = [
		client.services.krpc.getClientId(),
		client.services.spaceCenter.getCamera(),
		client.services.spaceCenter.getActiveVessel(),
		client.services.spaceCenter.getBodies()
	];
	client.send(calls, function (err, response) {
		if (err) {
			return callback(err);
		}
		state.clientId = getResultN(response, 0).toString('base64');
		state.camera.id = getResultN(response, 1);
		state.vessel.id = getResultN(response, 2);
		state.celestialBodies = getResultN(response, 3);
		return callback();
	});
};

const connectToStreamServer = (client, state, callback) => {
	client.connectToStreamServer(state.clientId, function (err) {
		console.log('connected to stream');
		return callback(err);
	});
};

const getVesselInfo = (client, state, callback) => {
	let calls = [
		client.services.spaceCenter.vesselGetControl(state.vessel.id),
	];

	client.send(calls, function (err, response) {
		if (err) {
			return callback(err);
		}
		state.vessel.controlId = getFirstResult(response);
		return callback();
	});
};

const getCameraInfo = (client, state, callback) => {
	let calls = [
		client.services.spaceCenter.cameraGetPitch(state.camera.id),
		client.services.spaceCenter.cameraGetHeading(state.camera.id),
		client.services.spaceCenter.cameraGetDistance(state.camera.id),
		client.services.spaceCenter.cameraGetMinPitch(state.camera.id),
		client.services.spaceCenter.cameraGetMaxPitch(state.camera.id),
		client.services.spaceCenter.cameraGetMinDistance(state.camera.id),
		client.services.spaceCenter.cameraGetMaxDistance(state.camera.id),
	];

	client.send(calls, function (err, response) {
		if (err) {
			return callback(err);
		}
		state.camera.pitch = getFirstResult(response);
		state.camera.heading = getResultN(response, 1);
		state.camera.distance = getResultN(response, 2);
		state.camera.minPitch = getResultN(response, 3);
		state.camera.maxPitch = getResultN(response, 4);
		state.camera.minDistance = getResultN(response, 5);
		state.camera.maxDistance = getResultN(response, 6);
		console.log(`Min dist: ${state.camera.minDistance}`);
		console.log(`Max dist: ${state.camera.maxDistance}`);
		return callback();
	});
};

const getKerbinReferenceFrames = (client, state, callback) => {
	let calls = [
		client.services.spaceCenter.celestialBodyGetReferenceFrame(state.celestialBodies.Kerbin),
		client.services.spaceCenter.celestialBodyGetNonRotatingReferenceFrame(state.celestialBodies.Kerbin)
	];

	client.send(calls, (err, response) => {
		if (err) {
			return callback(err);
		}
		state.kerbinReferenceFrame = getFirstResult(response);
		state.kerbinNonRotatingReferenceFrame = getResultN(response, 1);
		return callback();
	});
};

const getKerbinFlight = (client, state, callback) => {
	let calls = [
		client.services.spaceCenter.vesselFlight(state.vessel.id, state.kerbinReferenceFrame),
		client.services.spaceCenter.vesselFlight(state.vessel.id, state.kerbinNonRotatingReferenceFrame),
	];

	client.send(calls, (err, response) => {
		if (err) {
			return callback(err);
		}
		state.vessel.kerbinFlight = getFirstResult(response);
		state.vessel.kerbinNonRotatingFlight = getResultN(response, 1);
		return callback();
	});
};

const addSpeedToStream = (client, state, callback) => {
	const call = client.services.spaceCenter.flightGetSpeed(state.vessel.kerbinFlight);
	client.addStream(call, 'speed', callback);
};

module.exports = {
	getInitialInfo,
	connectToStreamServer,
	getVesselInfo,
	getCameraInfo,
	getKerbinReferenceFrames,
	getKerbinFlight,
	addSpeedToStream
};
