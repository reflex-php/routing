/**
 * Combine keys and values to form one array
 * @param  {object} keys   Array of keys
 * @param  {object} values Array of values
 * @return {object}        
 */
export function array_combine(keys, values) {
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

/**
 * Checkes to see if value is empty
 * @param  {mixed} uri URI to check
 * @return {boolean}
 */
export function empty(value) {
    return ! value;
}

/**
 * Key exists in array
 * @param  {string} key   Key to lookup
 * @param  {array}  array Object to look in
 * @return {boolean}       
 */
export function exists(key, array) {
    return is_type(array, 'object') && key in array;
}

/**
 * Extend an object passed in
 * @param  {object} to   Object to extend
 * @param  {object} from Extend from this
 * @return {object}      
 */
export function extend(to, from) {
    for (let key in from) {
        to[key] = from[key];
    }
    return to;
}

/**
 * Assert something is something
 * @param  {mixed}   thing      Thing to check
 * @param  {string}  assertThis Type to check against
 * @return {Boolean}            
 */
export function is_type(thing, assertThis) {
    let typeString = Object.prototype.toString.call(thing);

    return typeString.toLowerCase() === '[object ' + assertThis.toLowerCase() + ']';
}

/**
 * Trim left of given string
 * @param  {string} string   String to trim
 * @param  {string} charlist Optional character list
 * @return {string}          
 */
export function ltrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('^[' + charlist + ']+'), '');
};

/**
 * Trim right of given string
 * @param  {string} string   String to trim
 * @param  {string} charlist Optional character list
 * @return {string}          
 */
export function rtrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('[' + charlist + ']+$'), '');
};