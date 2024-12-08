class Tools {
    static _uid = 0;
    static uniqid() {
        Tools._uid = Math.max(Tools._uid+1, Date.now());
        return Tools._uid.toString(16);
    }

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

    static format(elem, type='isset') {
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
        params = Tools.format(params, 'object'), ctrl = Tools.format(ctrl, 'object');
        return Object.entries(ctrl).reduce((accum, [ key, rule ]) => {
            let value = Format.getNested(accum, key);
            if (rule?.default && Tools.isEmpty(value)) value = structuredClone([rule.default])[0];
            if (rule?.type && !rule?.optional) value = Tools.format(value, rule.type);
            if (Tools.isNumber(value) && Tools.isNumber(rule?.min))
                value = Math.max(rule.min, value);
            if (Tools.isNumber(value) && Tools.isNumber(rule?.max))
                value = Math.min(value, rule.max);
            Format.setNested(accum, key, value);
            return accum;
        }, structuredClone(params));
    }
}

module.exports = Tools;