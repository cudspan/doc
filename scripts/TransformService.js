/**
 * Sets up a promise chain to transform XML via an XSL stylesheet.
 */
angular.module('vmturbo.doc.transformService', []).factory('transformService', [
    '$http',
    '$q',
    'conrefService',
    'keyrefProcessService',
    'docUtils',
    function($http, $q, conrefService, keyrefProcessService, docUtils) {
        let _baseUrl = './doc/';
        const _walkthroughXsl = 'xsl/walkthroughBasic.xsl';

        /**
         * Cache of XSLT files -- don't hit the server if we have a file in the cache
         * @type {{}}
         * @private
         */
        let _xslList = {};

        /**
         * Test for IE...  If it has ActiveX then it's IE.
         * @type {boolean}
         */
        let hasActiveX = false;
        if (Object.hasOwnProperty.call(window, 'ActiveXObject') || window.ActiveXObject) {
            hasActiveX = true;
            docUtils.setHasActiveX(hasActiveX);
        }

        /**
         * Test for MS Edge...
         */
        const isMsEdge = navigator.userAgent.indexOf('Edge') > -1;
        docUtils.setIsMsEdge(isMsEdge);

        /**
         * Test for IE version before 10
         * @type {boolean}
         */
        let isLessThan10 = false;
        if (document.all && !window.atob) {
            isLessThan10 = true;
            docUtils.setIsLessThan10(isLessThan10);
        }

        /**
         * Call the appropriate XSLT Transform for the given browser. Then return the result as a string.
         * @param xml
         * @param xsl
         * @returns {string}
         */
        const runTransform = function(
            xml,
            xsl,
            topicPath,
            shortFilename,
            relTopicStr,
            xmlDocName,
            xslDoc,
            transformParams,
            isJson
        ) {
            let ret;

            // code for IE
            if (hasActiveX) {
                let resultDocument = docUtils.transformToFragmentMsIe(
                    xml,
                    xsl,
                    topicPath,
                    shortFilename,
                    relTopicStr,
                    xmlDocName,
                    xslDoc,
                    transformParams
                );
                if (!resultDocument) {
                    return;
                }
                if (isJson) {
                    ret = conrefService.processConrefsInJson(
                        resultDocument,
                        topicPath,
                        xsl,
                        true,
                        xslDoc,
                        transformParams,
                        isLessThan10
                    ); // true for is MS IE...
                    ret = keyrefProcessService.doKeyWordsInJson(ret, false);
                    return ret;
                } else {
                    //
                    // MSE returns a string -- make this an HTML element...
                    //
                    ret = conrefService.processConrefs(
                        resultDocument,
                        topicPath,
                        xsl,
                        true,
                        xslDoc,
                        transformParams,
                        isLessThan10
                    ); // true for is MS IE...
                    ret = keyrefProcessService.doKeyWords(ret, false);
                    //return docUtils.nodeToMarkupText(ret);
                    return docUtils.xml2Str(ret);
                }
            }
            // code for MS Edge
            else if (isMsEdge) {
                let resultDocument = docUtils.transformToFragmentEdge(
                    xml,
                    xsl,
                    '',
                    '',
                    '',
                    transformParams
                );
                if (!resultDocument) {
                    console.log('RESULT DOCUMENT IS UNDEFINED...');
                    return;
                }
                //
                // Process CONREFs...
                //

                if (isJson) {
                    ret = conrefService.processConrefsInJson(
                        resultDocument,
                        topicPath,
                        xsl,
                        false,
                        '',
                        transformParams,
                        false
                    );
                    ret = keyrefProcessService.doKeyWordsInJson(ret);
                    // MS Edge converts all quotes into entity refs. This converts them back for JSON strings.
                    ret = ret.replace(/&quot;/g, '"');
                    return ret;
                } else {
                    ret = conrefService.processConrefs(
                        resultDocument,
                        topicPath,
                        xsl,
                        false,
                        '',
                        transformParams,
                        false
                    );
                    ret = keyrefProcessService.doKeyWords(ret);
                    return docUtils.xml2Str(ret);
                }
            }
            // code for Mozilla, Firefox, Opera, etc.
            else if (document.implementation && document.implementation.createDocument) {
                let resultDocument = docUtils.transformToFragmentMoz(
                    xml,
                    xsl,
                    '',
                    '',
                    '',
                    transformParams
                );
                if (undefined === resultDocument || null === resultDocument) {
                    return;
                }
                //
                // Process CONREFs...
                //
                if (isJson) {
                    ret = conrefService.processConrefsInJson(
                        resultDocument,
                        topicPath,
                        xsl,
                        false,
                        '',
                        transformParams,
                        false
                    );
                    ret = keyrefProcessService.doKeyWordsInJson(ret);
                    return ret;
                } else {
                    ret = conrefService.processConrefs(
                        resultDocument,
                        topicPath,
                        xsl,
                        false,
                        '',
                        transformParams,
                        false
                    );
                    ret = keyrefProcessService.doKeyWords(ret);
                    return docUtils.xml2Str(ret);
                }
            } else {
                console.error('UNKNOWN TRANSFORM ENGINE!!!');
                return;
            }
        };

        const getLastPathTok = function(s) {
            const toks = s.split('/');
            const len = toks.length;
            let ret = '';
            for (let i = 0; i < len - 1; i++) {
                ret = toks[i] + '/';
            }
            return ret;
        };

        const getShortFilename = function(s) {
            const toks = s.split('/');
            const len = toks.length;
            let ret = '';
            for (let i = 0; i < len; i++) {
                ret = toks[i] + '/';
            }
            return ret;
        };

        const getTransformParamOfName = function(s, p) {
            if (!p || !s) {
                return;
            }
            for (let i = 0; i < p.length; i++) {
                if (p[i].name === s) {
                    return p[i];
                }
            }
            return;
        };

        return {
            setBaseUrl(s) {
                _baseUrl = s;
            },
            getBaseUrl() {
                return _baseUrl;
            },
            /**
             * Set up a returnObj that can be passed through the promise chain.
             * @param xslPath
             * @param xmlPath
             */
            initTransformChain: function(xslPath, xmlPath, transformParams, isJson) {
                const deferred = $q.defer();
                let errStr = '';
                let returnObj = {};
                returnObj.resp = 'initTransformChain: ';
                returnObj.params = {};
                returnObj.params.xslPath = _baseUrl + xslPath;
                returnObj.params.xmlPath = _baseUrl + xmlPath;
                returnObj.params.topicParent = getLastPathTok(xmlPath);
                returnObj.params.shortFilename = getShortFilename(xmlPath);
                returnObj.params.relTopicStr = getLastPathTok(xmlPath);
                returnObj.params.transformParams = transformParams;
                if (undefined !== isJson) {
                    returnObj.params.isJson = isJson;
                } else {
                    returnObj.params.isJson = false;
                }
                //
                // Check for errors
                //
                if (!xslPath) {
                    errStr = errStr + 'No xsl path: ';
                }
                if (!xmlPath) {
                    errStr = errStr + 'No xml path: ';
                }

                returnObj.err = errStr;
                if (returnObj.err) {
                    deferred.reject(returnObj.err);
                    return deferred.promise;
                }

                deferred.resolve(returnObj);
                return deferred.promise;
            },
            /**
             * Get an an XSLT file to use in a promise chain that transforms an XML file. The
             * params object must incude the paths to the XSLT file and the XML file.
             * @param res Object with params and resp properties. The params prop is any set of
             * params that need to be ferried along the promise chain.  The response prop is the
             * native promise response (what $http would give you, for example).
             * @returns {*}
             */
            loadXslDoc: function(res) {
                const deferred = $q.defer();
                let returnObj = {};
                returnObj.params = res.params;

                const htmlErr = function() {
                    deferred.reject('Load Xsl error: ' + '\nTried to get: ' + res.params.xslPath);
                    return deferred.promise;
                };

                const cacheXsl = function(result) {
                    _xslList[res.params.xslPath] = jQuery.parseXML(result.data);
                    returnObj.res = _xslList[res.params.xslPath];
                    if (!returnObj.res) {
                        deferred.reject('undefined xslt from cache.');
                    } else {
                        deferred.resolve(returnObj);
                    }
                };

                if (_xslList[res.params.xslPath]) {
                    returnObj.res = _xslList[res.params.xslPath];
                    deferred.resolve(returnObj);
                } else {
                    $http.get(res.params.xslPath).then(cacheXsl, htmlErr);
                }
                return deferred.promise;
            },

            /**
             * A simple wrapper to chain into a transform process.
             * @param res
             * @returns {*}
             */
            getTopic: function(res) {
                const deferred = $q.defer();
                let returnObj = {};
                returnObj.params = res.params;

                const xmlError = function(response) {
                    deferred.reject('Get Topic error: \nTried to get: ' + res.params.xmlPath);
                };

                const setRespObj = function(result) {
                    returnObj.resp = result;
                    deferred.resolve(returnObj);
                };

                $http.get(res.params.xmlPath).then(setRespObj, xmlError);
                return deferred.promise;
            },

            /**
             * Wrapper to call the transform process.  The promise returns the transformed data
             * as a string...  Usually either HTML or JSON.
             * @param res
             * @returns {deferred.promise|{then}}
             */
            doTransform: function(res) {
                const deferred = $q.defer();
                let returnObj = {};
                let xslDoc;

                /**
                 * Set the attribute name and value to filter out of the transformed content.
                 * So far, only supports a single filtering parameter.
                 *
                 * NOTE: XSL 1 does not support passing and parameters into a match statement.
                 * As a result, must create the XSLT templates here, and inject them.  For
                 * each dv_vals token, make a template. Assume attrName is "audience" and
                 * attrVal is "Cisco Verizon". The XSL will look like this:
                 * <xsl:template match="*[@audience='Cisco']"/>
                 * <xsl:template match="*[@audience='Verizon']"/>
                 * @param attrName
                 * @param attrVal
                 */
                const addDitaVal = function(attrName, attrVal) {
                    if (!attrName || !attrVal) {
                        console.error('addDitaVal got an undefined attr name or attrval!');
                        return;
                    }

                    const makeDvTemplate = function(value) {
                        let dvTemplate = xslDoc.createElement('xsl:template');
                        dvTemplate.setAttribute('match', '*[@' + attrName + "='" + value + "']");
                        root.insertBefore(dvTemplate, elems[0]);
                    };
                    let elems = xslDoc.getElementsByTagName('xsl:template');
                    let rootElems = xslDoc.getElementsByTagName('xsl:stylesheet');
                    let root = rootElems[0];
                    if (!root) {
                        // For some reason, Chrome doesn't get anything via getElementsByTagName...
                        // Inserting the element works, but getting the root doesn't.
                        root = xslDoc.documentElement;
                    }

                    let toks = attrVal.split(' ');
                    toks.forEach(makeDvTemplate);
                    // Convert xsl to string, then back to a doc again.
                    // Hack necessary for Mozilla, for some reason.
                    // Careful -- Edge might require this as well.
                    //if(!hasActiveX || !isMsEdge) {
                    if (!hasActiveX) {
                        xslDoc = jQuery.parseXML(docUtils.xml2Str(xslDoc));
                    }
                };

                returnObj.params = res.params;
                let dv_valsObj = getTransformParamOfName('dv_vals', res.params.transformParams);
                xslDoc = _xslList[res.params.xslPath];
                if (dv_valsObj) {
                    let dv_attrObj = getTransformParamOfName('dv_attr', res.params.transformParams);
                    addDitaVal(dv_attrObj.value, dv_valsObj.value);
                }

                returnObj.resp = runTransform(
                    jQuery.parseXML(res.resp.data),
                    xslDoc,
                    res.params.topicParent,
                    res.params.shortFilename,
                    res.params.relTopicStr,
                    '',
                    '',
                    res.params.transformParams,
                    res.params.isJson
                );

                returnObj.resp = docUtils.xml2Str(returnObj.resp);

                if (!returnObj.resp) {
                    console.error('ERRORS IN TRANSFORM DO_TRANSFORM!' + returnObj.err);
                    deferred.reject(
                        'Do Transform got undefined object for topic: ' + res.params.shortFilename
                    );
                } else {
                    deferred.resolve(returnObj);
                }
                return deferred.promise;
            },

            /**
             * Transform the identified XML via the identified XSLT stylesheet.
             * Ultimately passes the transform through the given callback.  Note that
             * for a conversion to JSON, you must set isJson to true.  That enables
             * processing of conrefs in the JSON string.
             * @param content
             * @param xsl
             * @param callback
             * @param transformParams An array of {name: value: } objects with params to pass to the XSLT process.
             * @param isJson A boolean -- set to true if this is a conversion to JSON
             */
            transformFile: function(
                content,
                xsl,
                callback,
                transformParams,
                isJson,
                error,
                verbose
            ) {
                let xmlFile = null;
                let xslPath = _baseUrl + xsl;
                let xmlPath = _baseUrl + content;

                const transformError = function(reason) {
                    if (error) {
                        return error(reason);
                    } else if (reason) {
                        console.error('Transform Error: ' + reason);
                    } else {
                        console.error('transformFile error -- undefined response');
                    }
                };

                //
                // Perform the transform in a promise chain.
                //
                return this.initTransformChain(xsl, content, transformParams, isJson)
                    .then(this.loadXslDoc)
                    .then(this.getTopic)
                    .then(this.doTransform)
                    .then(callback)
                    .then()
                    .catch(transformError);
            },

            getRawFile: function(content) {
                return $http.get(content);
            },

            cleanJsonStr: function(s) {
                let jStr = s.replace(/(\r\n|\n|\r)/gm, ' ');
                jStr = jStr.replace(/\s\s+/g, ' ');
                jStr = jStr.replace(/"/g, '\\"');
                jStr = jStr.replace(/&lt;/g, '<');
                jStr = jStr.replace(/&gt;/g, '>');
                jStr = jStr.replace(/CUD_OPENQUOTE/g, '"');
                jStr = jStr.replace(/CUD_CLOSEQUOTE/g, '"');

                return jStr;
            },

            getWalkthroughXsl: function() {
                return _walkthroughXsl;
            },

            getBaseUrl: function() {
                return _baseUrl;
            },

            getIsMsEdge: function() {
                return isMsEdge;
            },
        };
    },
]);
