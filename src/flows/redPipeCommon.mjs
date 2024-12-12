import RedPipeFlow from '../RedPipeFlow.mjs';
import Format from '../utils/Format.mjs';

function jsonSwitcher(options, msg, encode) {
    options = RedPipeFlow.ctrlParams(options, {
        source: { type: 'string', default: 'msg.payload' },
        target: { type: 'string', default: 'msg.payload' }
    });
    try {
        const json = Format[
            encode ? 'jsonEncode' : 'jsonDecode'
        ](RedPipeFlow.getNested({ msg }, options.source));
        RedPipeFlow.setNested({ msg }, options.target, json, true);
    } catch(e) {
        console.warn(e);
        return msg;
    }
    return msg;
}

const redPipeCommon = {
    set_var: (options, msg) => {
        options = RedPipeFlow.ctrlParams(options, {
            target: { type: 'string', default: 'msg.payload' },
            content: { type: 'string' }
        });
        RedPipeFlow.setNested({ msg }, options.target, options.content, true);
        return msg;
    },
    json_encode: (options, msg) => jsonSwitcher(options, msg, true),
    json_decode: (options, msg) => jsonSwitcher(options, msg, false)
};

export default redPipeCommon;