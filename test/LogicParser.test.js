const assert = require('assert');
const LogicParser = require('../');

describe('LogicParser', () => {

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
        assert.deepEqual(runResult, { const: 20, out: true });
    });

    it('Should response on input changes', () => {
        let changedResult = parser.change({
            bol: false
        });
        assert.deepEqual(changedResult, { out: false });
    });

    it('Should return an empty object when input changes do not impact outputs', () => {
        let changedResult = parser.change({
            const: 20,
            bol: false,
            val: 80
        });
        assert.deepEqual(changedResult, {});
    });

    it('Should resolve immediately for async runs without async nodes', async () => {
        let runResult = await parser.run({
            bol: true,
            val: 100
        }, true);
        assert.deepEqual(runResult, { const: 20, out: true });
    });

    it('Should resolve immediately for async changes without async nodes', async () => {
        let changedResult = await parser.change({
            bol: false
        }, true);
        assert.deepEqual(changedResult, { out: false });
    });

})
