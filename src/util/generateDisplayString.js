const pad = require('./rightPad');

module.exports = (value, decimalRounding, label, units) => {
	const roundingMultiplier = decimalRounding === 0 ? 1 : Math.pow(10, decimalRounding);
	const outputString = `${label}: ${Math.round(value * roundingMultiplier) / roundingMultiplier} ${units}`;
	return pad(outputString, 16, ' ');
};
