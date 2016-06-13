'use strict';

var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers;

function extend(to, from) {
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
}

function is_type(thing, assertThis) {
    var typeString = Object.prototype.toString.call(thing);

    return typeString.toLowerCase() === '[object ' + assertThis.toLowerCase() + ']';
}

function ltrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('^[' + charlist + ']+'), '');
};

function rtrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('[' + charlist + ']+$'), '');
};

var defaultConfig = {
    /**
     * Fallout function, handles errors
     */
    fallout: function fallout(code) {
        throw new Error('[Router] Fallout code: ' + code);
    },

    defaultRouteKey: 'home'
};

var Queue = function () {
    function Queue() {
        var autorun = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
        var queue = arguments[1];
        babelHelpers.classCallCheck(this, Queue);

        this.running = false;
        this.autorun = autorun;
        this.queue = queue || new Array();
        this.previousValue = undefined;
    }

    babelHelpers.createClass(Queue, [{
        key: "add",
        value: function add(callable) {
            var _this = this;

            this.queue.push(function (value) {
                var finished = new Promise(function (resolve, reject) {
                    var callbackResponse = callable.apply({}, value || {});

                    if (value && value.concat) {
                        var callableArguments = value.concat(callbackResponse);
                    } else {
                        var callableArguments = [value].concat(callbackResponse);
                    }

                    if (callbackResponse !== false) {
                        resolve(callbackResponse);
                    } else {
                        reject(callbackResponse);
                    }
                });

                finished.then(_this.dequeue.bind(_this, value), function () {});
            });

            if (this.autorun && !this.running) {
                this.dequeue();
            }

            return this;
        }
    }, {
        key: "dequeue",
        value: function dequeue(value) {
            this.running = this.queue.shift();

            if (this.running) {
                this.running(value);
            }

            return this.running;
        }
    }, {
        key: "next",
        get: function get() {
            return this.dequeue;
        }
    }]);
    return Queue;
}();

/**
 * Route
 *
 * @param {string} uri Uri to route
 * @param {object} callbacks Callbacks to call when requested
 * @param {object} router Router instance
 */

var Route = function () {
    function Route(uri, callbacks, router) {
        babelHelpers.classCallCheck(this, Route);

        this.uri = uri;
        this.router = router;

        if (is_type(callbacks, 'function')) {
            callbacks = [callbacks];
        }

        this.callbacks = callbacks;
    }

    babelHelpers.createClass(Route, [{
        key: 'launch',
        value: function launch(parameters) {
            var callableArguments = new Array();

            for (var parameter in parameters) {
                callableArguments.push(parameters[parameter]);
            }

            var queue = new Queue(false);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var callback = _step.value;

                    queue.add(callback);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            queue.next(callableArguments);
        }
    }, {
        key: 'add',
        value: function add(callback) {
            this.callbacks.push(callback);
        }
    }]);
    return Route;
}();

var CompiledRoute = function () {
    function CompiledRoute(regex, route) {
        babelHelpers.classCallCheck(this, CompiledRoute);

        this.regex = regex;
        this.route = route;
        this.parameters = null;
    }

    babelHelpers.createClass(CompiledRoute, [{
        key: "getRegex",
        value: function getRegex() {
            return this.regex;
        }
    }, {
        key: "getRoute",
        value: function getRoute() {
            return this.route;
        }
    }, {
        key: "matches",
        value: function matches(uri) {
            var result = this.regex.exec(uri);
            if (result) {
                this.parameters = result.slice(1);
                return true;
            }

            return false;
        }
    }, {
        key: "getParameters",
        value: function getParameters() {
            var _this = this;

            return this.parameters.map(function (parameter, i) {
                if (i === _this.parameters.length - 1) {
                    return parameter || null;
                }

                return parameter ? decodeURIComponent(parameter) : null;
            });
        }
    }, {
        key: "launch",
        value: function launch() {
            this.route.launch(this.getParameters());
        }
    }]);
    return CompiledRoute;
}();

