let logicFunctions = {

    "and": inputs => {
        let input = inputs.in || [];
        return { out: !input.some(i => !i) };
    },

    "or": inputs => {
        let input = inputs.in || [];
        return { out: input.some(i => !!i) };
    },

    "not": inputs => ({ out: !inputs.in }),

    "eq": inputs => {
        let input = inputs.in || [];
        let { strict } = inputs;
        let eqFunc = strict ? (a, b) => a === b : (a, b) => a == b;
        return {
            out: (() => {
                for (let i = 1; i < input.length; i++) {
                    if (!eqFunc(input[i - 1], input[i])) {
                        return false;
                    }
                }
                return true;
            })()
        }
    },

    "cmp": inputs => {
        let input = inputs.in || [];
        let { opt } = inputs;
        let optFunc = {
            gt: (a, b) => a > b,
            gte: (a, b) => a >= b,
            lt: (a, b) => a < b,
            lte: (a, b) => a <= b,
        }[opt] || (() => false);
        return { out: (() => {
            for (let i = 1; i < input.length; i++) {
                if (!optFunc(input[i - 1], input[i])) {
                    return false;
                }
            }
            return true;
        })()}
    },

}

module.exports = logicFunctions;