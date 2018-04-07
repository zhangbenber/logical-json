const LogicNode = require('./LogicNode');
const { LogicNodeTypes } = require('./constants');

const defaultConfig = {
    async: false
}

class LogicParser {

    constructor(object, config = {}) {
        this.config = Object.assign({}, defaultConfig, config);
        this.invalid = false;
        this.input = {};
        this.output = {};
        this.changedOutput = {};
        this.nodes = {};
        this.inputNodes = [];
        this.outputNodes = [];
        this.dependenceSeq = [];
        this.initial = true;
        this.asyncCount = 0;

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

        this.outputNodes.forEach(output => {
            this.collectDependence(output);
        });

    }

    addNodes(arr, type = LogicNodeTypes.TYPE_NORMAL) {
        if (arr && arr.length) {
            arr.forEach(node => {
                let [id, name, constants] = node;
                let newNode = new LogicNode(this, id, type, name);
                this.nodes[id] = newNode;
                switch (type) {
                    case LogicNodeTypes.TYPE_INPUT:
                        this.inputNodes.push(newNode);
                        break;
                    case LogicNodeTypes.TYPE_OUTPUT:
                        if (constants) {
                            newNode.input[name] = constants;
                        }
                        this.outputNodes.push(newNode);
                        break;
                    default:
                        if (constants) {
                            newNode.input = constants;
                        }
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

    run(input, initial = true) {

        let { async } = this.config;

        if (this.invalid) {
            console.error('Cannot run an invalid logic');
            return;
        }

        if (this.initial) {
            initial = true;
        }

        let affectedNodes = [];
        let pendingNodes = this.dependenceSeq.slice();

        if (initial) {

            this.input = input;

        } else {

            let changedKeys = [];
            for (const key in input) {
                if (input.hasOwnProperty(key)) {
                    this.input[key] = input[key];
                    changedKeys.push(key);
                }
            }

            let getPendingNodes = rootNode => {
                affectedNodes.push(rootNode);
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

        }

        if (async) {

            this.asyncCount++;

            return new Promise((resolve, reject) => {
                (function execute(callback) {
                    let node = pendingNodes.shift();
                    if (node) {
                        if (initial || (affectedNodes.indexOf(node) > -1 && node.dirty)) {
                            node.run(true).then(() => {
                                execute(callback);
                            });
                        } else {
                            execute(callback);
                        }
                    } else {
                        callback();
                    }
                })(() => {
                    this.initial = false;
                    resolve(this.changedOutput);
                    this.changedOutput = {};
                });
            });

        } else {

            this.changedOutput = {};

            (function execute() {
                let node = pendingNodes.shift();
                if (node) {
                    if (initial || (affectedNodes.indexOf(node) > -1 && node.dirty)) {
                        node.run();
                    }
                    execute();
                }
            })();

            this.initial = false;
            return this.changedOutput;

        }

    }

    mutate(changes) {
        return this.run(changes, false);
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

LogicParser.extend = LogicNode.extend;

module.exports = LogicParser;