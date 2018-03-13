const LogicNode = require('./LogicNode');
const { LogicNodeTypes, LinkTpyes } = require('./constants');

class LogicParser {
    
    constructor(object) {
        this.invalid = false;
        this.input = {};
        this.output = {};
        this.nodes = {};
        this.inputNodes = [];
        this.constDrivenNodes = [];
        this.initial = true;

        if (typeof object === 'string') {
            try {
                object = JSON.parse(object);
            } catch (e) {
                this.onError('Unknown data format');
            }
        }

        this.addNodes(object.n);
        this.addNodes(object.i, LogicNodeTypes.TYPE_INPUT);
        this.addNodes(object.o, LogicNodeTypes.TYPE_OUTPUT);

        object.l.forEach(link => {
            let [source, target] = link.map(this.processPort.bind(this));
            this.nodes[source.id].linkOut(source.name, target);
            this.nodes[target.id].linkIn(target.name, source);
        });

        object.c.forEach(constant => {
            this.setConst(constant);
        });

    }

    addNodes(arr, type = LogicNodeTypes.TYPE_NORMAL) {
        if (arr && arr.length) {
            arr.forEach(node => {
                let [id, name] = node;
                let newNode = new LogicNode(this, id, type, name);
                this.nodes[id] = newNode;
                if (type == LogicNodeTypes.TYPE_INPUT) {
                    this.inputNodes.push(newNode);
                }
            });
        }
    }

    processPort(port) {
        if (typeof port == 'number') {
            // For IO ones
            return {
                id: port,
                name: this.nodes[port].name
            }
        } else {
            return {
                id: port[0],
                name: port[1],
            };
        }
    }

    setConst(constant) {
        let [value, port] = constant;
        let output = this.processPort(port);
        let node = this.nodes[output.id];
        node.input[output.name] = value;
        if (this.constDrivenNodes.indexOf(node) < 0) {
            this.constDrivenNodes.push(node);
        }
    }

    run(input, initial = false) {
        if (this.invalid) {
            console.error('Cannot run an invalid logic');
            return;
        }

        if (this.initial) {
            initial = true;
            this.initial = false;
        }

        this.output = {};
        if (initial) {
            this.input = input;
            this.constDrivenNodes.forEach(node => node.run());
        }
        this.inputNodes.forEach(node => node.run());
        return this.output;
    }

    onError(msg) {
        this.invalid = true;
        console.error(msg);
    }

    onOutput({ key, value }) {
        this.output[key] = value;
    }

}

module.exports = LogicParser;