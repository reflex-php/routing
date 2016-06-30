import { is_type, exists, array_combine } from './util.js';

export default class Route {
    /**
     * Route
     *
     * @param {string} uri    Uri to route
     * @param {object} router Router instance
     */
    constructor (uri, router) {
        this.uri = uri;
        this.router = router;
        this.callbacks = new Array;
    }

    /**
     * Launch this route
     * @param  {parameters} parameters Parameters to pass to the callable
     * @return {null}            
     */
    launch (parameters) {
        this.callbacks.forEach(callback => callback.apply({}, parameters));
    }

    /**
     * Add a callback to this route
     * @param {callable} callback Callback being added
     * @return {Route}
     */
    add (callback) {
        if (Array.isArray(callback)) {
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
}