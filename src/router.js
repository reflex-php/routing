import { extend, exists, is_type, array_combine, ltrim, rtrim, trimmer } from './util.js';
import { defaultConfig } from './config.js';
import Matcher from './matcher.js';
import Route from './route.js';

export default class Router {
    /**
     * Constructor
     * @param  {Object} mappables Routes to map
     * @param  {Object} config    Configuration
     * @return {Router}           
     */
    constructor (mappables = {}, config = {}) {
        this.routes = {};
        this.config = extend(defaultConfig, config);
        this.wheres = {
            'id': '[0-9]+',
            '*': '.*'
        };
        this.compiled = {};
        this.previousUri;

        if (is_type(mappables, 'object')) {
            this.map(mappables);
        }
    }

    /**
     * Get parameters for a route
     * @param  {string} route Route to split in to params
     * @return {array}       
     */
    getRouteParameters (route) {
        let matcher = new Matcher('(?::)((?:[a-z]{1})(?:[0-9a-z_]*))', 'i');
        let routeParts = route.split('/');

        return matcher.match(routeParts);
    }

    /**
     * Generate with regex
     * @param  {string} where       where to lookup
     * @param  {string} routeWheres 
     * @return {string}             
     */
    with (where, routeWheres) {
        let wheres = extend(this.wheres, routeWheres);
        let whereKey = ltrim(rtrim(where, '?'), ':');
        let regex = exists(whereKey, wheres) ? wheres[whereKey] : '.*';

        if (this.lastCharacterIs(where, '?')) {
            return '(?:/{1}(' + regex + '|)|)';
        }

        return '(' + regex + ')';
    }

    /**
     * Get last character
     * @param  {string} string String to get last character
     * @return {string}        
     */
    getLastCharacter (string) {
        return string ? string[string.length - 1] : '';
    }

    /**
     * Is last character something
     * @param  {string} string String to search in
     * @param  {string} is     String to look for
     * @return {boolean}        [description]
     */
    lastCharacterIs (string, is) {
        return this.getLastCharacter(string) == is;
    }

    /**
     * Get first character
     * @param  {string} string String to get first character
     * @return {string}        
     */
    getFirstCharacter (string) {
        return string ? string[0] : '';
    }

    /**
     * Is the first character something
     * @param  {string} string String to search in
     * @param  {string} is     String to look for
     * @return {boolean}        
     */
    firstCharacterIs (string, is) {
        return this.getFirstCharacter(string) == is;
    }

    /**
     * Generate routes regex
     * @return {null} 
     */
    routesToRegex () {
        let compiled = this.compiled;

        for (let route in this.routes) {
            let currentRoute = this.routes[route];
            // Already compiled. Don't do all the work again
            if (exists(route, compiled)) {
                continue;
            }

            let routeParameters = this.getRouteParameters(route);
            let regexRoute = route;
            let wheres = [];
            let i = 0;

            for (let parameter of routeParameters) {
                // wheres[i++] = parameter.ltrim(':').rtrim('?');
                wheres[i++] = ltrim(rtrim(parameter, '?'), ':');
                let lookFor = parameter;
                if (this.lastCharacterIs(parameter, '?')) {
                    lookFor = '/' + lookFor;
                }
                regexRoute = regexRoute.replace(lookFor, this.with(parameter, currentRoute.getWheres()));
            }

            compiled[route] = {
                route: regexRoute,
                keys: wheres,
                instance: currentRoute
            };
        }

        this.compiled = compiled;
    }

    /**
     * Find a URI, compiled or otherwise
     * @param  {string} uri URI to hunt
     * @return {object}     
     */
    find (uri) {
        let compiled = this.compiled;
        let route = null;

        if ('' == uri || null == uri || undefined == uri) {
            uri = this.config.defaultRouteKey;
        }

        // No matching needed I guess :D
        if (exists(uri, compiled)) {
            return compiled[uri];
        }

        for (let currentCompiled in compiled) {
            let toMatch = compiled[currentCompiled];
            let matcher = new Matcher(toMatch.route);
            let results = null;

            if (results = matcher.match(uri)) {
                route = {
                    parameters: array_combine(toMatch.keys, results.slice(1)),
                    route: toMatch.route,
                    uri: uri,
                    instance: toMatch.instance
                };
                break;
            }
        }

        return route;
    }

    /**
     * Handle unresolved routes
     * @return {mixed} 
     */
    getFalloutHandler () {
        if (exists('fallout', this.config) && is_type(this.config['fallout'], 'function')) {
            return this.config['fallout'];
        }
    }

    /**
     * Normalize the value to a string
     * @param  {mixed} value Value to normalize
     * @return {string}       
     */
    normalize (value) {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number') {
            return '' + value;
        }

        return value;
    }

    /**
     * Map routes
     * @param  {object} routes Routes to map
     * @return {Router}        
     */
    map (routes) {
        for (let route in routes) {
            let thisUri = this.previousUri;
            let prefix = this.previousUri ? this.previousUri + '/' : '';

            this.previousUri = prefix + route;

            if (is_type(routes[route], 'object')) {
                this.map(routes[route]);
            } else {
                this.add(prefix + route, routes[route]);
            }

            this.previousUri = thisUri;
        }

        this.previousUri = null;

        return this;
    }

    /**
     * Add a route
     * @param {string} uri      URI to map to
     * @param {callable} callable Callable
     * @return {Router}
     */
    add (uri, callable) {
        this.routes[uri] = new Route(uri, callable, this);

        return this;
    }

    /**
     * Map a parameter
     * @param  {string} key   Key parameter to map
     * @param  {string} regex Regex to map to key
     * @return {Router}       [description]
     */
    where (key, regex) {
        this.wheres[key] = regex;

        return this;
    }

    /**
     * Generate a URL
     * @param  {string} uri        URI String
     * @param  {Object} parameters Parameters
     * @return {string|boolean}            
     */
    url (uri, parameters = {}) {
        uri = this.normalize(uri);
        let route = this.find(uri ? trimmer(uri, '/') : '');

        if (! route) {
            throw new Error(`[Router] No route was found while creating url [${uri}]`);
        }

        for (let key in parameters) {
            uri = uri.replace(`:${key}`, parameters[key]);
        }

        if ('default' == route.route) {
            return '';
        }

        let matcher = new Matcher(route.route);

        if (matcher.test(uri)) {
            return uri;
        }

        return false;
    }

    /**
     * Launch a route
     * @param  {string} uri URI to search and route
     * @return {mixed}
     */
    route (uri) {
        this.routesToRegex();
        uri = this.normalize(uri);
        
        let route = this.find(uri ? trimmer(uri, '/') : '');

        if (! route) {
            let fallout = this.getFalloutHandler();

            if (! is_type(fallout, 'function')) {
                throw new Error('[Router] No route was found, nor any fallout function.');
            }

            return fallout.apply(this, [404, this]);
        }

        return route.instance.launch(route.parameters);
    }
}