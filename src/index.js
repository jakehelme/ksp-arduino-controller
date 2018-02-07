const async = require('async');
const Client = require('krpc-node');
const { processStreamUpdate, incrementNextLogTimer } = require('./streams.js');
const { connectBoard } = require('./board');
const { 
	getInitialInfo,
	connectToStreamServer, 
	getVesselInfo, 
	getCameraInfo,
	getKerbinReferenceFrames, 
	getKerbinFlight, 
	addSpeedToStream 
} = require('./setup');

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
			(callback) => { getInitialInfo(client, state, callback); },
			(callback) => { connectToStreamServer(client, state, callback); },
			(callback) => { getVesselInfo(client, state, callback); },
			(callback) => { getCameraInfo(client, state, callback); },
			(callback) => { getKerbinReferenceFrames(client, state, callback); },
			(callback) => { getKerbinFlight(client, state, callback); },
			(callback) => { addSpeedToStream(client, state, callback); },
			(callback) => { connectBoard(client, state, callback) ;}
		],
		function (err) {
			if (err) {
				throw err;
			}
			client.stream.on('message', processStreamUpdate);
			incrementNextLogTimer();
		}
	);
};

Client(null, onClientCreated);
