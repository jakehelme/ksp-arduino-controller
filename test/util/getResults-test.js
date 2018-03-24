const { getResultN, getFirstResult } = require('./../../src/util/getResults');
const assert = require('assert');

describe('getResults', function() {
	describe('getResultN', function() {
		it('should throw an error when the response has an error', function() {
			assert.throws(function() {
				getResultN({ error: new Error('test error') });
			}, /test error/);
		});
		it('should throw an error when the response has an error string', function() {
			assert.throws(function() {
				getResultN({ error: 'test error' });
			}, /test error/);
		});
		it('should get the nth result', function() {
			const actual = getResultN({ results: [{ value: 5 }, { value: 10 }] }, 1);
			assert.equal(actual, 10);
		});
		it('should throw an error when the response has a result with an error', function() {
			assert.throws(function() {
				getResultN({ results: [{ error: new Error('test error') }] }, 0);
			}, /test error/);
		});
		it('should throw an error when the response has a result with an error string', function() {
			assert.throws(function() {
				getResultN({ results: [{ error: 'test error' }] }, 0);
			}, /test error/);
		});
	});
	describe('getFirstResult', function() {
		it('should get the first result', function() {
			const actual = getFirstResult({ results: [{ value: 5 }, { value: 10 }] });
			assert.equal(actual, 5);
		});
	});
});