var Router = function () {
    /**
     * Constructor
     * @param  {Object} mappables Routes to map
     * @param  {Object} config    Configuration
     * @return {Router}           
     */

    function Router() {
        var mappables = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        babelHelpers.classCallCheck(this, Router);

        this.routes = {};
        this.config = extend(defaultConfig, config);
        this.patterns = {
            'escape': [/[\-{}\[\]+?.,\\\^$|#\s]/g, '\\$&'],
            'optional': [/\((.*?)\)/g, '(?:$1)?'],
            'named': [/(\(\?)?:\w+/g, function (match, optional) {
                return optional ? match : '([^/?]+)';
            }],
            'greedy': [/\*\w+/g, '([^?]*?)']
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


    babelHelpers.createClass(Router, [{
        key: 'getRouteParameters',
        value: function getRouteParameters(route) {
            for (var pattern in this.patterns) {
                var replacement = this.patterns[pattern];

                route = route.replace(replacement[0], replacement[1]);
            }

            return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
        }

        /**
         * Generate routes regex
         * @return {null} 
         */

    }, {
        key: 'routeToRegex',
        value: function routeToRegex(route) {
            this.compiled[route.uri] = new CompiledRoute(this.getRouteParameters(route.uri), route);
        }
    }, {
        key: 'normalizeWheres',
        value: function normalizeWheres(current) {
            return ltrim(rtrim(current, '?'), ':');
        }
    }, {
        key: 'emptyUriString',
        value: function emptyUriString(uri) {
            return '' == uri || null == uri || undefined == uri;
        }
    }, {
        key: 'getDefaultRouteKey',
        value: function getDefaultRouteKey() {
            return this.config.defaultRouteKey;
        }
    }, {
        key: 'before',
        value: function before(callable) {
            this.beforeQueue.push(callable);
            return this;
        }
    }, {
        key: 'after',
        value: function after(callable) {
            this.afterQueue.push(callable);

            return this;
        }

        /**
         * Launch a route
         * @param  {string} uri URI to search and route
         * @return {mixed}
         */

    }, {
        key: 'route',
        value: function route(uri) {
            var route = this.find(this.normalize(uri));
            var self = this;
            this.beforeQueue.map(function (callable) {
                return callable(self, route, uri);
            });

            if (!route) {
                var fallout = this.getFalloutHandler();

                if (!is_type(fallout, 'function')) {
                    throw new Error('[Router] No route was found, nor any fallout function.');
                }

                return fallout.apply(this, [404, this]);
            }

            route.launch();

            this.afterQueue.map(function (callable) {
                return callable(self, route, uri);
            });
        }

        /**
         * Find a URI, compiled or otherwise
         * @param  {string} uri URI to hunt
         * @return {object}     
         */

    }, {
        key: 'find',
        value: function find(uri) {
            if (this.emptyUriString(uri)) {
                uri = this.getDefaultRouteKey();
            }

            for (var compiledKey in this.compiled) {
                var compiledRoute = this.compiled[compiledKey];

                if (compiledRoute.matches(uri)) {
                    return compiledRoute;
                }
            }
        }

        /**
         * Handle unresolved routes
         * @return {mixed} 
         */

    }, {
        key: 'getFalloutHandler',
        value: function getFalloutHandler() {
            if (is_type(this.config['fallout'], 'function')) {
                return this.config['fallout'];
            }
        }

        /**
         * Normalize the value to a string
         * @param  {mixed} value Value to normalize
         * @return {string}       
         */

    }, {
        key: 'normalize',
        value: function normalize(value) {
            value = function (value) {
                if (typeof value === 'string') {
                    return value;
                }

                if (typeof value === 'number') {
                    return '' + value;
                }

                return value;
            }(value);

            return value ? ltrim(rtrim(value, '/'), '/') : '';
        }

        /**
         * Map routes
         * @param  {object} routes Routes to map
         * @return {Router}        
         */

    }, {
        key: 'map',
        value: function map(routes) {
            for (var route in routes) {
                var thisUri = this.previousUri;
                var prefix = this.previousUri ? this.previousUri + '/' : '';

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

    }, {
        key: 'add',
        value: function add(uri, callable) {
            var route = new Route(uri, callable, this);
            this.routeToRegex(route);
            this.routes[uri] = route;

            return this;
        }
    }]);
    return Router;
}();

module.exports = Router;