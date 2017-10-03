const five = require('johnny-five');

const joystickDeadzone = 0.03;
let lcd;

const getJoystickValue = (input) => {
	if (input > joystickDeadzone) {
		return input;
	} else if (input < -joystickDeadzone) {
		return input;
	} else {
		return 0.0;
	}
};

const printToLcd = (input) => {
	lcd.home().print(input);
};

const connectBoard = (client, state, callback) => {
	let board = five.Board({
		repl: false,
		debug: false,
	});
	board.on('ready', () => {
		console.log('board connected');

		let abort = new five.Switch(40);
		let toggle1 = new five.Switch(44);
		let toggle2 = new five.Switch(43);
		let toggle3 = new five.Switch(42);
		let toggle4 = new five.Switch(41);
		let action1 = new five.Button(53);
		let action2 = new five.Button(52);
		let action3 = new five.Button(51);
		let action4 = new five.Button(50);
		let action5 = new five.Button(49);
		let action6 = new five.Button(48);
		let action7 = new five.Button(47);
		let action8 = new five.Button(46);
		let action9 = new five.Button(45);
		let slider = new five.Sensor('A6');

		let joystick1Button = new five.Button({
			pin: 39,
			isPullup: true
		});

		let joystick2Button = new five.Button({
			pin: 38,
			isPullup: true
		});

		let joystick1 = new five.Joystick({
			pins: ['A0', 'A1'],
			invertY: true
		});

		let joystick2 = new five.Joystick({
			pins: ['A2', 'A3']
		});

		lcd = new five.LCD({
			pins: [7, 8, 9, 10, 11, 12],
			rows: 2,
			cols: 16
		});

		joystick1Button.on('down', function () {
			client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
		});

		joystick2Button.on('down', function () {
			client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
		});

		toggle1.on('close', function () {
			client.send(client.services.spaceCenter.controlSetLights(state.vessel.controlId, true));
		});

		toggle1.on('open', function () {
			client.send(client.services.spaceCenter.controlSetLights(state.vessel.controlId, false));
		});

		toggle2.on('close', function () {
			client.send(client.services.spaceCenter.controlSetBrakes(state.vessel.controlId, true));
		});

		toggle2.on('open', function () {
			client.send(client.services.spaceCenter.controlSetBrakes(state.vessel.controlId, false));
		});

		toggle3.on('close', function () {
			client.send(client.services.spaceCenter.controlSetRcs(state.vessel.controlId, true));
		});

		toggle3.on('open', function () {
			client.send(client.services.spaceCenter.controlSetRcs(state.vessel.controlId, false));
		});

		toggle4.on('close', function () {
			client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, true));
		});

		toggle4.on('open', function () {
			client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, false));
		});

		abort.on('open', function () {
			client.send(client.services.spaceCenter.controlSetAbort(state.vessel.controlId, false));
		});

		abort.on('close', function () {
			client.send(client.services.spaceCenter.controlSetAbort(state.vessel.controlId, true));
		});

		action1.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 1));
		});

		action2.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 2));
		});

		action3.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 3));
		});

		action4.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 4));
		});

		action5.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 5));
		});

		action6.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 6));
		});

		action7.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 7));
		});

		action8.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 8));
		});

		action9.on('press', function () {
			client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 9));
		});

		joystick1.on('change', function () {
			client.send(client.services.spaceCenter.controlSetYaw(state.vessel.controlId, getJoystickValue(this.x)));
		});

		joystick2.on('change', function () {
			client.send(client.services.spaceCenter.controlSetRoll(state.vessel.controlId, getJoystickValue(this.x)));
			client.send(client.services.spaceCenter.controlSetPitch(state.vessel.controlId, getJoystickValue(this.y)));
		});

		slider.scale([0, 1]).on('change', function () {
			client.send(client.services.spaceCenter.controlSetThrottle(state.vessel.controlId, 1 - this.value));
		});

		console.log('Board ready');
		return callback();
	});
};

module.exports = { 
	connectBoard,
	printToLcd   
};