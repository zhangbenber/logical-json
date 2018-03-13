let functionMap = {
    "and": o => ({ out: !!o.a && !!o.b }),
    "greaterThan": o => ({ out: o.target > o.standard }),
}

module.exports = functionMap;