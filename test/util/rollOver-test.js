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
	// it('should still work when the min is not zero', () => {
	// 	const actual = rollOver(5, 10, 360);
	// 	assert.equal(actual, 355);
	// });
	// it('should still work when the min is negative', () => {
	// 	const actual = rollOver(-15, -10, 360);
	// 	assert.equal(actual, 355);
	// });
});

