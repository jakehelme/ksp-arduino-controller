const generateDisplayString = require('./../../src/util/generateDisplayString');
const assert = require('assert');

describe('generateDisplayString', function() {
	it('should generate LCD display strings correctly', function() {
		const actual = generateDisplayString(1.22222, 2, 'test', 'm/s');
		assert.equal(actual, 'test: 1.22 m/s  ');
	});
});
