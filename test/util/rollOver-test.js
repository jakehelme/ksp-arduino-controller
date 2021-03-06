let rollOver = require('./../../src/util/rollOver');
let assert = require('assert');


describe('rollOver rolls values over between a min and max', function() {
	it('should roll a value over max', function() {
		const actual = rollOver(370, 0, 360);
		assert.equal(actual, 10);
	});
	it('should roll a value under min', function() {
		const actual = rollOver(-10, 0, 360);
		assert.equal(actual, 350);
	});
	it('should do nothing when between the min and max', function() {
		const actual = rollOver(150, 0, 360);
		assert.equal(actual, 150);
	});
});

