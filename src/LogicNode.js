const equal = require('fast-deep-equal');

const functionMap = require('./functions');
const { LogicNodeTypes } = require('./constants');

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
        this.out.push({ ...port, selfName });
    }

    linkIn(selfName, port) {
        if (this.in.find(o => (o.selfName == selfName))) {
            this.logicParser.onError(`Ducupited inputs into ${selfName} on node #${this.id}`);
        }
        this.in.push({ ...port, selfName });
    }

    run() {
        switch (this.type) {
            case LogicNodeTypes.TYPE_INPUT:
                let name = this.name;
                let value = this.logicParser.input[name];
                if (!equal(this.output[name], value)) {
                    this.output[name] = value;
                    this.passToNextNodes();
                }
                break;
            case LogicNodeTypes.TYPE_NORMAL:
                let output = this.func(this.input);
                if (!equal(this.output, output)) {
                    this.output = output;
                    this.passToNextNodes();
                }
                break;
            case LogicNodeTypes.TYPE_OUTPUT:
                this.logicParser.onOutput({
                    key: this.name,
                    value: this.input[this.name]
                });
                break;
        }

        this.dirty = false;

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

module.exports = LogicNode;