module.exports = function rightPad(input, maxLength, padChar) {
	return (input + Array(maxLength).join(padChar)).substring(0, maxLength);
};
