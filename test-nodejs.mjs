import { RedPipeFlow, redPipeCommon,redPipeBash } from './nodejs/index.mjs';

const app = new RedPipeFlow();
app.loadActions(redPipeCommon);
app.loadActions(redPipeBash);
app.loadFlows({
    [RedPipeFlow.MAIN_FLOW]: [
        {
            action: 'bash_execute',
            command: 'ls || dir'
        },
        {
            action: 'json_encode',
            source: 'msg.args.test',
            target: 'msg.args.test'
        },
        {
            action: 'json_decode',
            source: 'msg.args.test',
            target: 'msg.args.test'
        }
    ]
});

app.execute(({ payload, args }) => {
    console.log('payload:', payload, args?.test);
}, {
    test: { pouet: 42 }
});