module.exports = function (value, min, max) {
	if(value > max) {
		return value - max;
	} else if(value < min) {
		return value < 0 ? max + value : max - value;
	}
	return value;
};
