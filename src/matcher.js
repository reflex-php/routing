export default class Matcher {
    constructor (pattern, flags) {
        this.pattern = new RegExp(pattern, flags || 'i');
    }

    escape (s) {
        return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
    }

    match (string) {
        if (typeof string == 'object') {
            return string.filter(
                function (value) {
                    let result = this.pattern.exec(value);
                    return result;
                },
                this
            );
        }

        return this.pattern.exec(string);
    }

    test (string) {
        return this.pattern.test(string);
    }
}