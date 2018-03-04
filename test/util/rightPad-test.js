const rightPad = require('./../../src/util/rightPad');
const assert = require('assert');

describe('rightPad', function() {
	it('should pad things correctly', function() {
		const actual = rightPad('hello',7,' ');
		assert.equal(actual, 'hello  ');
	});
});
