/**
 * Query combinator class
 * This class sets up all possible combinations of queries
 * run in the application by concatenating their URL with
 * all combinatory outputs from mixing params.
 *
 * Generation is done by logging the queries one by one in
 * a Node-JS environment.
 *
 * Exmaple usage:
 * QueryGen.query('Sales')
 *         .host('http://localhost:9999')
 *         .url('/sales')
 *         .fixParam('sku', '1232456')
 *         .mixParam('class', ['c1', 'c2'])
 *         .mixParam('department', ['d1', 'd2', 'd3'])
 *         .generate();
 *
 * @class QueryGen
 */
class QueryGen {
    /**
     * Creates an instance of QueryGen
     *
     * @memberof QueryGen
     */
    constructor() {
        // matches a valid host name
        this.hostRegExp = /^(https?:\/\/)?([^/:]+)(:\d+)?(\/)?$/;

        // matches a valid URL path
        this.urlRegExp = /^(\/([^/]+))+$/;

        // acceptable param types
        this.paramTypes = ['fix', 'mix'];

        this._reset();
    }

    /**
     * Resets the state of the class instance
     *
     * @memberof QueryGen
     */
    _reset() {
        this.queryName = '';
        this.queryHost = '';
        this.queryUrl = '';
        this.noEmptyFilter = false;
        this.fixed = {};
        this.mixed = {};
    }

    /**
     * Throws an error
     *
     * @param {string} message Error message to display in the thrown error
     *
     * @memberof QueryGen
     */
    _fail(message) {
        throw new Error(`QueryGen Error: ${message}`);
    }

    /**
     * Returns the argument as an array.
     * array -> array
     * value -> value wrapped in an array
     * empty -> empty array
     *
     * @param {*} values Values with unknown type to be returned as an array
     *
     * @returns {array}
     * @memberof QueryGen
     */
    _arrayifyValues(values) {
        if (values !== 0 && !values) {
            return [];
        }
        if (!(values instanceof Array)) {
            return [values];
        }
        return values;
    }

    /**
     * Adds either a fixed or a mixed param to the query combinator.
     *
     * @param {string} name Name of the param
     * @param {array} values Array values of the param
     *
     * @memberof QueryGen
     */
    _addParam(type, name, values) {
        if (typeof type !== 'string' || !this.paramTypes.includes(type)) {
            this._fail(`The \`_addParam\` method expects a type of 'mix' or 'fix'.`);
        }
        if (typeof name !== 'string' || !name) {
            const method = (type === 'fix' ? 'fixParam' : 'mixParam');
            this._fail(`The \`${method}\` method expects a non-empty string name.`);
        }
        const arrayValues = this._arrayifyValues(values);
        if (arrayValues.length) {
            this[type === 'fix' ? 'fixed' : 'mixed'][name] = arrayValues.map((value) => (value.toString().replace(/ /g, '%20')));
        }
    }

    /**
     * Checks the required fields for query generation
     *
     * @memberof QueryGen
     */
    _checkSetup() {
        if (!this.queryName) {
            this._fail('Query name is required.');
        }
        if (!this.queryHost) {
            this._fail('Query host is required.');
        }
        if (!this.queryUrl) {
            this._fail('Query URL is required.');
        }
        if (this.noEmptyFilter && !Object.keys(this.fixed).length && !Object.keys(this.mixed).length) {
            this._fail('Query is always filtered but no filters provided.');
        }
    }

    /**
     * Calculates all possible sub-array values of the given array.
     * then sorts them from small to large based on size and values.
     *
     * @param {array} array Array of values
     *
     * @returns {array}
     * @memberof QueryGen
     */
    _getParamValuesCombined(array) {
        const inflated = new Array(Math.pow(2, array.length)).fill().map((v1, i) => (array.filter((v2, j) => (i & 1 << j))));
        return inflated.sort((a, b) => {
            if (a.length < b.length) {
                return -1;
            }
            else if (a.length === b.length) {
                const aReduced = a.reduce((prev, curr, i) => (prev + Math.pow(10, a.length - i) * array.indexOf(curr)), 0);
                const bReduced = b.reduce((prev, curr, i) => (prev + Math.pow(10, b.length - i) * array.indexOf(curr)), 0);
                if (aReduced < bReduced) {
                    return -1;
                }
                return 1;
            }
            return 1;
        });
    }

