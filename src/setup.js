const { getFirstResult, getResultN } = require('./util/getResults');

const getInitialInfo = (client, state, callback) => {
	let calls = [
		client.services.krpc.getClientId(),
		client.services.spaceCenter.getActiveVessel(),
		client.services.spaceCenter.getBodies()
	];
	client.send(calls, function (err, response) {
		if (err) {
			return callback(err);
		}
		state.clientId = getResultN(response, 0).toString('base64');
		state.vessel = {
			id: getResultN(response, 1)
		};
		state.celestialBodies = getResultN(response, 2);
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
		client.services.spaceCenter.vesselFlight(state.vessel.id, state.kerbinNonRotatingReferenceFrame)
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
	getKerbinReferenceFrames,
	getKerbinFlight,
	addSpeedToStream
};
