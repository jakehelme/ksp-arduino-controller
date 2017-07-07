'use strict';

let util = require('util');
let async = require('async');
let moment = require('moment');
let five = require('johnny-five');
let Client = require('krpc-node');

// let joystick2Button, led;
let lcd;

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
        surfaceFlightId: null
    }
};

let logInterval = {
    period: 'seconds',
    value: 1
};

let nextLogTimer = null;

const clientCreated = (err, clientCreated) => {
    console.log("client connected");
    if (err) {
        throw err;
    }
    client = clientCreated;
    async.series(
        [
            getInitialInfo,
            connectToStreamServer,
            getVesselInfo,
            getMoreVesselInfo,
            addPitchToStream,
            connectBoard
        ],
        function (err) {
            if (err) {
                throw err;
            }
            client.stream.on('message', streamUpdate);
            incrementNextLogTimer();
        }
    );
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

const streamUpdate = (streamState) => {
    if (moment.utc().isAfter(nextLogTimer)) {
        if (typeof lcd !== 'undefined') {
            lcd.clear().print(`Pitch: ${Math.round(streamState.pitch * 100) / 100}`);
        }
        incrementNextLogTimer();
    }
}

const incrementNextLogTimer = () => {
    nextLogTimer = moment.utc().add(logInterval.value, logInterval.period);
}

const connectBoard = (callback) => {
    let board = five.Board({
        repl: false,
        debug: false,
    });
    board.on('ready', () => {
        console.log('board connected');
        let joystick1Button = new five.Button({
            pin: 50,
            isPullup: true
        });

        let joystick2Button = new five.Button({
            pin: 48,
            isPullup: true
        });

        let toggle1 = new five.Switch(51);
        let toggle2 = new five.Switch(49);
        // let toggle3 = new five.Switch();
        let toggle4 = new five.Switch(47);

        let joystick1 = new five.Joystick({
            pins: ['A0', 'A1'],
            invertY: true
        });

        let joystick2 = new five.Joystick({
            pins: ['A2', 'A3']
        });

        let slider = new five.Sensor("A4");

        lcd = new five.LCD({
            pins: [7, 8, 9, 10, 11, 12],
            rows: 2,
            cols: 16
        });

        joystick1Button.on('down', function (value) {
            client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
        });

        joystick2Button.on('down', function (value) {
            client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
        });

        toggle1.on("close", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, true));
        });

        toggle1.on("open", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, false));
        });

        toggle2.on("close", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, true));
        });

        toggle2.on("open", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, false));
        });

        toggle4.on("close", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, true));
        });

        toggle4.on("open", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, false));
        });

        joystick1.on('change', function () {
            client.send(client.services.spaceCenter.controlSetYaw(state.vessel.controlId, getJoystickValue(this.x)));
            client.send(client.services.spaceCenter.controlSetThrottle(state.vessel.controlId, changeThrottle(this.y)));
        });

        joystick2.on('change', function () {
            client.send(client.services.spaceCenter.controlSetRoll(state.vessel.controlId, getJoystickValue(this.x)));
            client.send(client.services.spaceCenter.controlSetPitch(state.vessel.controlId, getJoystickValue(this.y)));
        });

        // slider.scale([0, 100]).on("change", function () {
        //     console.log("slide", this.value);
        // });

        console.log('Board ready');
        return callback();
    });
}

const getJoystickValue = (input) => {
    if (input > joystickDeadzone) {
        return input;
    } else if (input < -joystickDeadzone) {
        return input;
    } else {
        return 0.0;
    }
}

const changeThrottle = (input) => {
    if (input > joystickDeadzone) {
        state.vessel.throttle += (step + (input / inputScale));
    } else if (input < -joystickDeadzone) {
        state.vessel.throttle -= (step - (input / inputScale));
    }

    if (state.vessel.throttle > 1) {
        state.vessel.throttle = 1;
    } else if (state.vessel.throttle < 0) {
        state.vessel.throttle = 0;
    }
    return state.vessel.throttle;
}

const getInitialInfo = (callback) => {
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
        console.log('connected to stream');
        return callback(err);
    });
}

const getVesselInfo = (callback) => {
    let calls = [
        client.services.spaceCenter.vesselGetControl(state.vessel.id),
        client.services.spaceCenter.vesselGetSurfaceReferenceFrame(state.vessel.id)
    ];

    client.send(calls, function (err, response) {
        if (err) {
            return callback(err);
        }
        state.vessel.controlId = getFirstResult(response);
        state.vessel.surfaceReference = getResultN(response, 1);
        return callback();
    });
}

const getMoreVesselInfo = (callback) => {
    let calls = [
        client.services.spaceCenter.controlGetThrottle(state.vessel.controlId),
        client.services.spaceCenter.vesselFlight(state.vessel.id, state.vessel.surfaceReference)
    ];

    client.send(calls, (err, response) => {
        if (err) {
            return callback(err);
        }
        state.vessel.throttle = getFirstResult(response);
        state.vessel.surfaceFlightId = getResultN(response, 1);
        return callback();
    });
};

const addPitchToStream = (callback) => {
    const call = client.services.spaceCenter.flightGetPitch(state.vessel.surfaceFlightId);
    client.addStream(call, 'pitch', callback);
}
