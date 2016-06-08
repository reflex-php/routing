import { is_type, exists, array_combine } from './util.js';
import Queue from './queue.js';

/**
 * Route
 *
 * @param {string} uri Uri to route
 * @param {object} callbacks Callbacks to call when requested
 * @param {object} router Router instance
 */
export default class Route {
    constructor (uri, callbacks, router) {
        this.uri = uri;
        this.router = router;

        if (is_type(callbacks, 'function')) {
            callbacks = [callbacks];
        }

        this.callbacks = callbacks;
    }

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

    add (callback) {
        this.callbacks.push(callback);
    }
}