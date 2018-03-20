const assert = require('assert');
const LogicParser = require('../');

describe('Math Functions', () => {

    describe('`add` function', () => {
    
        let parser = new LogicParser({
            n: [[0, 'add']],
            i: [[1, 'i']],
            o: [[2, 'o']],
            l: [[1, [0, 'in']], [[0, 'out'], 2]]
        });

        it('Should add numbers altogether', () => {
            assert.deepStrictEqual(parser.run({ i: [1, 2, 3, 4] }), { o: 10 });
        });
    
    });


    describe('`sub` function', () => {
    
        let parser = new LogicParser({
            n: [[0, 'sub']],
            i: [[1, 'a'], [2, 'b']],
            o: [[3, 'o']],
            l: [[1, [0, 'a']], [2, [0, 'b']], [[0, 'out'], 3]]
        });

        it('Should return subtraction of two numbers', () => {
            assert.deepStrictEqual(parser.run({ a: 3, b: 2 }), { o: 1 });
        });

    });


    describe('`mul` function', () => {

        let parser = new LogicParser({
            n: [[0, 'mul']],
            i: [[1, 'i']],
            o: [[2, 'o']],
            l: [[1, [0, 'in']], [[0, 'out'], 2]]
        });

        it('Should multiply numbers altogether', () => {
            assert.deepStrictEqual(parser.run({ i: [1, 2, 3, 4] }), { o: 24 });
        });

    });


    describe('`div` function', () => {
    
        let parser = new LogicParser({
            n: [[0, 'div']],
            i: [[1, 'a'], [2, 'b']],
            o: [[3, 'o']],
            l: [[1, [0, 'a']], [2, [0, 'b']], [[0, 'out'], 3]]
        });

        it('Should return division of two numbers', () => {
            assert.deepStrictEqual(parser.run({ a: 6, b: 2 }), { o: 3 });
        });

        it('Should return Infinity when denominator is 0', () => {
            assert.deepStrictEqual(parser.run({ a: 1, b: 0 }), { o: Infinity });
        });

        it('Should return NaN when numerator and denominator are both 0', () => {
            assert.deepStrictEqual(parser.run({ a: 0, b: 0 }), { o: NaN });
        });

    });

});