import Matcher from './matcher.js';

export default class CompiledRoute {
    constructor(route, keys, instance) {
        this.route = route;
        this.keys = keys;
        this.instance = instance;
    }

    getKeys() {
        return this.keys;
    }

    getRoute() {
        return this.route;
    }

    getInstance() {
        return this.instance;
    }

    matches(uri) {
        return new Matcher('^' + this.route + '$', 'i').match(uri);
    }
}