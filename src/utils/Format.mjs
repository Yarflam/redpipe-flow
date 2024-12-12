import Nested from './Nested.mjs';

class Format {
    static isNumber(obj) {
        return typeof obj === 'number' && !isNaN(obj); }
    static isString(obj) {
        return typeof obj === 'string'; }
    static isBoolean(obj) {
        return typeof obj === 'boolean'; }
    static isObject(obj) {
        return obj !== null && typeof obj === 'object'; }
    static isArray(obj) {
        return Array.isArray(obj); }
    static isFunction(obj) {
        return typeof obj === 'function'; }

    static isset(obj) {
        return typeof obj !== 'undefined';
    }
    static isEmpty(obj) {
        return (
            obj === null ||
            typeof obj === 'undefined' ||
            (typeof obj === 'string' && !obj.length) ||
            (typeof obj === 'object' && !Object.keys(obj).length) ||
            (Array.isArray(obj) && !obj.length)
        );
    }

    static secureType(elem, type='isset') {
        if (type === 'number' || type === 'num') return this.isNumber(elem) ? elem : 0;
        if (type === 'integer' || type === 'int') return this.isNumber(elem) ? Math.floor(elem) : 0;
        if (type === 'string' || type === 'str') return this.isString(elem) ? elem : '';
        if (type === 'boolean' || type === 'bool') return this.isBoolean(elem) ? elem : false;
        if (type === 'object' || type === 'obj') return this.isObject(elem) ? elem : {};
        if (type === 'function' || type === 'fct') return this.isFunction(elem) ? elem : () => {};
        if (type === 'array') return this.isArray(elem) ? elem : [];
        if (type === 'isset') return this.isset(elem) ? elem : null;
        return null;
    }

    static ctrlParams(params = {}, ctrl = {}) {
        params = Format.secureType(params, 'object'), ctrl = Format.secureType(ctrl, 'object');
        return Object.entries(ctrl).reduce((accum, [ key, rule ]) => {
            let value = Nested.get(accum, key);
            if (rule?.default && Format.isEmpty(value)) value = structuredClone([rule.default])[0];
            if (rule?.type && !rule?.optional) value = Format.secureType(value, rule.type);
            if (Format.isNumber(value) && Format.isNumber(rule?.min))
                value = Math.max(rule.min, value);
            if (Format.isNumber(value) && Format.isNumber(rule?.max))
                value = Math.min(value, rule.max);
            Nested.set(accum, key, value);
            return accum;
        }, structuredClone(params));
    }

    /*
     *  JSON
     */
    static jsonEncode(obj, indent = null, loop = void(0)) {
        let cache = [];
        return JSON.stringify(
            obj,
            (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (cache.includes(value)) return loop;
                    cache.push(value);
                }
                return value;
            },
            indent
        );
    }
    static jsonDecode(json, debug=true) {
        try {
            return JSON.parse(json);
        } catch(e) {
            if(debug) console.error(e);
            return {};
        }
    }
    static jsonParse(json) {
        return this.jsonDecode(json);
    }
    static jsonCopy(obj) {
        return this.jsonDecode(this.jsonEncode(obj));
    }
}

export default Format;