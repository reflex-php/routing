var Router = (function () {
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

    function exists(key, array) {
        return is_type(array, 'object') && key in array;
    }

    function is_type(thing, assertThis) {
        var typeString = Object.prototype.toString.call(thing);

        return typeString.toLowerCase() === '[object ' + assertThis.toLowerCase() + ']';
    }

    function array_combine(keys, values) {
        var new_array = {};
        var keycount = keys && keys.length;
        var i = 0;

        // input sanitation
        if ((typeof keys === 'undefined' ? 'undefined' : babelHelpers.typeof(keys)) !== 'object' || (typeof values === 'undefined' ? 'undefined' : babelHelpers.typeof(values)) !== 'object' || // Only accept arrays or array-like objects
        typeof keycount !== 'number' || typeof values.length !== 'number' || !keycount) {
            // Require arrays to have a count
            return false;
        }

        // number of elements does not match
        if (keycount != values.length) {
            return false;
        }

        for (i = 0; i < keycount; i++) {
            new_array[keys[i]] = values[i];
        }

        return new_array;
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

    var Matcher = function () {
        function Matcher(pattern, flags) {
            babelHelpers.classCallCheck(this, Matcher);

            this.pattern = new RegExp(pattern, flags || 'i');
        }

        babelHelpers.createClass(Matcher, [{
            key: 'escape',
            value: function escape(s) {
                return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
            }
        }, {
            key: 'match',
            value: function match(string) {
                if ((typeof string === 'undefined' ? 'undefined' : babelHelpers.typeof(string)) == 'object') {
                    return string.filter(function (value) {
                        var result = this.pattern.exec(value);
                        return result;
                    }, this);
                }

                return this.pattern.exec(string);
            }
        }, {
            key: 'test',
            value: function test(string) {
                return this.pattern.test(string);
            }
        }]);
        return Matcher;
    }();

    var Queue = function () {
        function Queue() {
            var autorun = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
            babelHelpers.classCallCheck(this, Queue);

            this.running = false;
            this.autorun = autorun;
            this.queue = [];
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
        function CompiledRoute(route, keys, instance) {
            babelHelpers.classCallCheck(this, CompiledRoute);

            this.route = route;
            this.keys = keys;
            this.instance = instance;
        }

        babelHelpers.createClass(CompiledRoute, [{
            key: "getKeys",
            value: function getKeys() {
                return this.keys;
            }
        }, {
            key: "getRoute",
            value: function getRoute() {
                return this.route;
            }
        }, {
            key: "getInstance",
            value: function getInstance() {
                return this.instance;
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
            this.wheres = {
                'id': '[0-9]+',
                '*': '[\w\-]+'
            };
            this.compiled = {};
            this.previousUri;

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
                var matcher = new Matcher('(?::)((?:[a-z]{1})(?:[0-9a-z_]*))', 'i');
                var routeParts = route.split('/');

                return matcher.match(routeParts);
            }

            /**
             * Generate with regex
             * @param  {string} where       where to lookup
             * @return {string}             
             */

        }, {
            key: 'with',
            value: function _with(where) {
                var wheres = this.wheres;
                var whereKey = this.normalizeWheres(where);
                var regex = exists(whereKey, wheres) ? wheres[whereKey] : '[\\w\\-]+';

                if (where.endsWith('?')) {
                    return '(?:\/{1}(' + regex + ')|)';
                }

                return '(' + regex + ')';
            }

            /**
             * Generate routes regex
             * @return {null} 
             */

        }, {
            key: 'routesToRegex',
            value: function routesToRegex() {
                for (var route in this.routes) {
                    var currentRoute = this.routes[route];

                    // Already compiled. Don't do all the work again
                    if (this.isCompiled(route)) {
                        continue;
                    }

                    var routeParameters = this.getRouteParameters(route);
                    var regexRoute = route;
                    var wheres = [];
                    var i = 0;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = routeParameters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var parameter = _step.value;

                            wheres.push(this.normalizeWheres(parameter));
                            var lookFor = parameter;

                            if (parameter.endsWith('?')) {
                                lookFor = '/' + lookFor;
                            }
                            regexRoute = regexRoute.replace(lookFor, this.with(parameter));
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

                    this.compiled[route] = new CompiledRoute(regexRoute, wheres, currentRoute);
                }
            }
        }, {
            key: 'normalizeWheres',
            value: function normalizeWheres(current) {
                return ltrim(rtrim(current, '?'), ':');
            }
        }, {
            key: 'isCompiled',
            value: function isCompiled(uri) {
                return exists(uri, this.compiled);
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

            /**
             * Find a URI, compiled or otherwise
             * @param  {string} uri URI to hunt
             * @return {object}     
             */

        }, {
            key: 'find',
            value: function find(uri) {
                this.routesToRegex();

                var route = null;

                if (this.emptyUriString(uri)) {
                    uri = this.getDefaultRouteKey();
                }

                for (var currentCompiled in this.compiled) {
                    var compiledRoute = this.compiled[currentCompiled];
                    var results = null;

                    if (results = this.routeMatchesUri(compiledRoute.getRoute(), uri)) {
                        return {
                            parameters: array_combine(compiledRoute.getKeys(), results.slice(1)),
                            route: compiledRoute.getRoute(),
                            uri: uri,
                            instance: compiledRoute.getInstance()
                        };
                    }
                }
            }
        }, {
            key: 'routeMatchesUri',
            value: function routeMatchesUri(route, uri) {
                return new Matcher('^' + route + '$', 'i').match(uri);
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
                this.routes[uri] = new Route(uri, callable, this);

                return this;
            }

            /**
             * Map a parameter
             * @param  {string} key   Key parameter to map
             * @param  {string} regex Regex to map to key
             * @return {Router}       [description]
             */

        }, {
            key: 'where',
            value: function where(key, regex) {
                this.wheres[key] = regex;

                return this;
            }

            /**
             * Generate a URL
             * @param  {string} uri        URI String
             * @param  {Object} parameters Parameters
             * @return {string|boolean}            
             */

        }, {
            key: 'url',
            value: function url(uri) {
                var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                uri = this.normalize(uri);

                for (var key in parameters) {
                    uri = uri.replace(':' + key, parameters[key]);
                }

                var route = this.find(uri);

                if (!route) {
                    return new Error('[Router] No route was found while creating url [' + uri + ']');
                }

                if (this.getDefaultRouteKey() == route.route) {
                    return '';
                }

                var matcher = new Matcher(route.route);

                if (matcher.test(uri)) {
                    return uri;
                }

                return false;
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

                if (!route) {
                    var fallout = this.getFalloutHandler();

                    if (!is_type(fallout, 'function')) {
                        return new Error('[Router] No route was found, nor any fallout function.');
                    }

                    return fallout.apply(this, [404, this]);
                }

                return route.instance.launch(route.parameters);
            }
        }]);
        return Router;
    }();

    return Router;

}());