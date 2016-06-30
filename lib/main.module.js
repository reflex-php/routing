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

/**
 * Extend an object passed in
 * @param  {object} to   Object to extend
 * @param  {object} from Extend from this
 * @return {object}      
 */
function extend(to, from) {
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
}

/**
 * Key exists in array
 * @param  {string} key   Key to lookup
 * @param  {array}  array Object to look in
 * @return {boolean}       
 */
function exists(key, array) {
    return is_type(array, 'object') && key in array;
}

/**
 * Assert something is something
 * @param  {mixed}   thing      Thing to check
 * @param  {string}  assertThis Type to check against
 * @return {Boolean}            
 */
function is_type(thing, assertThis) {
    var typeString = Object.prototype.toString.call(thing);

    return typeString.toLowerCase() === '[object ' + assertThis.toLowerCase() + ']';
}

/**
 * Trim left of given string
 * @param  {string} string   String to trim
 * @param  {string} charlist Optional character list
 * @return {string}          
 */
function ltrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('^[' + charlist + ']+'), '');
};

var defaultConfig = {
  /**
   * 'Fallout' function, handles not finding route
   * @param  {integer} code Error code
   * @return {null}      
   */
  fallout: function fallout(code) {
    throw new Error('[Router] Fallout code: ' + code);
  },

  /**
   * Default route key
   * @type {String}
   */
  defaultRouteKey: 'home',

  /**
   * Patterns to loop through for URI matching
   * @type {Object}
   */
  patterns: {
    'escape': [/[\-{}\[\]+?.,\\\^$|#\s]/g, '\\$&'],
    'optional': [/\((.*?)\)/g, '(?:$1)?'],
    'named': [/(\(\?)?:\w+/g, function (match, optional) {
      return optional ? match : '([^/?]+)';
    }],
    'greedy': [/\*\w+/g, '([^?]*?)']
  }
};

var Route = function () {
    /**
     * Route
     *
     * @param {string} uri    Uri to route
     * @param {object} router Router instance
     */

    function Route(uri, router) {
        babelHelpers.classCallCheck(this, Route);

        this.uri = uri;
        this.router = router;
        this.callbacks = new Array();
    }

    /**
     * Launch this route
     * @param  {parameters} parameters Parameters to pass to the callable
     * @return {null}            
     */


    babelHelpers.createClass(Route, [{
        key: 'launch',
        value: function launch(parameters) {
            this.callbacks.forEach(function (callback) {
                return callback.apply({}, parameters);
            });
        }

        /**
         * Add a callback to this route
         * @param {callable} callback Callback being added
         * @return {Route}
         */

    }, {
        key: 'add',
        value: function add(callback) {
            var _this = this;

            if (Array.isArray(callback)) {
                callback.forEach(function (callable) {
                    return _this.add(callable);
                });

                return;
            }

            this.callbacks.push(callback);

            return this;
        }

        /**
         * Flush all callbacks
         * @return {Route} 
         */

    }, {
        key: 'flush',
        value: function flush() {
            this.callbacks = new Array();

            return this;
        }
    }]);
    return Route;
}();

var CompiledRoute = function () {
    /**
     * Constuct CompiledRoute
     * @param  {RegExp} regex Regular expression instance
     * @param  {Route}  route Route instance
     * @return {CompiledRoute}       
     */

    function CompiledRoute(regex, route) {
        babelHelpers.classCallCheck(this, CompiledRoute);

        this.regex = regex;
        this.route = route;
        this.parameters = new Array();
    }

    /**
     * Get RegExp instance
     * @return {RegExp} 
     */


    babelHelpers.createClass(CompiledRoute, [{
        key: "getRegex",
        value: function getRegex() {
            return this.regex;
        }

        /**
         * Get Route instance
         * @return {Route} 
         */

    }, {
        key: "getRoute",
        value: function getRoute() {
            return this.route;
        }

        /**
         * Does the compiled route match to the passed in uri?
         * @param  {string} uri URI to check against
         * @return {boolean}
         */

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

        /**
         * Get parameters for the route from parameter matching done previously
         * @return {array} 
         */

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

        /**
         * Launch the route
         * @return {null} 
         */

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


    babelHelpers.createClass(Router, [{
        key: 'routeToRegex',
        value: function routeToRegex(route) {
            for (var pattern in this.patterns) {
                var replacement = this.patterns[pattern];

                route = route.replace(replacement[0], replacement[1]);
            }

            return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
        }

        /**
         * Instantiates a compiled route
         * @return {null} 
         */

    }, {
        key: 'compileRoute',
        value: function compileRoute(route) {
            this.compiled[route.uri] = new CompiledRoute(this.routeToRegex(route.uri), route);
        }

        /**
         * Checkes to see if passed uri is an 'empty' value
         * @param  {mixed} uri URI to check
         * @return {boolean}
         */

    }, {
        key: 'emptyUriString',
        value: function emptyUriString(uri) {
            return '' == uri || null == uri || undefined == uri;
        }

        /**
         * Get the 'default' route key
         * @return {string} 
         */

    }, {
        key: 'getDefaultRouteKey',
        value: function getDefaultRouteKey() {
            return this.config.defaultRouteKey;
        }

        /**
         * Add a before callback
         * @param  {callable} callable Callable
         * @return {Router}          
         */

    }, {
        key: 'before',
        value: function before(callable) {
            this.beforeQueue.push(callable);

            return this;
        }

        /**
         * Add an after callback
         * @param  {callable} callable Callable
         * @return {Router}          
         */

    }, {
        key: 'after',
        value: function after(callable) {
            this.afterQueue.push(callable);

            return this;
        }

        /**
         * Launch a route
         * @param  {string} uri URI to search and route
         * @return {null}
         */

    }, {
        key: 'route',
        value: function route(uri) {
            var _this = this;

            var route = this.find(this.normalize(uri));

            this.beforeQueue.map(function (callable) {
                return callable(_this, route, uri);
            });

            if (!route) {
                var fallout = this.getFalloutHandler();

                if (!is_type(fallout, 'function')) {
                    throw new Error('[Router] No route was found, nor any fallout function.');
                }

                fallout.apply(this, [404, this]);

                return null;
            }

            route.launch();

            this.afterQueue.map(function (callable) {
                return callable(_this, route, uri);
            });
        }

        /**
         * Find a URI, compiled or otherwise
         * @param  {string} uri URI to hunt
         * @return {CompiledRoute|null}     
         */

    }, {
        key: 'find',
        value: function find(uri) {
            if (this.emptyUriString(uri)) {
                uri = this.getDefaultRouteKey();
            }

            uri = '/' + ltrim(uri, '/');

            for (var compiledKey in this.compiled) {
                var compiledRoute = this.compiled[compiledKey];

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

    }, {
        key: 'getFalloutHandler',
        value: function getFalloutHandler() {
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

            return value ? ltrim(value, '/') : '';
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

                this.previousUri = '' + this.previousUri + (route == '/' || this.emptyUriString(route) ? '' : '/') + route;

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

    }, {
        key: 'findExistingRouteFromCompiledRoute',
        value: function findExistingRouteFromCompiledRoute(uri) {
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

    }, {
        key: 'add',
        value: function add(uri, callable) {
            var route = this.findExistingRouteFromCompiledRoute(uri);

            if (!route) {
                route = new Route(uri, this);
            }

            route.add(callable);

            this.compileRoute(route);
            this.routes[uri] = route;

            return this;
        }
    }]);
    return Router;
}();

module.exports = Router;