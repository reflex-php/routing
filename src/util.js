/**
 * Checkes to see if value is empty
 * @param  {mixed} uri URI to check
 * @return {boolean}
 */
export function empty(value) {
    if (typeof value == 'object') {
        for (let currentValue in value) {
            if (!! value[currentValue]) {
                return false;
            }
        }

        return true;
    }

    return ! value;
}

/**
 * Key exists in array
 * @param  {string} key   Key to lookup
 * @param  {array}  array Object to look in
 * @return {boolean}       
 */
export function exists(key, array) {
    return is_object(array) && key in array;
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
 * Assert something is an array
 * @param  {mixed}   thing      Thing to check
 * @return {Boolean}            
 */
export function is_array(thing) {
    return is_type(thing, 'array');
}

/**
 * Assert something is an object
 * @param  {mixed}   thing      Thing to check
 * @return {Boolean}            
 */
export function is_object(thing) {
    return is_type(thing, 'object');
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