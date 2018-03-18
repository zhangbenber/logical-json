const assert = require('assert');
const LogicParser = require('../');

describe('`and` function', () => {

	let parser = new LogicParser({
		n: [[0, 'and']],
		i: [[1, 'a'], [2, 'b'], [3, 'c']],
		o: [[4, 'o']],
		l: [[1, [0, 'in.1']], [2, [0, 'in.2']], [3, [0, 'in.3']], [[0, 'out'], 4]]
	});

	it('Should return true if inputs are all truthy', () => {
		assert.deepEqual(parser.run({ a: true, b: 1, c: 'test' }), { o: true });
	});

	it('Should return false if any of inputs are falsy', () => {
		assert.deepEqual(parser.run({ a: true, b: false, c: 'test' }), { o: false });
		assert.deepEqual(parser.run({ a: 0, b: 1, c: 2 }), { o: false });
	});

});


describe('`or` function', () => {

	let parser = new LogicParser({
		n: [[0, 'or']],
		i: [[1, 'a'], [2, 'b'], [3, 'c']],
		o: [[4, 'o']],
		l: [[1, [0, 'in.1']], [2, [0, 'in.2']], [3, [0, 'in.3']], [[0, 'out'], 4]]
	});

	it('Should return false if all inputs are all falsy', () => {
		assert.deepEqual(parser.run({ a: 0, b: false, c: '' }), { o: false });
	});

	it('Should return true if any of inputs are truthy', () => {
		assert.deepEqual(parser.run({ a: 0, b: false, c: 'test' }), { o: true });
		assert.deepEqual(parser.run({ a: 1, b: 0, c: '' }), { o: true });
	});

});


describe('`eq` function', () => {

	let parser = new LogicParser({
		n: [[0, 'eq']],
		i: [[1, 'i'], [2, 'strict']],
		o: [[3, 'o']],
		l: [[1, [0, 'in']], [2, [0, 'strict']], [[0, 'out'], 3]]
	});

	it('Should return true if all inputs are logical equal when not strict', () => {
		assert.deepEqual(parser.run({ i: [1, '1', 1], strict: false }), { o: true });
		assert.deepEqual(parser.run({ i: [0, false, '0'], strict: false }), { o: true });
		assert.deepEqual(parser.run({ i: [1, false, '0'], strict: false }), { o: false });
		assert.deepEqual(parser.run({ i: [NaN, NaN, NaN], strict: false }), { o: false });
	});

	it('Should return true if all inputs are strictly equal when strict', () => {
		assert.deepEqual(parser.run({ i: ['0', '0', '0'], strict: true }), { o: true });
		assert.deepEqual(parser.run({ i: [0, false, '0'], strict: true }), { o: false });
	});

});


describe('`cmp` function', () => {

	let parser = new LogicParser({
		n: [[0, 'cmp']],
		i: [[1, 'i'], [2, 'opt']],
		o: [[3, 'o']],
		l: [[1, [0, 'in']], [2, [0, 'opt']], [[0, 'out'], 3]]
	});

	it('Should work for greater than operation', () => {
		assert.deepEqual(parser.run({ i: [3, 2, 1], opt: 'gt' }), { o: true });
		assert.deepEqual(parser.run({ i: [3, 2, 2], opt: 'gt' }), { o: false });
	});

	it('Should work for greater than or euqal operation', () => {
		assert.deepEqual(parser.run({ i: [2, 2, 2], opt: 'gte' }), { o: true });
		assert.deepEqual(parser.run({ i: [3, 2, 3], opt: 'gte' }), { o: false });
	});

	it('Should work for less than operation', () => {
		assert.deepEqual(parser.run({ i: [1, 2, 3], opt: 'lt' }), { o: true });
		assert.deepEqual(parser.run({ i: [2, 2, 3], opt: 'lt' }), { o: false });
	});

	it('Should work for less than operation or euqal operation', () => {
		assert.deepEqual(parser.run({ i: [2, 2, 2], opt: 'lte' }), { o: true });
		assert.deepEqual(parser.run({ i: [3, 2, 3], opt: 'lte' }), { o: false });
	});

	it('Should always return false for unknown operations', () => {
		assert.deepEqual(parser.run({ i: [2, 2, 2], opt: 'test' }), { o: false });
	});

});