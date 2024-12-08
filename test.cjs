const RedPipeFlow = require('./index.cjs');

const app = new RedPipeFlow();
app.loadActions({
    ping: (_, msg) => {
        RedPipeFlow.setNested(
            { msg },
            'msg.payload',
            
            RedPipeFlow.getNested({ msg }, 'msg.payload')
                === 'ping' ? 'pong' : 'ping'
        );
        return msg;
    }
});
app.loadFlows({
    [RedPipeFlow.MAIN_FLOW]: [
        {
            action: 'ping'
        }
    ]
});

app.execute(({ payload }) => {
    console.log('payload:', payload);
}, {
    payload: 'ping'
});