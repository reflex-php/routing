export const defaultConfig = {
    /**
     * Default route URI
     * @type {String}
     */
    defaultURI: 'home',

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