const assert = require('assert');
const LogicParser = require('../');

describe('LogicParser', () => {

    LogicParser.extend({
        waitAndPlus: ({ input, ms }) => new Promise(resolve => {
            setTimeout(() => {
                resolve({ output: input + 1 })
            }, ms);
        })
    });

    let parser = new LogicParser({
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
    });
    
    it('Should run on specified input', () => {
        let runResult = parser.run({
            bol: true,
            val: 100
        });
        assert.deepStrictEqual(runResult, { const: 20, out: true });
    });

    it('Should response on input changes', () => {
        let changedResult = parser.change({
            bol: false
        });
        assert.deepStrictEqual(changedResult, { out: false });
    });

    it('Should return an empty object when input changes do not impact outputs', () => {
        let changedResult = parser.change({
            const: 20,
            bol: false,
            val: 80
        });
        assert.deepStrictEqual(changedResult, {});
    });

    it('Should resolve immediately for async runs without async nodes', async () => {
        let runResult = await parser.run({
            bol: true,
            val: 100
        }, true);
        assert.deepStrictEqual(runResult, { const: 20, out: true });
    });

    it('Should resolve immediately for async changes without async nodes', async () => {
        let changedResult = await parser.change({
            bol: false
        }, true);
        assert.deepStrictEqual(changedResult, { out: false });
    });

    let asyncParser = new LogicParser({
        i: [[0, 'i']],
        o: [[1, 'o']],
        n: [[2, 'waitAndPlus', { ms: 20 }]],
        l: [[0, [2, 'input']], [[2, 'output'], 1]]
    });

    it('Should resolve after a moment for async runs with async nodes', async () => {
        let start = new Date().getTime();
        let runResult = await asyncParser.run({ i: 1 }, true);
        assert.deepStrictEqual(runResult, { o: 2 });
        let duration = new Date().getTime() - start;
        assert.equal(duration >= 20, true);
    });

    it('Should resolve after a moment for async changes with async nodes', async () => {
        let start = new Date().getTime();
        let changedResult = await asyncParser.change({ i: 2 }, true);
        assert.deepStrictEqual(changedResult, { o: 3 });
        let duration = new Date().getTime() - start;
        assert.equal(duration >= 20, true);
    });

})
