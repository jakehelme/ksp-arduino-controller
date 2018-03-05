const moment = require('moment');
const generateDisplayString = require('./../util/generateDisplayString');
const { printToLcd } = require('./../hardware/board');

let nextLogTimer;
const logInterval = {
	period: 'milliseconds',
	value: 200
};

const processStreamUpdate = (streamState) => {
	if (moment.utc().isAfter(nextLogTimer)) {
		printToLcd(generateDisplayString(streamState.speed, 1, 'Spd', 'm/s'));
		incrementNextLogTimer();
	}
};

const incrementNextLogTimer = () => {
	nextLogTimer = moment.utc().add(logInterval.value, logInterval.period);
};

module.exports = {
	processStreamUpdate,
	incrementNextLogTimer
};
