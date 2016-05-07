function Matcher(pattern, flags) {
    this.pattern = new RegExp(pattern, flags || 'i');

    this.escape = function (s) {
        return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
    };

    this.match = function (string) {
        if (typeof string == 'object') {
            return string.filter(function (value) {
                var result = this.pattern.exec(value);
                return result;
            }, this);
        }

        return this.pattern.exec(string);
    };

    this.test = function (string) {
        return this.pattern.test(string);
    };
}

module.exports = Matcher;