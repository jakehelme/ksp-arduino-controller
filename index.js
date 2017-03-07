'use strict';

let util = require('util');
let five = require('johnny-five');
let Client = require('krpc-node');

let client, button, led;

let game = {};

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
    button = new five.Button({
      pin: 53,
      isPullup: true
    });

    let joystick1 = new five.Joystick({
      pins: ['A0', 'A1']
    });

    let joystick2 = new five.Joystick({
      pins: ['A2', 'A3']
    });

    button.on('down', function (value) {
      client.rpc.send(client.services.spaceCenter.controlActivateNextStage(game.vessel.control.id));
    });

    joystick1.on('change', function () {
      const step = 0.01;
      client.rpc.send(client.services.spaceCenter.controlSetYaw(game.vessel.control.id, this.x));
      if (this.y > 0.5 && game.vessel.control.throttle < 1.0) {
        replaceMessageHandler(getThrottle);
        client.rpc.send(client.services.spaceCenter.controlSetThrottle(game.vessel.control.id, game.vessel.control.throttle + step));
        console.log(game.vessel.control.throttle);
      } else if (this.y < -0.5 && game.vessel.control.throttle > 0.0) {
        replaceMessageHandler(getThrottle);
        client.rpc.send(client.services.spaceCenter.controlSetThrottle(game.vessel.control.id, game.vessel.control.throttle - step));
        console.log(game.vessel.control.throttle);
      }
      // console.log(`x: ${this.x} y: ${this.y}`);
      // console.log(`y: ${this.y}`);
    });

    joystick2.on('change', function () {
      client.rpc.send(client.services.spaceCenter.controlSetRoll(game.vessel.control.id, this.x));
      client.rpc.send(client.services.spaceCenter.controlSetPitch(game.vessel.control.id, this.y));
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
  replaceMessageHandler(() => {});
}

const getFirstResult = (response) => {
  var result = response.results[0];
  return result.value;
}

const replaceMessageHandler = (fn) => {
  client.rpc.emitter.removeAllListeners('message');
  client.rpc.on('message', fn);
}

init();
