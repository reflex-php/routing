export default class CompiledRoute {
    /**
     * Constuct CompiledRoute
     * @param  {RegExp} regex Regular expression instance
     * @param  {Route}  route Route instance
     * @return {CompiledRoute}       
     */
    constructor(regex, route) {
        this.regex = regex;
        this.route = route;
        this.parameters = new Array;
    }

    /**
     * Get RegExp instance
     * @return {RegExp} 
     */
    getRegex() {
        return this.regex;
    }

    /**
     * Get Route instance
     * @return {Route} 
     */
    getRoute() {
        return this.route;
    }

    /**
     * Does the compiled route match to the passed in uri?
     * @param  {string} uri URI to check against
     * @return {boolean}
     */
    matches(uri) {
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
    getParameters() {
        return this.parameters.map((parameter, i) => {
            if (i === this.parameters.length - 1) {
                return parameter || null;
            }

            return parameter ? decodeURIComponent(parameter) : null;
        });
    }

    /**
     * Launch the route
     * @return {null} 
     */
    launch() {
        this.route.launch(this.getParameters());
    }
}