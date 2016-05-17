import { extend, exists, is_type, array_combine } from './util.js';
import { defaultConfig } from './config.js';
import Matcher from './matcher.js';
import Route from './route.js';

export default class Router {
    constructor (config, map) {
        this.routes = {};
        this.config = extend(defaultConfig, config);
        this.wheres = {
            'id': '[0-9]+',
            '*': '.*'
        };
        this.compiled = {};
        this.previousUri;

        if (is_type(map, 'object')) {
            for (let subMap in map) {
                this.map(map[subMap]);
            }
        }
    }

    getRouteParameters (route) {
        let matcher = new Matcher('(?::)((?:[a-z]{1})(?:[0-9a-z_]*))', 'i');
        let routeParts = route.split('/');

        return matcher.match(routeParts);
    }

    with (where, routeWheres) {
        let wheres = extend(this.wheres, routeWheres);
        let whereKey = where.ltrim(':').rtrim('?');
        let regex = exists(whereKey, wheres) ? wheres[whereKey] : '.*';

        if (this.lastCharacterIs(where, '?')) {
            return '(?:/{1}(' + regex + '|)|)';
        }

        return '(' + regex + ')';
    }

    getLastCharacter (string) {
        return string ? string[string.length - 1] : '';
    }

    lastCharacterIs (string, is) {
        return this.getLastCharacter(string) == is;
    }

    getFirstCharacter (string) {
        return string ? string[0] : '';
    }

    firstCharacterIs (string, is) {
        return this.getFirstCharacter(string) == is;
    }

    routesToRegex () {
        let compiled = this.compiled;

        for (let route in this.routes) {
            let currentRoute = this.routes[route];
            // Already compiled. Don't do all the work again
            if (exists(route, compiled)) {
                continue;
            }

            let routeParameters = this.getRouteParameters(route);
            let regexRoute = route;
            let wheres = [];
            let i = 0;

            for (let parameter of routeParameters) {
                wheres[i++] = parameter.ltrim(':').rtrim('?');
                let lookFor = parameter;
                if (this.lastCharacterIs(parameter, '?')) {
                    lookFor = '/' + lookFor;
                }
                regexRoute = regexRoute.replace(lookFor, this.with(parameter, currentRoute.getWheres()));
            }

            compiled[route] = {
                route: regexRoute,
                keys: wheres,
                instance: currentRoute
            };
        }

        this.compiled = compiled;
    }

    find (uri) {
        let compiled = this.compiled;
        let route = null;

        if ('' == uri || null == uri || undefined == uri) {
            uri = this.config.defaultRouteKey;
        }

        // No matching needed I guess :D
        if (exists(uri, compiled)) {
            return compiled[uri];
        }

        for (let currentCompiled in compiled) {
            let toMatch = compiled[currentCompiled];
            let matcher = new Matcher(toMatch.route);
            let results = null;

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

    getFalloutHandler () {
        if (exists('fallout', this.config)) {
            return is_type(this.config['fallout'], 'function') ? this.config['fallout'] : null;
        }
    }

    normalize (value) {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number') {
            return '' + value;
        }

        return value;
    }

    map (routes) {
        for (let route in routes) {
            let thisUri = this.previousUri;
            let prefix = this.previousUri ? this.previousUri + '/' : '';

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

    add (uri, callable) {
        return this.routes[uri] = new Route(uri, callable, this);
    }

    where (key, regex) {
        this.wheres[key] = regex;

        return this;
    }

    url (uri, parameters) {
        uri = this.normalize(uri);
        let route = this.find(uri ? uri.trimmer('/') : '');

        if (! route) {
            throw new Error(`[Router] No route was found while creating url [${uri}]`);
        }

        for (let key in parameters) {
            uri = uri.replace(`:${key}`, parameters[key]);
        }

        let matcher = new Matcher(route.route);

        if (matcher.test(uri)) {
            return uri;
        }

        return false;
    }

    route (uri) {
        this.routesToRegex();
        uri = this.normalize(uri);
        
        let route = this.find(uri ? uri.trimmer('/') : '');
        if (! route) {
            let fallout = this.getFalloutHandler();

            if (! fallout || ! is_type(fallout, 'function')) {
                throw new Error('[Router] No route was found, nor any fallout function.');
            }

            return fallout(404, this);
        }

        return route.instance.launch(route.parameters);
    }
}