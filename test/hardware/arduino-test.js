const five = require('johnny-five');

const controllerSettings = require('./../../src/hardware/arduino/controllerConfig');

describe('Arduino control check', function() {
	this.timeout(30000);
	let board;
	let togglePassCount = 3;

	before(function(done) {
		board = five.Board({
			repl: false,
			debug: false
		});
		board.on('ready', function() {
			console.log('board ready');

			// init();
			// registerListeners();
			done();
		});
	});

	describe('toggles', function() {
		describe('toggle 1', function() {
			it('should toggle', function(done) {
				let toggle1 = new five.Switch(controllerSettings.toggle1);
				let toggles = 0;

				function finish() {
					if (toggles > togglePassCount) {
						toggle1.removeAllListeners();
						done();
					}
				}

				toggle1.on('close', function() {
					toggles++;
					finish();
				});

				toggle1.on('open', function() {
					toggles++;
					finish();
				});
			});
		});

		describe('toggle 2', function() {
			it('should toggle', function(done) {
				let toggle2 = new five.Switch(controllerSettings.toggle2);
				let toggles = 0;

				function finish() {
					if (toggles > togglePassCount) {
						toggle2.removeAllListeners();
						done();
					}
				}

				toggle2.on('close', function() {
					toggles++;
					finish();
				});

				toggle2.on('open', function() {
					toggles++;
					finish();
				});
			});
		});

		describe('toggle 3', function() {
			it('should toggle', function(done) {
				let toggle3 = new five.Switch(controllerSettings.toggle3);
				let toggles = 0;

				function finish() {
					if (toggles > togglePassCount) {
						toggle3.removeAllListeners();
						done();
					}
				}

				toggle3.on('close', function() {
					toggles++;
					finish();
				});

				toggle3.on('open', function() {
					toggles++;
					finish();
				});
			});
		});

		describe('toggle 4', function() {
			it('should toggle', function(done) {
				let toggle4 = new five.Switch(controllerSettings.toggle4);
				let toggles = 0;

				function finish() {
					if (toggles > togglePassCount) {
						toggle4.removeAllListeners();
						done();
					}
				}

				toggle4.on('close', function() {
					toggles++;
					finish();
				});

				toggle4.on('open', function() {
					toggles++;
					finish();
				});
			});
		});
	});
});
