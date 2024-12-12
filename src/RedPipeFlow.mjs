import RedPipe from 'redpipe';
import {
    Format,
    Nested,
    uniqid
} from './utils/index.mjs';

class RedPipeFlow {
    static MAIN_FLOW = 'main';

    constructor() {
        this._flows = new Map();
        this._actions = {
            route: this.__actionRoute,
            console: this.__actionConsole,
            switch: this.__actionSwitch
        };
    }

    execute(callback, args={}, flowName=RedPipeFlow.MAIN_FLOW) {
        const flow = this._flows.get(flowName);
        if(!flow) return false;
        /* Create a job */
        const job = uniqid();
        flow.send({
            topic: `${flowName}-${job}`,
            payload: args?.payload || job,
            callback,
            args,
            job
        });
        return true;
    }

    __actionRoute(options, msg) {
        options = RedPipeFlow.ctrlParams(options, {
            condition: { type: 'string', optional: true },
            target: { type: 'string' }
        });
        /* Routing */
        const condition = options.condition ? new Function('msg', options.condition) : null;
        if (!condition || (condition && condition(msg))) {
            const flow = this._flows.get(options.target);
            if(!flow) {
                console.warn(`RedPipeFlow.warn: route "${options.target}" not found.`);
                return;
            }
            flow.send(msg);
            return;
        }
        return msg;
    }

    __actionConsole(options, msg) {
        for(let logType of ['log', 'warn', 'error']) {
            if(!options?.[logType]) continue;
            if(typeof options[logType]?.function === 'string') {
                const fct = new Function('msg', options.log.function);
                console[logType](fct(msg));
                continue;
            }
            console[logType](options[logType]);
        }
        return msg;
    }

    __actionSwitch(options, msg) {
        options = RedPipeFlow.ctrlParams(options, {
            source: { type: 'string', default: 'msg.payload' },
            target: { type: 'string', optional: true }
        });
        RedPipeFlow.setNested({ msg }, options.target,
            Format.secureType(
                RedPipeFlow.getNested({ msg }, options.source || options.target, ''),
                'string'
            )
        );
        return msg;
    }

    loadActions(actions) {
        for(let action of Object.keys(actions)) {
            if(typeof actions[action] !== 'function') continue;
            if(actions[action].length < 2) continue;
            this._actions[action] = actions[action];
        }
        return this;
    }

    loadFlows(flows) {
        for(let [name, instructs] of Object.entries(flows)) {
            if(!name) continue;
            const flow = new RedPipe();

            /* Add the instructions */
            let check = true;
            for(let { action, ...options } of instructs) {
                if(!action) continue;
                if(!this._actions[action]) {
                    console.warn(
                        `RedPipeFlow.warn: ${name} -> action ${action} is not found.`
                    );
                    check = false;
                    continue;
                }
                flow.pipe(this._actions[action].bind(this, options));
            }

            /* Add the flow */
            if(!check) {
                console.warn(
                    `RedPipeFlow.warn: ${name} is not fully supported.\n`
                );
                continue;
            }
            this._flows.set(name, flow);

            /* Attach the events */
            flow.on(RedPipe.EVENT_DATA, msg => {
                if (typeof msg.callback === 'function') return msg.callback(msg);
                console.warn(`RedPipeFlow.warn: ${name} no has callback.\n`);
            });
            flow.on(RedPipe.EVENT_ERROR, ({ payload }) => {
                console.error(payload);
            });
        }
        return this;
    }

    static ctrlParams(params = {}, ctrl = {}) {
        return Format.ctrlParams(params, ctrl);
    }

    static getNested(obj, path, defaultValue=null, sep='.') {
        return Nested.get(obj, path, defaultValue, sep);
    }

    static setNested(obj, path, value, autoCreate=true, sep='.') {
        return Nested.set(obj, path, value, autoCreate, sep);
    }

    static bindVars(str, obj) {
        return str.replace(/\{([^}]+)\}/g, (match, vpath) => {
            return Nested.set(obj, vpath, match);
        });
    }
}

export default RedPipeFlow;