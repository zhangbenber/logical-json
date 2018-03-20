const equal = require('fast-deep-equal');

const functionMap = require('./functions');
const { LogicNodeTypes } = require('./constants');

const transformInputs = function (params) {
    let groupedKeys = {};
    Object.keys(params).forEach(key => {
        let matches = /^(.+)\.(\d)$/.exec(key);
        if (matches) {
            let groupedArray = groupedKeys[matches[1]] || (groupedKeys[matches[1]] = []);
            groupedArray[matches[2] - 1] = params[key];
        }
    });
    return Object.assign(groupedKeys, params);
}

const transformOutputs = function (params) {
    let groupedKeys = {};
    Object.keys(params).forEach(key => {
        let matches = /^(.+)\.n$/.exec(key);
        if (matches) {
            params[key].forEach((value, index) => {
                groupedKeys[`${key}.${index + 1}`] = value;
            });
        }
    });
    return Object.assign(groupedKeys, params);
}

class LogicNode {

    constructor(logicParser, id, type, name) {
        this.logicParser = logicParser;
        this.type = type;
        switch (type) {
            case LogicNodeTypes.TYPE_NORMAL:
                let func = functionMap[name];
                if (!func) {
                    logicParser.onError(`Unknown function name: ${name}`);
                }
                this.func = func;
                break;
            case LogicNodeTypes.TYPE_INPUT:
            case LogicNodeTypes.TYPE_OUTPUT:
                this.name = name;
                break;
        }
        this.id = id;
        this.input = {};
        this.output = {};
        this.in = [];
        this.out = [];
        this.dependence = [];
        this.dirty = true;
    }

    linkOut(selfName, port) {
        this.out.push(Object.assign({ selfName }, port));
    }

    linkIn(selfName, port) {
        if (this.in.find(o => (o.selfName == selfName))) {
            this.logicParser.onError(`Ducupited inputs into ${selfName} on node #${this.id}`);
        }
        this.in.push(Object.assign({ selfName }, port));
    }

    run(async) {

        let asyncCount = this.logicParser.asyncCount;

        function doOutput(output, callback) {
            if (!async || this.logicParser.asyncCount === asyncCount) {
            output = transformOutputs(output);
                if (!equal(this.output, output)) {
                    this.output = output;
                    this.passToNextNodes();
                }
                this.dirty = false;                
                callback && callback();
            }
        }

        let returnValue = async && Promise.resolve();

        switch (this.type) {
            case LogicNodeTypes.TYPE_INPUT:
                let name = this.name;
                let value = this.logicParser.input[name];
                doOutput.call(this, { [name]: value });
                break;
            case LogicNodeTypes.TYPE_NORMAL:
                let output = this.func(transformInputs(this.input));
                if (output.then) {
                    // Returns a promise-like object
                    if (!async) {
                        console.warn('Async nodes must run in async mode');
                        returnValue = {};
                    } else {
                        returnValue = new Promise(resolve => {
                            output.then(data => {
                                doOutput.call(this, data, resolve);
                            });
                        });
                    }
                } else {
                    doOutput.call(this, output);
                }
                break;
            case LogicNodeTypes.TYPE_OUTPUT:
                this.logicParser.onOutput({
                    key: this.name,
                    value: this.input[this.name]
                });
                this.dirty = false;                
                break;
        }

        return returnValue;

    }

    passToNextNodes() {
        let pendingNodes = [];
        this.out.forEach(link => {
            let nextNode = this.logicParser.nodes[link.id];
            nextNode.input[link.name] = this.output[link.selfName];
            if (pendingNodes.indexOf(nextNode) < 0) {
                pendingNodes.push(nextNode);
            }
            nextNode.dirty = true;
        });
    }

}

LogicNode.extend = function(extendObject) {
    Object.assign(functionMap, extendObject);
};

module.exports = LogicNode;