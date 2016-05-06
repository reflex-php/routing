var _ = require('./util');
var extend = _.extend;
var exists = _.exists;
var is_type = _.is_type;
var defaultConfig = require('./config');

function Router(config, map) {
    this.routes = {};
    this.config = extend(defaultConfig, config);
    this.wheres = {
        'id': '[0-9]+',
        '*': '.*'
    };
    this.compiled = {};
    this.previousUri;

    if (is_type(map, 'object')) {
        for (var subMap in map) {
            this.map(map[subMap]);
        }
    }
}

var p = Router.prototype;

extend(p, require('./api/router'));

module.exports = Router;