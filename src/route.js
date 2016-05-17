import { is_type } from './util.js';

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
        this.wheres = {};

        // wrap objects/functions in an array
        if (is_type(callbacks, 'function') || is_type(callbacks, 'object')) {
            callbacks = [callbacks];
        }

        this.callbacks = callbacks || [];
    }

    launch (parameters) {
        let callableArguments = new Array();

        for (let parameter in parameters) {
            callableArguments.push(parameters[parameter]);
        }

        let responses = [];
        let callbacks = this.callbacks || [];

        for (let callback of callbacks) {
            if (is_type(callback, 'function')) {
                this.resolve(callback, parameters);
                responses.push(callback.apply(this, callableArguments));
            }   
        }

        return responses;
    }

    findPattern (functionString) {
        let matches = null;
        let patterns = {
            patternPreES2015: /^function\s*[^\(]*\(\s*([^\)]*)\)/m, 
            patternPostES2015: /^(?:\()?([\d\w\s,]*)(?:\))?/m
        };

        for (let pattern in patterns) {
            if (matches = functionString.match(patterns[pattern])) {
                return matches;
            }
        }

        return null;
    }

    resolve (callback, parameters) {
        let FN_ARG_SPLIT = /,/;
        let reflection = callback.toString();
        let matches = this.findPattern(reflection);
        let dependencies = matches[1].split(FN_ARG_SPLIT);
        let resolved = new Array();

        for (let i = 0, count = dependencies.length; i < count; i++) {
            dependencies[i] = dependencies[i].replace(/(?:_)([a-z_]+)/im, '$1');
        }

        return () => {
            for (let dependency of dependencies) {
                if (dependency in parameters) {
                    resolved.push(parameters[dependency]);
                }
            }

            callback.apply(this, resolved);
        };
    }

    add (callback) {
        this.callbacks.push(callback);
    }

    where (key, regex) {
        this.wheres[key] = regex;

        return this;
    }

    getWheres () {
        return this.wheres;
    }
}