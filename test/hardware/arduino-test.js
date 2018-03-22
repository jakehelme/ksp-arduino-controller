const five = require('johnny-five');

const controllerSettings = require('./../../src/hardware/arduino/controllerConfig');

// let board;

// let abort;
// let toggle1;
// let toggle2;
// let toggle3;
// let toggle4;
// let action1;
// let action2;
// let action3;
// let action4;
// let action5;
// let action6;
// let action7;
// let action8;
// let action9;
// let slider;
// let joystickLeftButton;
// let joystickRightButton;
// let joystickLeft;
// let joystickRight;
// let lcd;

// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);

// process.stdin.on('keypress', (str, key) => {
// 	// "Raw" mode so we must do our own kill switch
// 	if (key.sequence === '\u001B') {
// 		process.exit();
// 	}

// 	if (key.sequence === '\u000D') {
// 		console.log('done');
// 		process.exit();
// 	}
// });

// function init() {
// 	abort = new five.Switch(controllerSettings.abort);

// 	toggle2 = new five.Switch(controllerSettings.toggle2);
// 	toggle3 = new five.Switch(controllerSettings.toggle3);
// 	toggle4 = new five.Switch(controllerSettings.toggle4);
// 	action1 = new five.Button(controllerSettings.action1);
// 	action2 = new five.Button(controllerSettings.action2);
// 	action3 = new five.Button(controllerSettings.action3);
// 	action4 = new five.Button(controllerSettings.action4);
// 	action5 = new five.Button(controllerSettings.action5);
// 	action6 = new five.Button(controllerSettings.action6);
// 	action7 = new five.Button(controllerSettings.action7);
// 	action8 = new five.Button(controllerSettings.action8);
// 	action9 = new five.Button(controllerSettings.action9);
// 	slider = new five.Sensor(controllerSettings.slider);

// 	joystickLeftButton = new five.Button(controllerSettings.joystickButtonLeft);

// 	joystickRightButton = new five.Button(controllerSettings.joystickButtonRight);

// 	joystickLeft = new five.Joystick(controllerSettings.joystickLeft);

// 	joystickRight = new five.Joystick(controllerSettings.joystickRight);

// 	lcd = new five.LCD(controllerSettings.lcd);
// }

// function registerListeners() {
// 	joystickLeftButton.on('down', function() {
// 		console.log('joystick left button down');
// 	});

// 	joystickRightButton.on('down', function() {
// 		console.log('joystick right button down');
// 	});

// 	toggle1.on('close', function() {
// 		console.log('toggle 1 close');
// 	});

// 	toggle1.on('open', function() {
// 		console.log('toggle 1 open');
// 	});

// 	toggle2.on('close', function() {
// 		console.log('toggle 2 close');
// 	});

// 	toggle2.on('open', function() {
// 		console.log('toggle 2 open');
// 	});

// 	toggle3.on('close', function() {
// 		console.log('toggle 3 close');
// 	});

// 	toggle3.on('open', function() {
// 		console.log('toggle 3 open');
// 	});

// 	toggle4.on('close', function() {
// 		console.log('toggle 4 close');
// 	});

// 	toggle4.on('open', function() {
// 		console.log('toggle 4 open');
// 	});

// 	abort.on('open', function() {
// 		console.log('abort open');
// 	});

// 	abort.on('close', function() {
// 		console.log('abort close');
// 	});

// 	action1.on('press', function() {
// 		console.log('action 1 press');
// 	});

// 	action2.on('press', function() {
// 		console.log('action 2 press');
// 	});

// 	action3.on('press', function() {
// 		console.log('action 3 press');
// 	});

// 	action4.on('press', function() {
// 		console.log('action 4 press');
// 	});

// 	action5.on('press', function() {
// 		console.log('action 5 press');
// 	});

// 	action6.on('press', function() {
// 		console.log('action 6 press');
// 	});

// 	action7.on('press', function() {
// 		console.log('action 7 press');
// 	});

// 	action8.on('press', function() {
// 		console.log('action 8 press');
// 	});

// 	action9.on('press', function() {
// 		console.log('action 9 press');
// 	});

// 	joystickLeft.on('data', function() {
// 		console.log(`joystick left: x: ${this.x} y: ${this.y}`);
// 	});

// 	joystickRight.on('data', function() {
// 		console.log(`joystick right: x: ${this.x} y: ${this.y}`);
// 	});
// }
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

	// describe('action buttons', function() {
	// 	togglePassCount = 1;
	// 	describe('action 1', function() {
	// 		it('should press', function(done) {
	// 			let action1 = new five.Switch(controllerSettings.action1);
	// 			let toggles = 0;

	// 			action1.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action1.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 2', function() {
	// 		it('should press', function(done) {
	// 			let action2 = new five.Switch(controllerSettings.action2);
	// 			let toggles = 0;

	// 			action2.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action2.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 3', function() {
	// 		it('should press', function(done) {
	// 			let action3 = new five.Switch(controllerSettings.action3);
	// 			let toggles = 0;

	// 			action3.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action3.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 4', function() {
	// 		it('should press', function(done) {
	// 			let action4 = new five.Switch(controllerSettings.action4);
	// 			let toggles = 0;

	// 			action4.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action4.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 5', function() {
	// 		it('should press', function(done) {
	// 			let action5 = new five.Switch(controllerSettings.action5);
	// 			let toggles = 0;

	// 			action5.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action5.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 6', function() {
	// 		it('should press', function(done) {
	// 			let action6 = new five.Switch(controllerSettings.action6);
	// 			let toggles = 0;

	// 			action6.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action6.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 7', function() {
	// 		it('should press', function(done) {
	// 			let action7 = new five.Switch(controllerSettings.action7);
	// 			let toggles = 0;

	// 			action7.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action7.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 8', function() {
	// 		it('should press', function(done) {
	// 			let action8 = new five.Switch(controllerSettings.action8);
	// 			let toggles = 0;

	// 			action8.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action8.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});

	// 	describe('action 9', function() {
	// 		it('should press', function(done) {
	// 			let action9 = new five.Switch(controllerSettings.action9);
	// 			let toggles = 0;

	// 			action9.on('close', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});

	// 			action9.on('open', function() {
	// 				toggles++;
	// 				finish(toggles, this, done);
	// 			});
	// 		});
	// 	});
	// });
});

// function test() {
// 	toggle1.on('open', function() {
// 		console.log('toggle 1 open');
// 	});

// 	console.log('Toggle toggle1 to open, press enter when satisfied');
// 	toggle1.
// }
