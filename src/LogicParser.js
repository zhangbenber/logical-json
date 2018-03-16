const LogicNode = require('./LogicNode');
const { LogicNodeTypes } = require('./constants');

class LogicParser {

    constructor(object) {
        this.invalid = false;
        this.input = {};
        this.output = {};
        this.changedOutput = {};
        this.nodes = {};
        this.inputNodes = [];
        this.outputNodes = [];
        this.dependenceSeq = [];
        this.initial = true;

        if (typeof object === 'string') {
            try {
                object = JSON.parse(object);
            } catch (e) {
                this.onError('Unknown data format');
            }
        }

        this.addNodes(object.n || []);
        this.addNodes(object.i || [], LogicNodeTypes.TYPE_INPUT);
        this.addNodes(object.o || [], LogicNodeTypes.TYPE_OUTPUT);

        (object.l || []).forEach(link => {
            let [source, target] = link.map(this.processPort.bind(this));
            this.nodes[source.id].linkOut(source.name, target);
            this.nodes[target.id].linkIn(target.name, source);
        });

        (object.c || []).forEach(constant => {
            this.setConst(constant);
        });

        this.outputNodes.forEach(output => {
            this.collectDependence(output);
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
                } else if (type == LogicNodeTypes.TYPE_OUTPUT) {
                    this.outputNodes.push(newNode);
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
        let constPort = this.processPort(port);
        let node = this.nodes[constPort.id];
        node.input[constPort.name] = value;
    }

    collectDependence(node) {
        let oldIndex = this.dependenceSeq.indexOf(node);
        if (oldIndex > -1) {
            this.dependenceSeq.splice(oldIndex, 1);
        }
        this.dependenceSeq.unshift(node);
        node.in.forEach(link => {
            let dependentNode = this.nodes[link.id];
            this.collectDependence(dependentNode);
        });
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


        if (initial) {

            this.input = input;
            this.dependenceSeq.forEach(node => {
                node.run();
            });

        } else {

            this.changedOutput = {};

            let changedKeys = [];
            for (const key in input) {
                if (input.hasOwnProperty(key)) {
                    this.input[key] = input[key];
                    changedKeys.push(key);
                }
            }

            let pendingNodes = [];
            let getPendingNodes = rootNode => {
                pendingNodes.push(rootNode);
                rootNode.out.forEach(link => {
                    let nextNode = this.nodes[link.id];
                    getPendingNodes(nextNode);
                });
            }
            this.inputNodes.forEach(input => {
                if (changedKeys.indexOf(input.name) > -1) {
                    input.dirty = true;
                    getPendingNodes(input);
                }
            });

            this.dependenceSeq.forEach(node => {
                if (pendingNodes.indexOf(node) > -1 && node.dirty) {
                    node.run();
                }
            });

        }

        return this.changedOutput;
    }

    onError(msg) {
        this.invalid = true;
        console.error(msg);
    }

    onOutput({ key, value }) {
        this.output[key] = value;
        this.changedOutput[key] = value;
    }

}

module.exports = LogicParser;