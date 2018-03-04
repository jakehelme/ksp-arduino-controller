const async = require('async');
const Client = require('krpc-node');

const leapClient = require('./leap');
const { processStreamUpdate, incrementNextLogTimer } = require('./streams.js');
const { connectBoard } = require('./board');
const clientSetup = require('./setup');

let client = null;
let state = {
	clientId: null,
	gameScene: null,
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

function onClientCreated(err, clientCreated) {
	console.log('client connected');
	if (err) {
		throw err;
	}
	client = clientCreated;

	function pollGameScene() {
		console.log('Polling');

		clientSetup.getGameScene(client, state, function(err) {
			if (err) {
				throw err;
			}

			if (state.gameScene !== 'Flight') {
				setTimeout(pollGameScene, 5000);
			} else {
				async.series(
					[
						callback => {
							clientSetup.getInitialInfo(client, state, callback);
						},
						callback => {
							clientSetup.connectToStreamServer(client, state, callback);
						},
						callback => {
							clientSetup.getVesselInfo(client, state, callback);
						},
						callback => {
							clientSetup.getCameraInfo(client, state, callback);
						},
						callback => {
							clientSetup.getKerbinReferenceFrames(client, state, callback);
						},
						callback => {
							clientSetup.getKerbinFlight(client, state, callback);
						},
						// callback => {
						// 	clientSetup.addSpeedToStream(client, state, callback);
						// },
						// callback => {
						// 	connectBoard(client, state, callback);
						// },
						callback => {
							leapClient.initLeap(callback);
						},
						callback => {
							leapClient.listenToLeap(client, state, callback);
						}
					],
					function(err) {
						if (err) {
							throw err;
						}
						client.stream.on('message', processStreamUpdate);
						incrementNextLogTimer();
					}
				);
			}
		});
	}
	pollGameScene();
}

Client(null, onClientCreated);
