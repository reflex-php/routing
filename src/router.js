import { extend, exists, is_type, ltrim } from './util.js';
import { defaultConfig } from './config.js';
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
        this.patterns = this.config.patterns;
        this.previousUri = '';
        this.beforeQueue = new Array;
        this.afterQueue = new Array;
        this.current = null;

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
     * Checkes to see if passed uri is an 'empty' value
     * @param  {mixed} uri URI to check
     * @return {boolean}
     */
    emptyUriString(uri) {
        return '' == uri || null == uri || undefined == uri;
    }

    /**
     * Get the 'default' route uri
     * @return {string} 
     */
    get defaultURI() {
        return this.config.defaultURI;
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
     * @param {boolean} fire Automatically fire the route?
     * @return {Route|Array|null}
     */
    route (uri, fire = true) {
        let route = this.find(this.normalize(uri));
        let response = null;

        this.beforeQueue.map(callable => callable(this, route, uri));
        this.current = route;

        if (route && fire) {
            response = route.launch();
        }

        response = this.afterQueue.map(callable => callable(this, route, uri, response));

        return fire ? response : route;
    }

    /**
     * Redirects to another route without launching before/after callbacks
     * @param  {string} uri URI to search and route
     * @param {boolean} fire Automatically fire the route?
     * @return {Route|Array|null}     
     */
    redirect(uri, fire = true) {
        let route = this.find(this.normalize(uri));
        this.current = route;

        if (route && fire) {
            return route.launch();
        }

        return route;
    }

    /**
     * Find a URI, compiled or otherwise
     * @param  {string} uri URI to hunt
     * @return {Route|null}     
     */
    find (uri) {
        if (this.emptyUriString(uri)) {
            uri = this.defaultURI;
        }

        uri = '/' + ltrim(uri, '/');

        for (let routeURI in this.routes) {
            let route = this.routes[routeURI];

            if (route.matches(uri)) {
                return route;
            }
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

            this.previousUri = `${this.previousUri}${route == '/' || this.emptyUriString(route) ? '' : '/'}${route}`;

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
     * Create a new instance of Route or a previous one
     * @param  {string} uri URI to generate route for
     * @return {Route}           
     */
    routeFactory(uri) {
        uri = '/' + ltrim(uri, '/');

        if (exists(uri, this.routes)) {
            return this.routes[uri];
        }

        return this.routes[uri] = new Route(
            uri,
            this.routeToRegex(uri),
            this
        );
    }

    /**
     * Add a route
     * @param {string}   uri      URI to map to
     * @param {callable} callable Callable
     * @return {Router}
     */
    add (uri, callable) {
        let route = this.routeFactory(uri);

        route.add(callable);

        return this;
    }
}