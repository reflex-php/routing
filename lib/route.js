var _ = require('./util');
var extend = _.extend;
var is_type = _.is_type;

/**
 * Route
 *
 * @param {string} uri Uri to route
 * @param {object} callbacks Callbacks to call when requested
 * @param {object} router Router instance
 */
function Route(uri, callbacks, router) {
    this.uri = uri;
    this.router = router;
    this.wheres = {};

    // wrap objects/functions in an array
    if (is_type(callbacks, 'function') || is_type(callbacks, 'object')) {
        callbacks = [callbacks];
    }

    this.callbacks = callbacks || [];
}

var p = Route.prototype;

extend(p, require('./api/route'));

module.exports = Route;