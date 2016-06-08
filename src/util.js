export function extend (to, from) {
    for (let key in from) {
        to[key] = from[key];
    }
    return to;
}

export function exists (key, array) {
    return is_type(array, 'object') && key in array;
}

export function is_type (thing, assertThis) {
    let typeString = Object.prototype.toString.call(thing);

    return typeString.toLowerCase() === '[object ' + assertThis.toLowerCase() + ']';
}

export function array_combine (keys, values) {
    let new_array = {};
    let keycount = keys && keys.length;
    let i = 0;

    // input sanitation
    if (typeof keys !== 'object' || typeof values !== 'object' || // Only accept arrays or array-like objects
    typeof keycount !== 'number' || typeof values.length !== 'number' || !keycount) {
        // Require arrays to have a count
        return false;
    }

    // number of elements does not match
    if (keycount != values.length) {
        return false;
    }

    for (i = 0; i < keycount; i++) {
        new_array[keys[i]] = values[i];
    }

    return new_array;
}

export function ltrim (string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('^[' + charlist + ']+'), '');
};

export function rtrim (string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('[' + charlist + ']+$'), '');
};