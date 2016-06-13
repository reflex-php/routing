export default class CompiledRoute {
    constructor(regex, route) {
        this.regex = regex;
        this.route = route;
        this.parameters = null;
    }

    getRegex() {
        return this.regex;
    }

    getRoute() {
        return this.route;
    }

    matches(uri) {
        var result = this.regex.exec(uri);
        if (result) {
            this.parameters = result.slice(1);
            return true;
        }

        return false;
    }

    getParameters() {
        return this.parameters.map((parameter, i) => {
            if (i === this.parameters.length - 1) {
                return parameter || null;
            }

            return parameter ? decodeURIComponent(parameter) : null;
        });
    }

    launch() {
        this.route.launch(this.getParameters());
    }
}