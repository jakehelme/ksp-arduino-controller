'use strict';

let util = require('util');
let async = require('async');
let moment = require('moment');
let five = require('johnny-five');
let Client = require('krpc-node');

let joystick2Button, led;

const step = 0.001;
const joystickDeadzone = 0.03;
const inputScale = 10;

let client = null;
let state = {
    clientId: null,
    vessel: {
        id: null,
        controlId: null,
        surfaceReference: null,
        surfaceFlightId: null,
        throttle: null
    }
};

let logInterval = {
    period: 'seconds',
    value: 1
};

let nextLogTimer = null;



const clientCreated = (err, clientCreated) => {
  if(err) {
    throw err;
  }

  client = clientCreated;

  async.waterfall([
    getClientIdAndActiveVessel,
    connectToStreamServer,
    getVesselControl,
    getThrottle,
    connectBoard
  ], function (err) {
    if (err) {
      throw err;
    }
    client.stream.on('message', streamUpdate);
    incrementNextLogTimer();
  });
}

Client(null, clientCreated);

const getFirstResult = (response) => {
    return getResultN(response, 0);
}

const getResultN = (response, n) => {
    if (response.error) {
        throw response.error;
    }
    let result = response.results[n];
    if (result.error) {
        throw result.error;
    }
    return result.value;
}

const getClientIdAndActiveVessel = (callback) => {
    let calls = [
        client.services.krpc.getClientId(),
        client.services.spaceCenter.getActiveVessel()
    ];
    client.send(calls, function (err, response) {
        if (err) {
            return callback(err);
        }
        state.clientId = getResultN(response, 0).toString('base64');
        state.vessel = {
            id: getResultN(response, 1)
        };
        return callback();
    });
}

const connectToStreamServer = (callback) => {
    client.connectToStreamServer(state.clientId, function (err) {
        return callback(err);
    });
}

const getVesselControl = (callback) => {
    client.send(client.services.spaceCenter.vesselGetControl(state.vessel.id), function (err, response) {
        if (err) {
            return callback(err);
        }
        state.vessel.controlId = getFirstResult(response);
        return callback();
    });
}

const getThrottle = (callback) => {
  client.send(client.services.spaceCenter.controlGetThrottle(state.vessel.controlId), function (err, response) {
    if(err) {
      return callback(err);
    }
    state.vessel.throttle = getFirstResult(response);
    return callback();
  });
}

const getVesselGetSurfaceReferenceFrame = (callback) => {
    client.send(client.services.spaceCenter.vesselGetSurfaceReferenceFrame(state.vessel.id), function (err, response) {
        if (err) {
            return callback(err);
        }
        state.vessel.surfaceReference = getFirstResult(response);
        return callback();
    });
}

const getVesselFlight = (callback) => {
    client.send(client.services.spaceCenter.vesselFlight(state.vessel.id, state.vessel.surfaceReference), function (err, response) {
        if (err) {
            return callback(err);
        }
        state.vessel.surfaceFlightId = getFirstResult(response);
        return callback();
    });
}

const addPitchToStream = (callback) => {
    let getThrottle = client.services.spaceCenter.flightGetPitch(state.vessel.surfaceFlightId);
    client.addStream(getThrottle, "Pitch", throttleStreamAdded);
    function throttleStreamAdded(err) {
        return callback(err);
    }
}

const streamUpdate = (streamState) => {
    if (moment.utc().isAfter(nextLogTimer)) {
        console.log(streamState);
        incrementNextLogTimer();
    }
}

const incrementNextLogTimer = () => {
    nextLogTimer = moment.utc().add(logInterval.value, logInterval.period);
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
      client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
      console.log('Stage fired');
    });

    toggle.on("close", function () {
      client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, true));
      console.log("SAS on");
    });

    toggle.on("open", function () {
      client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, false));
      console.log("SAS off");
    });

    joystick1.on('data', function () {
      client.send(client.services.spaceCenter.controlSetYaw(state.vessel.controlId, getJoystickValue(this.x)));
      client.send(client.services.spaceCenter.controlSetThrottle(state.vessel.controlId, changeThrottle(this.y)));
    });

    joystick2.on('data', function () {
      client.send(client.services.spaceCenter.controlSetRoll(state.vessel.controlId, getJoystickValue(this.x)));
      client.send(client.services.spaceCenter.controlSetPitch(state.vessel.controlId, getJoystickValue(this.y)));
    });

    console.log('Board ready');
  });
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
    state.vessel.throttle += (step + (input/inputScale));
  } else if (input < -joystickDeadzone) {
    state.vessel.throttle -= (step - (input/inputScale));
  }

  if(state.vessel.throttle > 1){
    state.vessel.throttle = 1;
  } else if (state.vessel.throttle < 0) {
    state.vessel.throttle = 0;
  }
  return state.vessel.throttle;
}
