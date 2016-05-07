var Matcher = require('../matcher');
var _ = require('../util');
var is_type = _.is_type;

exports.launch = function (parameters) {
    var callableArguments = new Array();
    for (var parameter in parameters) {
        callableArguments.push(parameters[parameter]);
    }

    var responses = [],
        callbacks = this.callbacks || [];

    for (let callback of callbacks) {
        if (is_type(callback, 'function')) {
            this.resolve(callback, parameters);
            responses.push(callback.apply(this, callableArguments));
        }   
    }

    return responses;
};

exports.resolve = function (callback, parameters) {
    var FN_ARGS_REGEX = '^function *[^(]*( *([^)]*))',
        FN_ARG_SPLIT = /,/,
        reflection = callback.toString(),
        matches = reflection.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m),
        dependencies = matches[1].split(FN_ARG_SPLIT),
        resolved = new Array();

    for (var i = 0, count = dependencies.length; i < count; i++) {
        dependencies[i] = dependencies[i].replace(/(?:_)([a-z_]+)/im, '$1');
    }

    return function () {
        for (let dependency of dependencies) {
            if (dependency in parameters) {
                resolved.push(parameters[dependency]);
            }
        }

        callback.apply(this, resolved);
    };
};

exports.add = function (callback) {
    this.callbacks.push(callback);
};

exports.where = function (key, regex) {
    this.wheres[key] = regex;

    return this;
};

exports.getWheres = function () {
    return this.wheres;
};