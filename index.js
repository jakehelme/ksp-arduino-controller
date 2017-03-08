'use strict';

let util = require('util');
let five = require('johnny-five');
let Client = require('krpc-node');

let client, joystick2Button, led;

let game = {};

const step = 0.001;
const joystickDeadzone = 0.03;
const inputScale = 10;

const init = () => {
  connectClient();
}

const connectClient = () => {
  client = Client();

  client.rpc.on('open', () => {
    console.log('Connected to KSP');
    client.rpc.on('message', getActiveVesselComplete);
    client.rpc.send(client.services.spaceCenter.getActiveVessel());
  });

  client.rpc.on('error', function (err) {
    console.log(util.format('Error : %j', err));
    process.exit(1);
  });

  client.rpc.on('close', function (event) {
    console.log(util.format('Connection Closed : %j', event));
    process.exit(1);
  });
}

const connectBoard = () => {
  five.Board().on('ready', () => {
    joystick2Button = new five.Button({
      pin: 53,
      isPullup: true
    });

    let toggle = new five.Switch(51);

    let joystick2 = new five.Joystick({
      pins: ['A0', 'A1'],
      invertY: true
    });

    let joystick1 = new five.Joystick({
      pins: ['A2', 'A3']
    });

    joystick2Button.on('down', function (value) {
      client.rpc.send(client.services.spaceCenter.controlActivateNextStage(game.vessel.control.id));
      console.log('Stage fired');
    });

    toggle.on("close", function () {
      client.rpc.send(client.services.spaceCenter.controlSetSas(game.vessel.control.id, true));
      console.log("SAS on");
    });

    toggle.on("open", function () {
      client.rpc.send(client.services.spaceCenter.controlSetSas(game.vessel.control.id, false));
      console.log("SAS off");
    });

    joystick1.on('data', function () {
      client.rpc.send(client.services.spaceCenter.controlSetYaw(game.vessel.control.id, getJoystickValue(this.x)));
      client.rpc.send(client.services.spaceCenter.controlSetThrottle(game.vessel.control.id, changeThrottle(this.y)));
    });

    joystick2.on('data', function () {
      client.rpc.send(client.services.spaceCenter.controlSetRoll(game.vessel.control.id, getJoystickValue(this.x)));
      client.rpc.send(client.services.spaceCenter.controlSetPitch(game.vessel.control.id, getJoystickValue(this.y)));
    });

    console.log('Board ready');
  });
}

const getActiveVesselComplete = (response) => {
  game.vessel = {
    id: getFirstResult(response)
  };
  replaceMessageHandler(getActiveVesselControlComplete);
  client.rpc.send(client.services.spaceCenter.vesselGetControl(game.vessel.id));
}

const getActiveVesselControlComplete = (response) => {
  game.vessel.control = {
    id: getFirstResult(response)
  };
  replaceMessageHandler(getThrottleComplete);
  client.rpc.send(client.services.spaceCenter.controlGetThrottle(game.vessel.control.id));
  connectBoard();
}

const getThrottle = () => {
  replaceMessageHandler(getThrottleComplete);
  client.rpc.send(client.services.spaceCenter.controlGetThrottle(game.vessel.control.id));
}

const getThrottleComplete = (response) => {
  game.vessel.control.throttle = getFirstResult(response);
  replaceMessageHandler(() => { });
}

const getFirstResult = (response) => {
  var result = response.results[0];
  return result.value;
}

const replaceMessageHandler = (fn) => {
  client.rpc.emitter.removeAllListeners('message');
  client.rpc.on('message', fn);
}

const getJoystickValue = (input) => {
  if(input > joystickDeadzone) {
    return input;
  } else if(input < -joystickDeadzone) {
    return input;
  } else {
    return 0.0;
  }
}

const changeThrottle = (input) => {
  if(input > joystickDeadzone) {
    game.vessel.control.throttle += (step + (input/inputScale));
  } else if (input < -joystickDeadzone) {
    game.vessel.control.throttle -= (step - (input/inputScale));
  }

  if(game.vessel.control.throttle > 1){
    game.vessel.control.throttle = 1;
  } else if (game.vessel.control.throttle < 0) {
    game.vessel.control.throttle = 0;
  }
  return game.vessel.control.throttle;
}

init();
