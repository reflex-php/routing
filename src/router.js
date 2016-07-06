import { empty, extend, exists, is_object, ltrim } from './util.js';
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
        this.previousUri = '';
        this.beforeQueue = new Array;
        this.afterQueue = new Array;
        this.current = null;
        this.routeCount = 0;

        if (is_object(mappables)) {
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
     * Get patterns
     * @return {array}
     */
    get patterns() {
        return this.config.patterns;
    }

    /**
     * Get the 'default' route uri
     * @return {string} 
     */
    get defaultURI() {
        return this.config.defaultURI;
    }

    get isInitial() {
        return 1 === this.routeCount;
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
        let route = this.find(uri);
        let response = null;

        this.routeCount++;
        this.beforeQueue.map(callable => callable(this, route, uri));
        this.current = route;

        if (route && fire) {
            response = route.launch();
        }

        response = this.afterQueue.map(callable => callable(this, route, uri, response));

        if (empty(response)) {
            response = null;
        }

        return fire ? response : route;
    }

    /**
     * Redirects to another route without launching before/after callbacks
     * @param  {string} uri URI to search and route
     * @param {boolean} fire Automatically fire the route?
     * @return {Route|Array|null}     
     */
    redirect(uri, fire = true) {
        let route = this.find(uri);
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
        if (empty(uri)) {
            uri = this.defaultURI;
        }

        uri = this.normalize(uri);

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
        return empty(value) 
            ? ''
            : '/' + ltrim(new String(value), '/');
    }

    /**
     * Map routes
     * @param  {object} routes Routes to map
     * @return {Router}        
     */
    map (routes) {
        for (let route in routes) {
            let thisUri = this.previousUri;

            this.previousUri += this.normalize(route);

            if (is_object(routes[route])) {
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
        uri = this.normalize(uri);

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