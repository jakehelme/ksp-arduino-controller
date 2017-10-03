const five = require('johnny-five');
const clamp = require('./util/clamp');

const joystickDeadzone = 0.03;
let isCameraControlMode = false;
let lcd = null;

const cameraModes = ['Free', 'Chase', 'Locked', 'Orbital', 'Map'];
let cameraModeIndex = 0;

const getNextCameraMode = () => {
	cameraModeIndex = (cameraModeIndex + 1) % cameraModes.length;
	return cameraModes[cameraModeIndex];
};


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
	const board = five.Board({
		repl: false,
		debug: false,
	});
	board.on('ready', () => {
		console.log('board connected');

		const abort = new five.Switch(40);
		const toggle1 = new five.Switch(44);
		const toggle2 = new five.Switch(43);
		const toggle3 = new five.Switch(42);
		const toggle4 = new five.Switch(41);
		const action1 = new five.Button(53);
		const action2 = new five.Button(52);
		const action3 = new five.Button(51);
		const action4 = new five.Button(50);
		const action5 = new five.Button(49);
		const action6 = new five.Button(48);
		const action7 = new five.Button(47);
		const action8 = new five.Button(46);
		const action9 = new five.Button(45);
		const slider = new five.Sensor('A6');

		const joystick1Button = new five.Button({
			pin: 39,
			isPullup: true
		});

		const joystick2Button = new five.Button({
			pin: 38,
			isPullup: true
		});

		const joystick1 = new five.Joystick({
			pins: ['A0', 'A1'],
			invertY: true
		});

		const joystick2 = new five.Joystick({
			pins: ['A2', 'A3']
		});

		lcd = new five.LCD({
			pins: [7, 8, 9, 10, 11, 12],
			rows: 2,
			cols: 16
		});

		joystick1Button.on('down', function () {
			client.send([client.services.spaceCenter.cameraSetMode(state.camera.id, getNextCameraMode())]);
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
			isCameraControlMode = true;
		});

		toggle2.on('open', function () {
			isCameraControlMode = false;
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
			if(isCameraControlMode){
				state.camera.distance = clamp(state.camera.distance + getJoystickValue(this.y), state.camera.minDistance, state.camera.maxDistance);
				client.send(client.services.spaceCenter.cameraSetDistance(state.camera.id, state.camera.distance));
			} else {
				client.send(client.services.spaceCenter.controlSetYaw(state.vessel.controlId, getJoystickValue(this.x)));
			}
		});

		joystick2.on('change', function () {
			if(isCameraControlMode) {
				state.camera.pitch = clamp(state.camera.pitch + getJoystickValue(this.y), state.camera.minPitch, state.camera.maxPitch);
				state.camera.heading += getJoystickValue(this.x);
				client.send(client.services.spaceCenter.cameraSetPitch(state.camera.id, state.camera.pitch));
				client.send(client.services.spaceCenter.cameraSetHeading(state.camera.id, state.camera.heading));
			} else {
				client.send(client.services.spaceCenter.controlSetRoll(state.vessel.controlId, getJoystickValue(this.x)));
				client.send(client.services.spaceCenter.controlSetPitch(state.vessel.controlId, getJoystickValue(this.y)));
			}
		});
		
		slider.scale([0, 1]).on('change', function () {
			let newValue = 1 - this.value;
			if (newValue > 0.97) {
				newValue = 1;
			} else if(newValue < 0.03) {
				newValue = 0;
			}
			client.send(client.services.spaceCenter.controlSetThrottle(state.vessel.controlId, newValue));
		});

		console.log('Board ready');
		return callback();
	});
};

module.exports = {
	connectBoard,
	printToLcd
};
