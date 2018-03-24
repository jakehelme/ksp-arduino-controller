const clamp = require('./../../src/util/clamp');
const assert = require('assert');

describe('clamp', function() {
	const tests = [
		{ input: 15, min: 0, max: 10, expected: 10 },
		{ input: -15, min: 0, max: 10, expected: 0 },
		{ input: 15, min: -15, max: 0, expected: 0 },
		{ input: -25, min: -15, max: 10, expected: -15 }
	];
	tests.forEach(function(test) {
		it(`should clamp ${test.input} to ${test.expected} when the [min,max] is [${test.min},${test.max}]`, function() {
			const actual = clamp(test.input, test.min, test.max);
			assert.equal(actual, test.expected);
		});
	});
});
