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
        this.patterns = this.config.patterns;
        this.compiled = {};
        this.previousUri = '';
        this.beforeQueue = new Array();
        this.afterQueue = new Array();

        if (is_type(mappables, 'object')) {
            this.map(mappables);
        }
    }

    /**
     * Turn a route string into a regex instance
     * @param  {string} route Route to transform
     * @return {RegExp}
     */
    routeToRegex (route) {
        for (let pattern in this.patterns) {
            let replacement = this.patterns[pattern];

            route = route.replace(replacement[0], replacement[1]);
        }

        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    }

    /**
     * Instantiates a compiled route
     * @return {null} 
     */
    compileRoute (route) {
        this.compiled[route.uri] = new CompiledRoute(this.routeToRegex(route.uri), route);
    }

    /**
     * Checkes to see if passed uri is an 'empty' value
     * @param  {mixed} uri URI to check
     * @return {boolean}
     */
    emptyUriString(uri) {
        return '' == uri || null == uri || undefined == uri;
    }

    /**
     * Get the 'default' route key
     * @return {string} 
     */
    getDefaultRouteKey() {
        return this.config.defaultRouteKey;
    }

    /**
     * Add a before callback
     * @param  {callable} callable Callable
     * @return {Router}          
     */
    before (callable) {
        this.beforeQueue.push(callable);

        return this;
    }

    /**
     * Add an after callback
     * @param  {callable} callable Callable
     * @return {Router}          
     */
    after (callable) {
        this.afterQueue.push(callable);

        return this;
    }

    /**
     * Launch a route
     * @param  {string} uri URI to search and route
     * @return {null}
     */
    route (uri) {
        let route = this.find(this.normalize(uri));
        
        this.beforeQueue.map(callable => callable(this, route, uri));

        if (! route) {
            let fallout = this.getFalloutHandler();

            if (! is_type(fallout, 'function')) {
                throw new Error('[Router] No route was found, nor any fallout function.');
            }

            fallout.apply(this, [404, this]);

            return null;
        }

        route.launch();

        this.afterQueue.map(callable => callable(this, route, uri));
    }

    /**
     * Find a URI, compiled or otherwise
     * @param  {string} uri URI to hunt
     * @return {CompiledRoute|null}     
     */
    find (uri) {
        if (this.emptyUriString(uri)) {
            uri = this.getDefaultRouteKey();
        }

        uri = '/' + ltrim(uri, '/');

        for (let compiledKey in this.compiled) {
            let compiledRoute = this.compiled[compiledKey];

            if (compiledRoute.matches(uri)) {
                return compiledRoute;
            }
        }

        return null;
    }

    /**
     * Handle unresolved routes
     * @return {callable|null} 
     */
    getFalloutHandler () {
        if (is_type(this.config['fallout'], 'function')) {
            return this.config['fallout'];
        }

        return null;
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

        return value ? ltrim(value, '/') : '';
    }

    /**
     * Map routes
     * @param  {object} routes Routes to map
     * @return {Router}        
     */
    map (routes) {
        for (let route in routes) {
            let thisUri = this.previousUri;

            this.previousUri = `${this.previousUri}${route == '/' ? '' : '/'}${route}`;

            if (is_type(routes[route], 'object')) {
                // Further down the rabbit hole...
                this.map(routes[route]);
            } else {
                this.add(this.previousUri, routes[route]);
            }

            this.previousUri = thisUri;
        }

        this.previousUri = '';

        return this;
    }

    /**
     * Find and return an existing compiled route if foun
     * @param  {string} uri URI to look up
     * @return {CompiledRoute|null}     
     */
    findExistingRouteFromCompiledRoute(uri) {
        if (exists(uri, this.compiled)) {
            return this.compiled[uri].getRoute();
        }

        return null;
    }

    /**
     * Add a route
     * @param {string}   uri      URI to map to
     * @param {callable} callable Callable
     * @return {Router}
     */
    add (uri, callable) {
        let route = this.findExistingRouteFromCompiledRoute(uri);

        if (! route) {
            route = new Route(uri, this);
        }

        route.add(callable);
        
        this.compileRoute(route);
        this.routes[uri] = route;

        return this;
    }
}