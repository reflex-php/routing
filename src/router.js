import { extend, exists, is_type, array_combine, ltrim, rtrim, trimmer } from './util.js';
import { defaultConfig } from './config.js';
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
        this.patterns = {
            'escape': [/[\-{}\[\]+?.,\\\^$|#\s]/g, '\\$&'],
            'optional': [/\((.*?)\)/g, '(?:$1)?'],
            'named': [/(\(\?)?:\w+/g, (match, optional) => optional ? match : '([^/?]+)'],
            'greedy': [/\*\w+/g, '([^?]*?)'],
        };
        this.compiled = {};
        this.previousUri;
        this.beforeQueue = new Array();
        this.afterQueue = new Array();

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
        for (let pattern in this.patterns) {
            let replacement = this.patterns[pattern];

            route = route.replace(replacement[0], replacement[1]);
        }

        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    }

    /**
     * Generate routes regex
     * @return {null} 
     */
    routeToRegex (route) {
        this.compiled[route.uri] = new CompiledRoute(this.getRouteParameters(route.uri), route);
    }

    normalizeWheres (current) {
        return ltrim(rtrim(current, '?'), ':');
    }

    emptyUriString(uri) {
        return '' == uri || null == uri || undefined == uri;
    }

    getDefaultRouteKey() {
        return this.config.defaultRouteKey;
    }

    before (callable) {
        this.beforeQueue.push(callable);
        return this;
    }

    after (callable) {
        this.afterQueue.push(callable);

        return this;
    }

    /**
     * Launch a route
     * @param  {string} uri URI to search and route
     * @return {mixed}
     */
    route (uri) {
        let route = this.find(this.normalize(uri));
        const self = this;
        this.beforeQueue.map(callable => callable(self, route, uri));

        if (! route) {
            let fallout = this.getFalloutHandler();

            if (! is_type(fallout, 'function')) {
                throw new Error('[Router] No route was found, nor any fallout function.');
            }

            return fallout.apply(this, [404, this]);
        }

        route.launch();

        this.afterQueue.map(callable => callable(self, route, uri));
    }

    /**
     * Find a URI, compiled or otherwise
     * @param  {string} uri URI to hunt
     * @return {object}     
     */
    find (uri) {
        if (this.emptyUriString(uri)) {
            uri = this.getDefaultRouteKey();
        }

        for (let compiledKey in this.compiled) {
            let compiledRoute = this.compiled[compiledKey];

            if (compiledRoute.matches(uri)) {
                return compiledRoute;
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
        var route = new Route(uri, callable, this);
        this.routeToRegex(route);
        this.routes[uri] = route;

        return this;
    }
}