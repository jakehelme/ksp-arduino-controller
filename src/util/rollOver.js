module.exports = function rollOver(value, min, max) {
	if(value > max) {
		return value - max;
	} else if(value < min) {
		return max + value;
	}
	return value;
};
