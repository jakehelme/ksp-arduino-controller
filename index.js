'use strict';

let util = require('util');
let five = require('johnny-five');
let Client = require('krpc-node');

let client, button, led;

let game = {};

const init = () => {
  connectBoard();
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

    var joystick = new five.Joystick({
      pins: ['A0', 'A1']
    });

    button.on('down', function (value) {
      client.rpc.send(client.services.spaceCenter.controlActivateNextStage(game.vessel.control.id));
    });

    joystick.on('change', function () {
      client.rpc.send(client.services.spaceCenter.controlSetPitch(game.vessel.control.id, this.x));
      client.rpc.send(client.services.spaceCenter.controlSetRoll(game.vessel.control.id, this.y));
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
  replaceMessageHandler(() => {});
}

const setThrottleToFullComplete = (response) => {
  replaceMessageHandler(launched);
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
