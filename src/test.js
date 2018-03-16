const LogicParser = require('./LogicParser');

let parser = new LogicParser({
    /** Input nodes
        [ id, name ] **/
    i: [
        [1, 'bol'],
        [2, 'val']
    ],

    /** Output nodes
        [ id, name ] **/
    o: [
        [3, 'out'],
        [6, 'const'],
    ],
    
    /** Functional nodes
        [ id, functionName ] **/
    n: [
        [4, 'and'],
        [5, 'greaterThan'],
    ],
    
    /** Links
        [
            [sourceFunctionalNodeId, sourcOutputPortName] | sourceInputNodeId,
            [destinationFunctionalNodeId, destinationInputPortName] | destinationOutputNodeId
        ] **/
    l: [
        [1, [4, 'a']],
        [2, [5, 'target']],
        [[5, 'out'], [4, 'b']],
        [[4, 'out'], 3],
    ],
    
    /** Constants
        [
            constantValue,
            [destinationFunctionalNodeId, destinationInputPortName] | destinationOutputNodeId
        ] **/
    c: [
        [10, [5, 'standard']],
        [20, 6],
    ]
});

console.log(parser.run({
    bol: true,
    val: 100
}));

console.log(parser.run({
    bol: false
}));

module.exports = LogicParser;