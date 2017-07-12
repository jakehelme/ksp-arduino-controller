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
        surfaceVelocityReference: null,
        surfaceFlightId: null,
        surfaceVelocityFlightId: null
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
            addSpeedToStream,
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
            lcd.clear().print(`Speed: ${streamState.speed}`);
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
        let slider = new five.Sensor("A6");

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

        joystick1Button.on('down', function (value) {
            client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
        });

        joystick2Button.on('down', function (value) {
            client.send([client.services.spaceCenter.controlActivateNextStage(state.vessel.controlId)]);
        });

        toggle1.on("close", function () {
            client.send(client.services.spaceCenter.controlSetLights(state.vessel.controlId, true));
        });

        toggle1.on("open", function () {
            client.send(client.services.spaceCenter.controlSetLights(state.vessel.controlId, false));
        });

        toggle2.on("close", function () {
            client.send(client.services.spaceCenter.controlSetBrakes(state.vessel.controlId, true));
        });

        toggle2.on("open", function () {
            client.send(client.services.spaceCenter.controlSetBrakes(state.vessel.controlId, false));
        });

        toggle3.on("close", function () {
            client.send(client.services.spaceCenter.controlSetRcs(state.vessel.controlId, true));
        });

        toggle3.on("open", function () {
            client.send(client.services.spaceCenter.controlSetRcs(state.vessel.controlId, false));
        });

        toggle4.on("close", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, true));
        });

        toggle4.on("open", function () {
            client.send(client.services.spaceCenter.controlSetSas(state.vessel.controlId, false));
        });

        abort.on("open", function () {
            client.send(client.services.spaceCenter.controlSetAbort(state.vessel.controlId, false));
        });

        abort.on("close", function () {
            client.send(client.services.spaceCenter.controlSetAbort(state.vessel.controlId, true));
        });

        action1.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 1));
        });

        action2.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 2));
        });

        action3.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 3));
        });

        action4.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 4));
        });

        action5.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 5));
        });

        action6.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 6));
        });

        action7.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 7));
        });

        action8.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 8));
        });

        action9.on("press", function () {
            client.send(client.services.spaceCenter.controlToggleActionGroup(state.vessel.controlId, 9));
        });

        joystick1.on('change', function () {
            client.send(client.services.spaceCenter.controlSetYaw(state.vessel.controlId, getJoystickValue(this.x)));
            // client.send(client.services.spaceCenter.controlSetThrottle(state.vessel.controlId, changeThrottle(this.y)));
        });

        joystick2.on('change', function () {
            client.send(client.services.spaceCenter.controlSetRoll(state.vessel.controlId, getJoystickValue(this.x)));
            client.send(client.services.spaceCenter.controlSetPitch(state.vessel.controlId, getJoystickValue(this.y)));
        });

        slider.scale([0, 1]).on("change", function () {
            client.send(client.services.spaceCenter.controlSetThrottle(state.vessel.controlId, 1 - this.value));
        });

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

// const changeThrottle = (input) => {
//     if (input > joystickDeadzone) {
//         state.vessel.throttle += (step + (input / inputScale));
//     } else if (input < -joystickDeadzone) {
//         state.vessel.throttle -= (step - (input / inputScale));
//     }

//     if (state.vessel.throttle > 1) {
//         state.vessel.throttle = 1;
//     } else if (state.vessel.throttle < 0) {
//         state.vessel.throttle = 0;
//     }
//     return state.vessel.throttle;
// }

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
        client.services.spaceCenter.vesselGetSurfaceReferenceFrame(state.vessel.id),
        client.services.spaceCenter.vesselGetSurfaceVelocityReferenceFrame(state.vessel.id)
    ];

    client.send(calls, function (err, response) {
        if (err) {
            return callback(err);
        }
        state.vessel.controlId = getFirstResult(response);
        state.vessel.surfaceReference = getResultN(response, 1);
        state.vessel.surfaceVelocityReference = getResultN(response, 2);
        return callback();
    });
}

const getMoreVesselInfo = (callback) => {
    let calls = [
        client.services.spaceCenter.controlGetThrottle(state.vessel.controlId),
        client.services.spaceCenter.vesselFlight(state.vessel.id, state.vessel.surfaceReference),
        client.services.spaceCenter.vesselFlight(state.vessel.id, state.vessel.surfaceVelocityReference)
    ];

    client.send(calls, (err, response) => {
        if (err) {
            return callback(err);
        }
        state.vessel.throttle = getFirstResult(response);
        state.vessel.surfaceFlightId = getResultN(response, 1);
        state.vessel.surfaceVelocityFlightId = getResultN(response, 2);
        return callback();
    });
};

const addSpeedToStream = (callback) => {
    const call = client.services.spaceCenter.flightGetSpeed(state.vessel.surfaceVelocityFlightId);
    client.addStream(call, 'speed', callback);
}