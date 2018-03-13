const LogicParser = require('./LogicParser');

let parser = new LogicParser({
    i: [
        [1, 'bol'],
        [2, 'val']
    ],
    o: [
        [3, 'out'],
        [6, 'cTest'],
    ],
    n: [
        [4, 'and'],
        [5, 'greaterThan'],
    ],
    l: [
        [1, [4, 'a']],
        [2, [5, 'target']],
        [[5, 'out'], [4, 'b']],
        [[4, 'out'], 3],
    ],
    c: [
        [10, [5, 'standard']],
        [20, 6],
    ]
});

console.log(parser.run({
    bol: true,
    val: 100
}));