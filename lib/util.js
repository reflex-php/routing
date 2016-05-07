exports.extend = function (to, from) {
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
};

exports.exists = function (key, array) {
    return key in array;
};

exports.is_type = function (thing, assertThis) {
    var typeString = Object.prototype.toString.call(thing);

    return typeString.toLowerCase() === '[object ' + assertThis.toLowerCase() + ']';
};

exports.array_combine = function (keys, values) {
    //  discuss at: http://phpjs.org/functions/array_combine/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Brett Zamir (http://brett-zamir.me)
    //   example 1: array_combine([0,1,2], ['kevin','van','zonneveld']);
    //   returns 1: {0: 'kevin', 1: 'van', 2: 'zonneveld'}

    var new_array = {},
        keycount = keys && keys.length,
        i = 0;

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
};

String.prototype.trimmer = function (charlist) {
    return this.ltrim(charlist).rtrim(charlist);
};

String.prototype.ltrim = function (charlist) {
    if (charlist === undefined) {
        charlist = 's';
    }

    return this.replace(new RegExp('^[' + charlist + ']+'), '');
};

String.prototype.rtrim = function (charlist) {
    if (charlist === undefined) {
        charlist = 's';
    }

    return this.replace(new RegExp('[' + charlist + ']+$'), '');
};