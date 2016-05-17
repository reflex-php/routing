import Router from './router.js';

export default Router;

String.prototype.trimmer = function (charlist) {
    return this.ltrim(charlist).rtrim(charlist);
};

String.prototype.ltrim = function (charlist) {
    if (charlist === undefined) {
        charlist = 's';
    }

    return this.replace(new RegExp('^[' + charlist + ']+'), '');
};

String.prototype.rtrim = function (charlist) {
    if (charlist === undefined) {
        charlist = 's';
    }

    return this.replace(new RegExp('[' + charlist + ']+$'), '');
};