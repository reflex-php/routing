export const defaultConfig = {
    /**
     * 'Fallout' function, handles not finding route
     * @param  {integer} code Error code
     * @return {null}      
     */
    fallout: code => {
        throw new Error(`[Router] Fallout code: ${code}`)
    },

    /**
     * Default route key
     * @type {String}
     */
    defaultRouteKey: 'home',

    /**
     * Patterns to loop through for URI matching
     * @type {Object}
     */
    patterns: {
        'escape': [/[\-{}\[\]+?.,\\\^$|#\s]/g, '\\$&'],
        'optional': [/\((.*?)\)/g, '(?:$1)?'],
        'named': [/(\(\?)?:\w+/g, (match, optional) => optional ? match : '([^/?]+)'],
        'greedy': [/\*\w+/g, '([^?]*?)'],
    }
};