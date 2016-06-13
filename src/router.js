import { extend, exists, is_type, array_combine, ltrim, rtrim, trimmer } from './util.js';
import { defaultConfig } from './config.js';
import Matcher from './matcher.js';
import Route from './route.js';
import CompiledRoute from './compiled-route.js';

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
            '\*': '[.*]'
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
     * @return {string}             
     */
    with (where) {
        let wheres = this.wheres;
        let whereKey = this.normalizeWheres(where);
        let regex = exists(whereKey, wheres) ? wheres[whereKey] : '[\\w\\-]+';

        if (where.endsWith('?')) {
            return '(?:\/{1}(' + regex + ')|)';
        }

        return '(' + regex + ')';
    }

    /**
     * Generate routes regex
     * @return {null} 
     */
    routesToRegex () {
        for (let route in this.routes) {
            let currentRoute = this.routes[route];

            // Already compiled. Don't do all the work again
            if (this.isCompiled(route)) {
                continue;
            }

            let routeParameters = this.getRouteParameters(route);
            let regexRoute = route;
            let wheres = [];
            let i = 0;

            for (let parameter of routeParameters) {
                wheres.push(this.normalizeWheres(parameter));
                let lookFor = parameter;

                if (parameter.endsWith('?')) {
                    lookFor = '/' + lookFor;
                }

                regexRoute = regexRoute.replace(lookFor, this.with(parameter));
            }


            this.compiled[route] = new CompiledRoute(regexRoute, wheres, currentRoute);
        }
    }

    normalizeWheres (current) {
        return ltrim(rtrim(current, '?'), ':');
    }

    isCompiled (uri) {
        return exists(uri, this.compiled);
    }

    emptyUriString(uri) {
        return '' == uri || null == uri || undefined == uri;
    }

    getDefaultRouteKey() {
        return this.config.defaultRouteKey;
    }

    /**
     * Find a URI, compiled or otherwise
     * @param  {string} uri URI to hunt
     * @return {object}     
     */
    find (uri) {
        this.routesToRegex();

        if (this.emptyUriString(uri)) {
            uri = this.getDefaultRouteKey();
        }

        for (let compiledKey in this.compiled) {
            let compiledRoute = this.compiled[compiledKey];
            var results = null;

            if (results = compiledRoute.matches(uri)) {
                return {
                    parameters: array_combine(compiledRoute.getKeys(), results.slice(1)),
                    route: compiledRoute.getRoute(),
                    uri: uri,
                    instance: compiledRoute.getInstance()
                };
            }
        }
    }

    /**
     * Handle unresolved routes
     * @return {mixed} 
     */
    getFalloutHandler () {
        if (is_type(this.config['fallout'], 'function')) {
            return this.config['fallout'];
        }
    }

    /**
     * Normalize the value to a string
     * @param  {mixed} value Value to normalize
     * @return {string}       
     */
    normalize (value) {
        value = (function (value) {
            if (typeof value === 'string') {
                return value;
            }

            if (typeof value === 'number') {
                return '' + value;
            }

            return value;
        })(value);

        return value ? ltrim(rtrim(value, '/'), '/') : '';
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

        for (let key in parameters) {
            uri = uri.replace(`:${key}`, parameters[key]);
        }
        
        let route = this.find(uri);

        if (! route) {
            throw new Error(`[Router] No route was found while creating url [${uri}]`);
        }

        if (this.getDefaultRouteKey() == route.route) {
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
        let route = this.find(this.normalize(uri));

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