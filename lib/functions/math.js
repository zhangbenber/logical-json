let mathFunctions = {

    "add": inputs => {
        let input = inputs.in || [];
        return {
            out: input.reduce((n, v) => (n + v), 0)
        }
    },

    "sub": ({ a, b }) => ({ out: a - b }),

    "mul": inputs => {
        let input = inputs.in || [];
        return {
            out: input.reduce((n, v) => (n * v), 1)
        }
    },

    "div": ({ a, b }) => ({ out: a / b }),
    
}

module.exports = mathFunctions;