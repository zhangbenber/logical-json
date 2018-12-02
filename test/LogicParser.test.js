const assert = require('assert');
const LogicParser = require('../');

describe('LogicParser', () => {

    let touchedFlag = false;

    LogicParser.extend({
        waitAndPlus: ({ input, ms }) => new Promise(resolve => {
            setTimeout(() => {
                resolve({ output: input + 1 })
            }, ms);
        }),
        neverTouch: (input) => {
            touchedFlag = true;
            return ({ out: input.in });
        }
    });

    const syncLogic = {
        /** Input nodes
            [ id, name ] **/
        i: [
            [1, 'bol'],
            [2, 'val']
        ],

        /** Output nodes
            [ id, name, constInputValue? ] **/
        o: [
            [3, 'out'],
            [6, 'const', 20],
        ],

        /** Functional nodes
            [ id, functionName, { constInputPortName: constInputValue }? ] **/
        n: [
            [4, 'and'],
            [5, 'cmp', { 'in.2': 10, opt: 'gt' }],
        ],

        /** Links
            [
                [sourceFunctionalNodeId, sourcOutputPortName] | sourceInputNodeId,
                [destinationFunctionalNodeId, destinationInputPortName] | destinationOutputNodeId
            ] **/
        l: [
            [1, [4, 'in.1']],
            [2, [5, 'in.1']],
            [[5, 'out'], [4, 'in.2']],
            [[4, 'out'], 3],
        ]
    };

    const asyncLogic = {
        i: [[0, 'i']],
        o: [[1, 'o']],
        n: [[2, 'waitAndPlus', { ms: 20 }]],
        l: [[0, [2, 'input']], [[2, 'output'], 1]]
    }

    const awareOfLogic = {
        i: [
            [1, 'a'],
            [2, 'b']
        ],
        o: [
            [6, 'sum'],
            [7, 'diff'],
        ],
        n: [
            [3, 'add'],
            [4, 'sub'],
            [5, 'neverTouch'],
        ],
        l: [
            [1, [3, 'in.1']],
            [2, [3, 'in.2']],
            [1, [4, 'a']],
            [2, [4, 'b']],
            [[3, 'out'], 6],
            [[4, 'out'], [5, 'in']],
            [[5, 'out'], 7],
        ]
    };

    let syncParser = new LogicParser(syncLogic);
    
    it('Should run on specified input', () => {
        let runResult = syncParser.run({
            bol: true,
            val: 100
        });
        assert.deepStrictEqual(runResult, { const: 20, out: true });
    });

    it('Should response on input changes', () => {
        let changedResult = syncParser.mutate({
            bol: false
        });
        assert.deepStrictEqual(changedResult, { out: false });
    });

    it('Should return an empty object when input changes do not impact outputs', () => {
        let changedResult = syncParser.mutate({
            const: 20,
            bol: false,
            val: 80
        });
        assert.deepStrictEqual(changedResult, {});
    });

    let asyncParser1 = new LogicParser(syncLogic, { async: true });

    it('Should resolve immediately for async runs without async nodes', async () => {
        let runResult = await asyncParser1.run({
            bol: true,
            val: 100
        });
        assert.deepStrictEqual(runResult, { const: 20, out: true });
    });

    it('Should resolve immediately for async changes without async nodes', async () => {
        let changedResult = await asyncParser1.mutate({
            bol: false
        });
        assert.deepStrictEqual(changedResult, { out: false });
    });

    let asyncParser2 = new LogicParser(asyncLogic, { async: true });

    it('Should resolve after a moment for async runs with async nodes', async () => {
        let start = new Date().getTime();
        let runResult = await asyncParser2.run({ i: 1 });
        assert.deepStrictEqual(runResult, { o: 2 });
        let duration = new Date().getTime() - start;
        assert.equal(duration >= 20, true);
    });

    it('Should resolve after a moment for async changes with async nodes', async () => {
        let start = new Date().getTime();
        let changedResult = await asyncParser2.mutate({ i: 2 });
        assert.deepStrictEqual(changedResult, { o: 3 });
        let duration = new Date().getTime() - start;
        assert.equal(duration >= 20, true);
    });

    it('Should merge output of an unfinished async run into a new-started one\'s', () => {
        return new Promise((resolve, reject) => {

            let parser = new LogicParser({
                i: [[1, 'a'], [2, 'b']],
                o: [[3, 'o']],
                n: [
                    [4, 'waitAndPlus', { ms: 20 }],
                    [5, 'waitAndPlus', { ms: 20 }],
                    [6, 'cmp', { opt: 'gt', 'in.2': 2 }],
                    [7, 'cmp', { opt: 'gt', 'in.2': 2 }],
                    [8, 'and']
                ],
                l: [
                    [1, [4, 'input']],
                    [2, [5, 'input']],
                    [[4, 'output'], [6, 'in.1']],
                    [[5, 'output'], [7, 'in.1']],
                    [[6, 'out'], [8, 'in.1']],
                    [[7, 'out'], [8, 'in.2']],
                    [[8, 'out'], 3],
                ]
            }, { async: true });
            parser.run({ a: 1, b: 2 }).then(output => {
                reject(new Error('The unfinished async runs should not resolve'));
            });
            setTimeout(() => {
                parser.run({ a: 2, b: 2 }).then(output => {
                    // TODO: Handle async mutate
                    try {
                        assert.deepStrictEqual(output, { o: true });
                        resolve();
                    } catch(e) {
                        reject(e);
                    }
                });
            }, 10);
        });
    });

    let awareOfParser = new LogicParser(awareOfLogic, { awareOf: ['sum'] });

    it('Should not calculate outputs which is not aware of', async () => {
        let runResult = awareOfParser.run({
            a: 2,
            b: 1
        });
        assert.deepStrictEqual(runResult, { sum: 3 });
        assert.strictEqual(touchedFlag, false);
    });

    it('Should not calculate outputs which is not aware of when mutating', async () => {
        let changedResult = awareOfParser.mutate({
            b: 2
        });
        assert.deepStrictEqual(changedResult, { sum: 4 });
        assert.strictEqual(touchedFlag, false);
    });

});
