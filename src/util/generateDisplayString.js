const pad = require('./rightPad');

module.exports = (value, decimalRounding, label, units) => {
	const roundingMultiplier = Math.pow(10, decimalRounding);
	const outputString = `${label}: ${Math.round(value * roundingMultiplier) / roundingMultiplier} ${units}`;
	return pad(outputString, 16, ' ');
};
