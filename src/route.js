import { is_array } from './util.js';

export default class Route {
    /**
     * Route
     *
     * @param {string} uri    Uri to route
     * @param {object} router Router instance
     */
    constructor (uri, regex, router) {
        this.uri = uri;
        this.regex = regex;
        this.router = router;
        this.callbacks = new Array;
        this.parameters = new Array;
    }

    /**
     * Launch this route
     * @return {Array}            
     */
    launch () {
        return this.callbacks.map(callback => callback.apply({}, this.arguments));
    }

    /**
     * Add a callback to this route
     * @param {callable} callback Callback being added
     * @return {Route}
     */
    add (callback) {
        if (is_array(callback)) {
            callback.forEach(callable => this.add(callable));

            return;
        }

        this.callbacks.push(callback);

        return this;
    }

    /**
     * Flush all callbacks
     * @return {Route} 
     */
    flush () {
        this.callbacks = new Array;

        return this;
    }

    /**
     * Does the compiled route match to the passed in uri?
     * @param  {string} uri URI to check against
     * @return {boolean}
     */
    matches(uri) {
        var result = this.regex.exec(uri);

        if (result) {
            this.parameters = result.slice(1);
            return true;
        }

        return false;
    }

    /**
     * Get parameters for the route from parameter matching done previously
     * @return {array} 
     */
    get arguments() {
        return this.parameters.map((parameter, i) => {
            if (i === this.parameters.length - 1) {
                return parameter || null;
            }

            return parameter ? decodeURIComponent(parameter) : null;
        });
    }
}