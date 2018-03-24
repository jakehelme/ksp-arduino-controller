const toDeg = require('./../../src/util/toDeg');	
let assert = require('assert');

describe('toDeg', function() {
	it('should return a number', function() {
		const actual = typeof toDeg(Math.PI);
		assert.equal(actual, 'number');
	});
	const tests = [
		{ input: Math.PI, expected: 180},
		{ input: 2*Math.PI, expected: 360},
		{ input: 3*Math.PI, expected: 540},
		{ input: -1*Math.PI, expected: -180},
		{ input: 0.5*Math.PI, expected: 90}
	];

	tests.forEach(function(test) {
		it(`should return ${test.expected} for ${test.input/Math.PI}π.`, function() {
			const actual = toDeg(test.input);
			assert.equal(actual, test.expected);
		});
	});
});
