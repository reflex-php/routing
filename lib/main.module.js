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
    return key in array;
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

function trimmer(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('^[' + charlist + ']+$'), '');
};

function ltrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('^[' + charlist + ']+'), '');
};

function rtrim(string, charlist) {
    charlist = charlist || 's';
    return string.replace(new RegExp('[' + charlist + ']+$'), '');
};

var defaultConfig = {
    fallout: function fallout(code) {
        return console.log(code);
    },

    defaultRouteKey: 'default'
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
        this.wheres = {};

        // wrap objects/functions in an array
        if (is_type(callbacks, 'function') || is_type(callbacks, 'object')) {
            callbacks = [callbacks];
        }

        this.callbacks = callbacks || [];
    }

    babelHelpers.createClass(Route, [{
        key: 'launch',
        value: function launch(parameters) {
            var callableArguments = new Array();

            for (var parameter in parameters) {
                callableArguments.push(parameters[parameter]);
            }

            var responses = [];
            var callbacks = this.callbacks || [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var callback = _step.value;

                    if (is_type(callback, 'function')) {
                        this.resolve(callback, parameters);
                        responses.push(callback.apply(this, callableArguments));
                    }
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

            return responses;
        }
    }, {
        key: 'findPattern',
        value: function findPattern(functionString) {
            var matches = null;
            var patterns = {
                patternPreES2015: /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
                patternPostES2015: /^(?:\()?([\d\w\s,]*)(?:\))?/m
            };

            for (var pattern in patterns) {
                if (matches = functionString.match(patterns[pattern])) {
                    return matches;
                }
            }

            return null;
        }
    }, {
        key: 'resolve',
        value: function resolve(callback, parameters) {
            var _this = this;

            var FN_ARG_SPLIT = /,/;
            var reflection = callback.toString();
            var matches = this.findPattern(reflection);
            var dependencies = matches[1].split(FN_ARG_SPLIT);
            var resolved = new Array();

            for (var i = 0, count = dependencies.length; i < count; i++) {
                dependencies[i] = dependencies[i].replace(/(?:_)([a-z_]+)/im, '$1');
            }

            return function () {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = dependencies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dependency = _step2.value;

                        if (dependency in parameters) {
                            resolved.push(parameters[dependency]);
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                callback.apply(_this, resolved);
            };
        }
    }, {
        key: 'add',
        value: function add(callback) {
            this.callbacks.push(callback);
        }
    }, {
        key: 'where',
        value: function where(key, regex) {
            this.wheres[key] = regex;

            return this;
        }
    }, {
        key: 'getWheres',
        value: function getWheres() {
            return this.wheres;
        }
    }]);
    return Route;
}();

var Router = function () {
    function Router() {
        var mappables = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        babelHelpers.classCallCheck(this, Router);

        this.routes = {};
        this.config = extend(defaultConfig, config);
        this.wheres = {
            'id': '[0-9]+',
            '*': '.*'
        };
        this.compiled = {};
        this.previousUri;

        if (is_type(mappables, 'object')) {
            this.map(mappables);
        }
    }

    babelHelpers.createClass(Router, [{
        key: 'getRouteParameters',
        value: function getRouteParameters(route) {
            var matcher = new Matcher('(?::)((?:[a-z]{1})(?:[0-9a-z_]*))', 'i');
            var routeParts = route.split('/');

            return matcher.match(routeParts);
        }
    }, {
        key: 'with',
        value: function _with(where, routeWheres) {
            var wheres = extend(this.wheres, routeWheres);
            var whereKey = ltrim(rtrim(where, '?'), ':');
            var regex = exists(whereKey, wheres) ? wheres[whereKey] : '.*';

            if (this.lastCharacterIs(where, '?')) {
                return '(?:/{1}(' + regex + '|)|)';
            }

            return '(' + regex + ')';
        }
    }, {
        key: 'getLastCharacter',
        value: function getLastCharacter(string) {
            return string ? string[string.length - 1] : '';
        }
    }, {
        key: 'lastCharacterIs',
        value: function lastCharacterIs(string, is) {
            return this.getLastCharacter(string) == is;
        }
    }, {
        key: 'getFirstCharacter',
        value: function getFirstCharacter(string) {
            return string ? string[0] : '';
        }
    }, {
        key: 'firstCharacterIs',
        value: function firstCharacterIs(string, is) {
            return this.getFirstCharacter(string) == is;
        }
    }, {
        key: 'routesToRegex',
        value: function routesToRegex() {
            var compiled = this.compiled;

            for (var route in this.routes) {
                var currentRoute = this.routes[route];
                // Already compiled. Don't do all the work again
                if (exists(route, compiled)) {
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

                        // wheres[i++] = parameter.ltrim(':').rtrim('?');
                        wheres[i++] = ltrim(rtrim(parameter, '?'), ':');
                        var lookFor = parameter;
                        if (this.lastCharacterIs(parameter, '?')) {
                            lookFor = '/' + lookFor;
                        }
                        regexRoute = regexRoute.replace(lookFor, this.with(parameter, currentRoute.getWheres()));
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

                compiled[route] = {
                    route: regexRoute,
                    keys: wheres,
                    instance: currentRoute
                };
            }

            this.compiled = compiled;
        }
    }, {
        key: 'find',
        value: function find(uri) {
            var compiled = this.compiled;
            var route = null;

            if ('' == uri || null == uri || undefined == uri) {
                uri = this.config.defaultRouteKey;
            }

            // No matching needed I guess :D
            if (exists(uri, compiled)) {
                return compiled[uri];
            }

            for (var currentCompiled in compiled) {
                var toMatch = compiled[currentCompiled];
                var matcher = new Matcher(toMatch.route);
                var results = null;

                if (results = matcher.match(uri)) {
                    route = {
                        parameters: array_combine(toMatch.keys, results.slice(1)),
                        route: toMatch.route,
                        uri: uri,
                        instance: toMatch.instance
                    };
                    break;
                }
            }

            return route;
        }
    }, {
        key: 'getFalloutHandler',
        value: function getFalloutHandler() {
            if (exists('fallout', this.config)) {
                return is_type(this.config['fallout'], 'function') ? this.config['fallout'] : null;
            }
        }
    }, {
        key: 'normalize',
        value: function normalize(value) {
            if (typeof value === 'string') {
                return value;
            }

            if (typeof value === 'number') {
                return '' + value;
            }

            return value;
        }
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
    }, {
        key: 'add',
        value: function add(uri, callable) {
            return this.routes[uri] = new Route(uri, callable, this);
        }
    }, {
        key: 'where',
        value: function where(key, regex) {
            this.wheres[key] = regex;

            return this;
        }
    }, {
        key: 'url',
        value: function url(uri, parameters) {
            uri = this.normalize(uri);
            var route = this.find(uri ? trimmer(uri, '/') : '');

            if (!route) {
                throw new Error('[Router] No route was found while creating url [' + uri + ']');
            }

            for (var key in parameters) {
                uri = uri.replace(':' + key, parameters[key]);
            }

            var matcher = new Matcher(route.route);

            if (matcher.test(uri)) {
                return uri;
            }

            return false;
        }
    }, {
        key: 'route',
        value: function route(uri) {
            this.routesToRegex();
            uri = this.normalize(uri);

            var route = this.find(uri ? trimmer(uri, '/') : '');
            if (!route) {
                var fallout = this.getFalloutHandler();

                if (!fallout || !is_type(fallout, 'function')) {
                    throw new Error('[Router] No route was found, nor any fallout function.');
                }

                return fallout(404, this);
            }

            return route.instance.launch(route.parameters);
        }
    }]);
    return Router;
}();

module.exports = Router;