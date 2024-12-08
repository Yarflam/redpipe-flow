# RedPipeFlow

![license](https://img.shields.io/badge/license-CC0--v1.0-green.svg)

## Install

### NPM

```bash
npm i redpipe-flow
```

Dependency: `redpipe` (workflow)

### Github Project

```bash
git clone https://github.com/Yarflam/redpipe-flow.git
```

Run `test.cjs`:

```bash
npm test
```

You should have something like that:

```text
// TODO
```

The errors are trigger by the JS script.

## Usages

Import the library:

```javascript
const RedPipeFlow = require('redpipe-flow');
```

Create a new workflow:

```javascript
const app = new RedPipeFlow();
```

Load the actions:

```javascript
app.loadActions({
    /* Action: ping */
    ping: (_, msg) => {
        /* Set 'pong' into msg.payload */
        RedPipeFlow.setNested({ msg }, 'msg.payload', 'pong');
        return msg;
    }
});
```

> The actions are the node types can be used in your final pipeline. You can get more informations about it in **Node Structure** section below.

Load your flows:

```javascript
app.loadFlows({
    [RedPipeFlow.MAIN_FLOW]: [ // main flow, call in first time
        {
            action: 'ping'
        }
    ]
});
```

### Execute the pipeline

Basic execution:

```javascript
app.execute(({ payload }) => {
    console.log('payload:', payload);
}, {
    payload: 'ping'
});
```

## Node Structure



## Message Object

Structure:
- topic: *string*
- payload: *string | number | array | object | boolean*
- ... support any other attributes ...

Inspired by the Node-RED model. [See more](https://nodered.org/)

## Authors

-   Yarflam - _initial work_

## License

The project is licensed under Creative Commons Zero (CC0).