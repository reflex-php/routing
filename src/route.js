import { is_type, exists, array_combine } from './util.js';
import Queue from './queue.js';

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
        let callableArguments = new Array();

        for (let parameter in parameters) {
            callableArguments.push(parameters[parameter]);
        }

        const queue = new Queue(false);

        for (let callback of this.callbacks) {
            queue.add(callback);
        }

        queue.next(callableArguments);
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