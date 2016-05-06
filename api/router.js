var Route = require('../route');
var Matcher = require('../matcher');
var _ = require('../util');
var is_type = _.is_type;
var extend = _.extend;
var exists = _.exists;
var array_combine = _.array_combine;

exports._getRouteParameters = function (route) {
    var matcher = new Matcher('(?::)((?:[a-z]{1})(?:[0-9a-z_]*))', 'i'),
        route = route.split('/');

    return matcher.match(route);
};

exports._with = function (where, routeWheres) {
    var wheres = extend(this.wheres, routeWheres),
        whereKey = where.ltrim(':').rtrim('?'),
        regex = exists(whereKey, wheres) ? wheres[whereKey] : '.*';

    if (this._lastCharacterIs(where, '?')) {
        return '(?:/{1}(' + regex + '|)|)';
    }

    return '(' + regex + ')';
};

exports._getLastCharacter = function (string) {
    return string ? string[string.length - 1] : '';
};

exports._lastCharacterIs = function (string, is) {
    return this._getLastCharacter(string) == is;
};

exports._getFirstCharacter = function (string) {
    return string ? string[0] : '';
};

exports._firstCharacterIs = function (string, is) {
    return this._getFirstCharacter(string) == is;
};

exports._routesToRegex = function () {
    let compiled = this.compiled;

    for (let route in this.routes) {
        let currentRoute = this.routes[route];
        // Already compiled. Don't do all the work again
        if (exists(route, compiled)) {
            continue;
        }

        let routeParameters = this._getRouteParameters(route),
            regexRoute = route,
            wheres = [],
            i = 0;

        for (let parameter of routeParameters) {
            wheres[i++] = parameter.ltrim(':').rtrim('?');
            let lookFor = parameter;
            if (this._lastCharacterIs(parameter, '?')) {
                lookFor = '/' + lookFor;
            }
            regexRoute = regexRoute.replace(lookFor, this._with(parameter, currentRoute.getWheres()));
        }

        compiled[route] = {
            route: regexRoute,
            keys: wheres,
            instance: currentRoute
        };
    }

    this.compiled = compiled;
};

exports._find = function (uri) {
    var compiled = this.compiled,
        route = null;

    // No matching needed I guess :D
    if (exists(uri, compiled)) {
        return compiled[uri];
    }

    for (var currentCompiled in compiled) {
        var toMatch = compiled[currentCompiled],
            matcher = new Matcher(toMatch.route),
            results = null;

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
};

exports._getFalloutHandler = function () {
    if (exists('fallout', this.config)) {
        return is_type(this.config['fallout'], 'function') ? this.config['fallout'] : null;
    }
};

exports.map = function (routes) {
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
};

exports.add = function (uri, callable) {
    return this.routes[uri] = new Route(uri, callable, this);
};

exports.where = function (key, regex) {
    this.wheres[key] = regex;

    return this;
};

exports.url = function (uri, parameters) {
    var route = this._find(uri.trimmer('/'));

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
};

exports.route = function (uri) {
    this._routesToRegex();
    var route = this._find(uri.trimmer('/'));

    if (!route) {
        var fallout = this._getFalloutHandler();

        if (!fallout || !is_type(fallout, 'function')) {
            throw new Error('No route was found, nor any fallout function.');
        }

        return fallout(404, this);
    }

    return route.instance.launch(route.parameters);
};