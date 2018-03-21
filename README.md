# logical-json

A structurized logic executer in JavaScript.

## Warning

This package is under development, and everyting may change in the future.

Please do NOT use this package in production environment unless you understand what it is doing.

## About this Package

This is a JavaScript logic executer for a set of rules described by JSON, witch may have several named inputs and outputs. This may help when you need to structurize or serialize some logical rules, or even to store them in a database.

## Tutorial

### Basic Usage

```
const LogicalJson = require ('logical-json');

let parser = new LogicalJson({
  /* Here goes your JSON structure, supportting JSON string */
});

let output = parser.run({
  /* Here is your input in key-value pairs */
});
```

### Mutate Inputs

If some of your inputs have changed, you can use `parser.mutate()` and pass these changed inputs, instead of run the entire logic. `mutate` will detect which rules are "dirty" and should be excuted. This results in higher perfomance.

Note that `mutate` only returns outputs infected by the mutation. If none of the outputs was infected, it returns an empty object.

### Async Mode

You can pass a configuration object as the second parameter into the constructor, in which you can run this in async mode:

```
let parser = new LogicalJson({ /* JSON here */ }, { async: true });
```

`parser.run()` and `parser.mutate()` will return a promise in async mode. Some of rules containing async operations can only be run in this mode.

## About the JSON Structure

A set of logical rules is descripted by inputs, outputs, logical nodes and links between them. An input or an output has an unique name, which is corresponded to the keys of input or output objects in the parser. A logical node represents a function, or a logical operation in the rule. IOs and nodes have unique IDs, which can be linked together.

Unfortunately, the structure is optimized for storage and is not for humans. Thus I don't recommend to write complex logical rules by yourself. A visualized design tool is on the way.

If you want to learn more or try write one by your own, see test cases in `/tests/LogicParser.test.js`.

Contributions are always welcome :)
