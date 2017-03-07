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
  five.Board().on("ready", () => {
    button = new five.Button({
      pin: 53,
      isPullup: true
    });

    led = new five.Led(13);

    button.on("down", function (value) {
      led.on();
      client.rpc.send(client.services.spaceCenter.controlActivateNextStage(game.vessel.control.id));
      console.log('down');
    });

    button.on("up", function () {
      led.off();
      console.log('up');
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
  replaceMessageHandler(getThrottleValueComplete);
  client.rpc.send(client.services.spaceCenter.controlGetThrottle(game.vessel.control.id));
}

const getThrottleValueComplete = (response) => {
  game.vessel.control.throttle = getFirstResult(response);
  console.log(util.format("Updating throttle value from %s to 1", game.vessel.control.throttle));
  replaceMessageHandler(setThrottleToFullComplete);
  var call = client.services.spaceCenter.controlSetThrottle(game.vessel.control.id, 1);
  client.rpc.send(call);
}

const setThrottleToFullComplete = (response) => {
  replaceMessageHandler(launched);
  // client.rpc.send(client.services.spaceCenter.controlActivateNextStage(game.vessel.control.id));
}

const launched = (response) => {
  console.log("launched!!");
  process.exit(0);
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
