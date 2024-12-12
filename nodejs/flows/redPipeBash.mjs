import { RedPipeFlow, bashExec } from '../index.mjs';

const redPipeBash = {
    bash_execute: async (options, msg, node) => {
        node.async();
        options = RedPipeFlow.ctrlParams(options, {
            target: { type: 'string', default: 'msg.payload' },
            command: { type: 'string' }
        });
        if(options?.command) {
            const { success, data } = await bashExec(options.command, false, true);
            if(success && data) RedPipeFlow.setNested({ msg }, options.target, data, true);
        }
        node.async(1);
        node.send(msg);
    },
    mongodb_dump: async (options, msg, node) => {
        node.async();
        options = RedPipeFlow.ctrlParams(options, {
            target: { type: 'string', default: '{msg.payload}' },
            auth: { type: 'object', optional: true }
        });
        /* Build Authentication */
        const auth = Object.entries({
            host: '127.0.0.1',
            port: 27017,
            user: '',
            pass: '',
            base: 'local',
            authSource: 'admin',
            ...(options.auth || {})
        }).reduce((accum, [key, value]) => {
            accum[key] = RedPipeFlow.bindVars(value, { msg });
            return accum;
        }, {});
        /* Define a connect chain */
        const connectChain = `mongodb://${auth.user}:${auth.pass}@${
            auth.host}:${auth.port}/${auth.base}?authSource=${auth.authSource}`;
        /* Execute */
        const target = RedPipeFlow.bindVars(options.target, { msg } );
        await bashExec(`mongodump --uri="${connectChain}" --out "${target}"`, false, true);
        node.async(1);
        node.send(msg);
    },
    zip_compress: async (options, msg, node) => {
        node.async();
        options = RedPipeFlow.ctrlParams(options, {
            source: { type: 'string', default: '{msg.payload}' },
            target: { type: 'string', default: '{msg.payload}' }
        });
        const source = RedPipeFlow.bindVars(options.source, { msg } );
        const target = RedPipeFlow.bindVars(options.target, { msg } );
        await bashExec(`zip -ry "${target}" "${source}"`, false, true);
        node.async(1);
        node.send(msg);
    }
};

export default redPipeBash;