    /**
     * Returns true if not all the params in the combination
     * are empty arrays, returns false otherwise.
     *
     * @param {object} combination Param combinaion
     *
     * @returns {boolean}
     * @memberof QueryGen
     */
    _combinationNotEmpty(combination) {
        const keys = Object.keys(combination);
        return (keys.reduce((prev, curr) => (prev + (combination[curr].length ? 0 : 1)), 0) < keys.length);
    }

    /**
     * Builds all possible combinations of params.
     * Each combination is represented as an object with
     * the name of the param as the key and an array of
     * values as the value.
     *
     * @returns {array}
     * @memberof QueryGen
     */
    _getParamsCombined() {
        const mixedInflated = Object.assign({}, ...Object.keys(this.mixed).map((key) => ({ [key]: this._getParamValuesCombined(this.mixed[key]) })));
        const mixedInflatedKeys = Object.keys(mixedInflated);
        const mixedInflatedValues = Object.values(mixedInflated);
        if (!mixedInflatedKeys.length) {
            return [this.fixed];
        }
        return mixedInflatedValues.map((array, i) => (array.map((value) => ({ [mixedInflatedKeys[i]]: value }))))
                                  .reduce((p1, c1) => (p1.reduce((p2, c2) => p2.concat(c1.map((v) => ([].concat(c2, v)))), [])))
                                  .map((c) => { return (c instanceof Array ? Object.assign({}, this.fixed, ...c) : Object.assign({}, this.fixed, c)); })
                                  .filter((c) => (!this.noEmptyFilter || this._combinationNotEmpty(c)));

    }

    /**
     * Formats an object combination into its string form
     *
     * @param {object} combination params combination
     *
     * @returns {string}
     * @memberof QueryGen
     */
    _stringifyParam(combination) {
        const keys = Object.keys(combination);
        const values = Object.values(combination);
        if (keys.length && keys.length > values.filter((v) => (!v.length)).length) {
            return '?' + values.map((array, i) => (array.map((v) => (`${keys[i]}=${v}`)).join('&'))).filter((array) => (!!array.length)).join('&');
        }
        return '';
    }

    /**
     * Resets the state and adds a new query name
     *
     * @param {string} name Name of the query
     *
     * @returns {class}
     * @memberof QueryGen
     */
    query(name) {
        if (typeof name !== 'string' || !name) {
            this._fail('The `query` method expects a non-empty string name.');
        }
        this._reset();
        this.queryName = name;
        return this;
    }

    /**
     * Adds the query host
     *
     * @param {string} host Host of the query
     *
     * @returns {class}
     * @memberof QueryGen
     */
    host(host) {
        if (typeof host !== 'string' || !host || !this.hostRegExp.test(host)) {
            this._fail('The `host` method expects a valid host.');
        }
        if (host[host.length - 1] === '/') {
            host = host.slice(0, -1);
        }
        this.queryHost = host;
        return this;
    }

    /**
     * Adds the query url
     *
     * @param {string} url Url of the query of the form (\/.+)+
     *
     * @returns {class}
     * @memberof QueryGen
     */
    url(url) {
        if (typeof url !== 'string' || !url || !this.urlRegExp.test(url)) {
            this._fail('The `url` method expects a valid URL of the form `(/.+)+`.');
        }
        this.queryUrl = url;
        return this;
    }

    /**
     * Sets the query such that at least one filter
     * is always present.
     *
     * @returns {class}
     * @memberof QueryGen
     */
    alwaysFilter() {
        this.noEmptyFilter = true;
        return this;
    }

    /**
     * Adds a fixed param to the query combinator.
     * A fixed param values are always added to all combinations.
     *
     * @param {string} name Name of the param
     * @param {array} values Array values of the param
     *
     * @returns {class}
     * @memberof QueryGen
     */
    fixParam(name, values) {
        this._addParam('fix', name, values);
        return this;
    }

    /**
     * Adds a mixed param to the query combinator.
     * A mixed param's values are mixed internally and with other
     * mixed params.
     *
     * @param {string} name Name of the param
     * @param {array} values Array values of the param
     *
     * @returns {class}
     * @memberof QueryGen
     */
    mixParam(name, values) {
        this._addParam('mix', name, values);
        return this;
    }

    /**
     * Generates the combination of queries using console log
     *
     * @memberof QueryGen
     */
    generate() {
        // check setup
        this._checkSetup();

        // combine params
        let combinations = this._getParamsCombined();

        // stringify combinations and inject host and url
        combinations = combinations.map((c) => (`${this.queryHost}${this.queryUrl}${this._stringifyParam(c)}`));

        // log combination strings
        combinations.forEach((c) => console.log(c));
    }
}

module.exports = new QueryGen();
