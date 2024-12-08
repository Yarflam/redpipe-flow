class Nested {
    static __worker(
        obj,
        path,
        autoCreate=false,
        sep='.',
        jobValue
    ) {
        /* Get the full path */
        if(typeof path === 'string')
            path = path.replace(/\\\./g, '\n').split(sep);
        /* Check the object */
        if(!(
            typeof jobValue === 'function' &&
            Array.isArray(path) &&
            typeof obj === 'object' &&
            obj !== null
        )) return obj;
        /* Update the deep object */
        let cursors = [[obj, path]];
        for(let j=0; j < cursors.length; j++) {
            let [ cursor, lpath ] = cursors[j];
            for(let i=0, imax=lpath.length; i < imax; i++) {
                if(!lpath[i]) break;
                lpath[i] = lpath[i].replace(/[\t\r\n]/g, '.');
                /* Set the value */
                if(i+1 === imax) {
                    jobValue({ cursor, lpath, i });
                    continue;
                }
                /* Wildcard */
                if(lpath[i] === '*') {
                    for(let k=0, kmax=cursor.length; k < kmax; k++) {
                        /* Array */
                        if(
                            !Array.isArray(cursor[k]) && (
                                /^[0-9]+$/.test(lpath[i+1]) || (
                                    i+2 < imax && /^\*$/.test(lpath[i+1])
                                )
                            )
                        ) {
                            if(!autoCreate) continue;
                            cursor[k] = [];
                        }
                        /* Object */
                        if(!/^[0-9]+$/.test(lpath[i+1]) && !(
                            typeof cursor[k] === 'object' &&
                            !Array.isArray(cursor[k]) &&
                            cursor[k] !== null
                        )) {
                            if(!autoCreate) continue;
                            cursor[k] = {};
                        }
                        /* Add the cursor */
                        cursors.push([
                            cursor[k],
                            lpath.slice(i+1)
                        ]);
                    }
                    break;
                }
                /* Array */
                if(
                    /^[0-9]+$/.test(lpath[i+1]) || (
                        i+2 < imax && /^\*$/.test(lpath[i+1]) &&
                        Array.isArray(cursor[lpath[i]])
                    )
                ) {
                    if(!Array.isArray(cursor[lpath[i]])) {
                        if(!autoCreate) break;
                        cursor[lpath[i]] = [];
                    }
                    cursor = cursor[lpath[i]];
                    continue;
                }
                /* Object */
                if(!/^[0-9]+$/.test(lpath[i+1]) && !(
                    typeof cursor[lpath[i]] === 'object' &&
                    cursor[lpath[i]] !== null
                )) {
                    if(!autoCreate) break;
                    cursor[lpath[i]] = {};
                }
                cursor = cursor[lpath[i]];
            }
        }
        return obj;
    }

    static get(obj, path, defaultValue=null, sep='.') {
        /* Check the object */
        if(!(
            typeof path === 'string' &&
            typeof obj === 'object' &&
            obj !== null
        )) return defaultValue;
        /* Loop on the object */
        let out = [];
        this.__worker(obj, path, false, sep,
            ({ cursor, lpath, i }) => {
                if(lpath[i] === '*') {
                    out.push(...cursor);
                    return;
                }
                if(typeof cursor[lpath[i]] !== 'undefined')
                    out.push(cursor[lpath[i]]);
            }
        );
        /* Return the value(s) */
        const hasWildcard = /(^|\.)\*(\.|$)/.test(path);
        return !hasWildcard
            ? ( out.length ? out[0] : defaultValue )
            : out;
    }
    
    static set(obj, path, value, autoCreate=true, sep='.') {
        return this.__worker(obj, path, autoCreate, sep,
            ({ cursor, lpath, i }) => {
                /* All attributes */
                if(lpath[i] === '*') {
                    for(let key of Object.keys(cursor)) {
                        if(typeof value === 'function') {
                            const delta = value(cursor[key]);
                            if(!(
                                typeof cursor[key] === 'undefined' &&
                                typeof delta === 'undefined'
                            )) {
                                cursor[key] = delta;
                            }
                            continue;
                        }
                        cursor[key] = typeof value === 'object' &&
                            value !== null ? structuredClone(value) : value;
                    }
                    return;
                }
                /* One attribute */
                if(typeof value === 'function') {
                    const delta = value(cursor[lpath[i]]);
                    if(!(
                        typeof cursor[lpath[i]] === 'undefined' &&
                        typeof delta === 'undefined'
                    )) {
                        cursor[lpath[i]] = delta;
                    }
                    return;
                }
                cursor[lpath[i]] = typeof value === 'object' &&
                    value !== null ? structuredClone(value) : value;
                return;
            }
        );
    }

    static flat (obj) {
        let out = {};
        if(!(typeof obj === 'object' && obj !== null)) return out;
        let cursors = [[obj, '']];
        for(let j=0; j < cursors.length; j++) {
            let [ cursor, lpath ] = cursors[j];
            if(Array.isArray(cursor)) {
                cursor.forEach((child, i) =>
                    cursors.push([ child, `${lpath}${lpath?'.':''}${i}` ]));
                continue;
            }
            if(typeof cursor === 'object') {
                Object.entries(cursor).forEach(
                    ([ key, child ]) =>
                        cursors.push([ child, `${lpath}${lpath?'.':''}${key}` ])
                );
                continue;
            }
            out[lpath] = cursor;
        }
        return out;
    }
}

module.exports = Nested;