const functionMap = require('./functions');
const { LogicNodeTypes, LinkTpyes } = require('./constants');

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
    }
    
    linkOut(selfName, port) {
        this.out.push({ ...port, selfName });
    }
    
    linkIn(selfName, port) {
        if (this.in.find(o => (o.name == port.name))) {
            this.logicParser.onError(`Ducupited inputs into ${name} on node #${this.id}`);
        }
        this.in.push({ ...port, selfName });
    }

    run() {
        switch (this.type) {
            case LogicNodeTypes.TYPE_INPUT:
                let name = this.name;
                let value = this.logicParser.input[name];
                this.output[name] = value;
                this.goNextNode();
                break;
            case LogicNodeTypes.TYPE_NORMAL:
                this.output = this.func(this.input);
                this.goNextNode();
                break;
            case LogicNodeTypes.TYPE_OUTPUT:
                this.logicParser.onOutput({
                    key: this.name,
                    value: this.input[this.name]
                });
                break;
        }

    }

    goNextNode() {
        let pendingNodes = [];
        this.out.forEach(link => {
            let nextNode = this.logicParser.nodes[link.id];
            nextNode.input[link.name] = this.output[link.selfName];
            if (pendingNodes.indexOf(nextNode) < 0) {
                pendingNodes.push(nextNode);
            }
        });
        pendingNodes.forEach(node => node.run());
    }

}

module.exports = LogicNode;