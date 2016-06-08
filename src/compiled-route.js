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
}