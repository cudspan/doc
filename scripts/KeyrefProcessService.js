/**
 * Replaces keywords in a JSON string or HTML with the appropriate value.
 */
angular.module('vmturbo.doc.keyrefProcessService', []).factory('keyrefProcessService', [
    '$window',
    '$rootScope',
    'conrefService',
    'docUtils',
    function($window, $rootScope, conrefService, docUtils) {
        let kDat;

        return {
            setData: function(dat) {
                kDat = dat;
            },

            getVal: function(name) {
                if (null === kDat || undefined === kDat) {
                    console.error('KeyRefProcessService was not initialized');
                    return '';
                }
                for (let i = 0; i < kDat.len; i++) {
                    if (kDat.kDataArray[i].name === name) {
                        return kDat.kDataArray[i].val;
                    }
                }
                return '';
            },

            getFilterAttr: function() {
                return kDat.transform_params.dv_attr;
            },
            getFilterVals: function() {
                return kDat.transform_params.dv_vals;
            },
            /**
             * Get the name of the attr we use for filtering.
             * @returns {*}
             */
            getFilterAttr: function() {
                return kDat.transform_params.dv_attr;
            },
            /**
             * Get a space-separated string of names for filters.
             * @returns {string|*}
             */
            getFilterVals: function() {
                return kDat.transform_params.dv_vals;
            },
            /**
             * Add a string to the space-separated list of filter tokens.  If the
             * item is already there, do nothing. Note, this is not too smart about
             * testing...  Any subset will cause a no-op.  Properly refactored, the
             * data should be stored as an array, and converted into the space-separated
             * string when it's requested.
             * @param s
             */
            addFilterVal: function(s) {
                if (
                    !this.getFilterVals()
                        .split(' ')
                        .includes(s)
                ) {
                    kDat.transform_params.dv_vals = this.getFilterVals() + ' ' + s;
                }
            },
            /**
             * The node is already HTML, and the <ph keyref="FOO"/> elements have been
             * transformed to <keyword keyref="FOO"/>. Sets keyword innerHTML to the given term.
             * @param node -- For JSON, this will always be text.  For HTML, could be text or a DOM object.
             * @param isMsExchange -- If true then the node is text, otherwise it's a DOM object.
             * @returns {*}
             */
            doKeyWords: function(node, isMsExchange) {
                let cRefList;
                let listLen;
                let currentElem;
                let term;
                let i;
                let n;

                if (!kDat) {
                    console.log(
                        'KeyRefData not initialized - Happens once when loading the keyref map.'
                    );
                    return ret;
                }

                if (isMsExchange) {
                    n = docUtils.makeSpanFromString(node);
                } else {
                    n = node;
                }
                cRefList = docUtils.getNodeElems(n, 'keyword');
                listLen = cRefList.length;

                for (i = 0; i < listLen; i++) {
                    currentElem = cRefList[i];
                    if (!currentElem) {
                        console.warn('NULL CURRENT ELEM IN KEYREF RESOLVER');
                        return n;
                    }
                    term = this.getVal(currentElem.getAttribute('keyref'));
                    if (term && currentElem.parentNode) {
                        currentElem.innerHTML = term;
                    } else {
                        console.warn('NOT SETTING TERM!');
                        return n;
                    }
                }
                return n;
            },

            /**
             * Since the JSON is just a string, this looks for a magic
             * conref token and replaces it with the key val.
             * @param str
             * @returns {*}
             */
            doKeyWordsInJson: function(str) {
                let ret = str;
                let i;

                if (!kDat) {
                    console.log(
                        'KeyRefDat not initialized - Happens once when loading the keyref map.'
                    );
                    return ret;
                }

                for (i = 0; i < kDat.len; i++) {
                    let name = kDat.kDataArray[i].name;
                    let regExp = `#KEY_WORD:${name}#`;
                    ret = ret.split(regExp).join(this.getVal(name));
                }
                return ret;
            },
        };
    },
]);
