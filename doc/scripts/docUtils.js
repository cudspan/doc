const DocUtils = function() {
    let that = this;

    let isLessThan10 = false;
    let hasActiveX = false;
    let isMsEdge = false;

    this.setIsLessThan10 = function(x) {
        isLessThan10 = x;
    };
    this.setHasActiveX = function(x) {
        hasActiveX = x;
    };
    this.setIsMsEdge = function(x) {
        isMsEdge = x;
    };

    /**
     * Manage the current set of topic IDs. The ID map means you can call a topic
     * by ID instead of having to know the file name. Loads a JSON file. Each entry in the JSON
     * file is as follows (the hash field is optional, in case you want a link to an ID within
     * a topic):
     *    "TOPIC_ID":{
     *       "topic":"_directory/topic.xml",
     *       "hash":""
     *    }
     */
    this.topicMap = {
        that: this,
        map: null,
        /**
         * Load the passed json file into the map{} object. path should be the
         * url to the same location as the index.html file. Then file is the name
         * of the json file you want to load.
         * @param path
         * @param file
         */
        initTopicMap: function(inMapObj) {
            this.map = inMapObj;
        },
        /**
         * Get the full entry for the passed ID.
         * @param itemId
         * @returns {{}}
         */
        getMapTopicParams: function(itemId) {
            let ret = {};
            ret.topic = this.map[itemId].topic;
            ret.hash = this.map[itemId].hash;
            return ret;
        },
        /**
         * Get a topic path plus hash entry for a given ID.
         * @param itemId
         * @returns {string}
         */
        getMapFullTopicSpec: function(itemId) {
            let ret = 'topic=' + this.map[itemId].topic;
            if (undefined !== this.map[itemId].hash) {
                ret = ret + '&hash=' + this.map[itemId].hash;
            }
            return ret;
        },
        /**
         * Get the entry object for a given ID.
         * @param itemId
         * @returns {*}
         */
        getMapEntry: function(itemId) {
            if (!this.map) {
                console.warn('NO MAP FOR ID: ' + itemId);
                return;
            }
            return this.map[itemId];
        },
    };

    /**
     * Parse url params. One task is to get the base url, so we can set access to
     * the config files. The url can include no params, q params, h (for hash)
     * params, qh params, or hq params. This object parses that out, and sets
     * whether
     * @param params
     * @returns {{}}
     */
    this.getParamsObj = function(params) {
        let toks = params.split('&');
        let i;
        let paramsObj = {};

        for (i = 0; i < toks.length; i++) {
            subToks = toks[i].split('=');
            paramsObj[subToks[0]] = subToks[1];
        }
        return paramsObj;
    };

    /**
     * For the passed URL, get a parsed object of params.
     * @param inUrl
     * @returns {{}}
     */
    this.getPathAndParamsObj = function(inUrl) {
        let ret = {};
        let subToks = [];
        let hashToks = inUrl.split('#!/');
        if (!hashToks) {
            return;
        }
        ret.hashIsMain = false; // No params, or a q or a qh url...
        ret.hashParams = hashToks[1];
        ret.hashPObj;
        if (ret.hashParams) {
            ret.hashIsMain = true; // Assume an h url...
            subToks = ret.hashParams.split('?');
            if (subToks) {
                ret.hashParams = subToks[0];
            }
            ret.hashPObj = that.getParamsObj(ret.hashParams);
        }

        let qToks = inUrl.split('?');
        ret.qParams = '';
        if (qToks && qToks[1]) {
            subToks = qToks[1].split('#!/');
            if (subToks) {
                ret.qParams = subToks[0];
            }
            if (subToks.length > 1) {
                ret.hashIsMain = false; // The hash comes after the q.
            }
        }

        ret.urlBase = '';
        if (ret.hashIsMain) {
            ret.urlBase = hashToks[0];
        } else {
            ret.qPObj = that.getParamsObj(ret.qParams);
            ret.urlBase = qToks[0];
        }
        ret.pathOnly = that.getPathOnly(ret.urlBase);
        return ret;
    };

    /**
     * If the params object doesn't have any hash params, then set
     * the params up. Typically, this will be to give it the default mapped
     * topic for the current config.
     * @param paramObj
     * @param hashParams
     * @returns {*}
     */
    this.setHashParamsForParamObj = function(paramObj, hashParams) {
        console.warn('SETTING DEFAULT HASH P_OBJ: ' + hashParams);
        if (!paramObj.hashPObj) {
            paramObj.hashParams = hashParams;
            paramObj.hashPObj = that.getParamsObj(hashParams);
        }
        return paramObj;
    };

    /**
     * For the passed path/file string, return just the path.
     * @param s
     * @returns {string}
     */
    this.getPathOnly = function(s) {
        let toks = s.split('/');
        let len = toks.length;
        let ret = '';
        for (let i = 0; i < len - 1; ++i) {
            ret = ret + toks[i] + '/';
        }
        return ret;
    };

    /**
     * Get just the filename from a passed in path. If you pass an extension name,
     * then it swaps the filename extension for the passed extension.
     * @param s
     * @param ext
     * @returns {*}
     */
    this.getFnameOnly = function(s, ext) {
        let toks = s.split('/');
        let len = toks.length;
        let ret = '';
        if (!len) {
            ret = s;
        }
        ret = toks[len - 1];

        if (!ext) {
            return ret;
        }

        toks = ret.split('.');
        len = toks.length;
        ret = '';
        for (let i = 0; i < len - 1; i++) {
            ret = ret + toks[i] + '.';
        }
        return ret + ext;
    };

    /**
     * Recursively walk the dom tree
     *
     * @param node
     * @param func
     */
    this.walkTheDom = function walk(node, func) {
        func(node);
        node = node.firstChild;
        while (node) {
            walk(node, func);
            node = node.nextSibling;
        }
    };

    /**
     * Walk the dom to convert it into a string. Use func1 and func2 to
     * create the opening and closing parts of each node string.
     * @param node
     * @param func1
     * @param func2
     */
    this.walkTheDomSerialize = function walk(node, func1, func2) {
        let nodeName = undefined;
        if (node.nodeType === 1) {
            nodeName = node.nodeName;
        } else {
            nodeName = undefined;
        }
        func1(node);
        node = node.firstChild;
        while (node) {
            walk(node, func1, func2);
            node = node.nextSibling;
        }
        func2(nodeName);
    };

    /**
     * Walk the dom starting from node, and get a list of elems of a given name.
     * @param node
     * @param elemName
     * @returns {Array}
     */
    this.getNodeElems = function(node, elemName) {
        let results = [];

        const getElem = function(node) {
            if (node.nodeType === 1 && node.nodeName.toUpperCase() === elemName.toUpperCase()) {
                results.push(node);
            }
        };

        this.walkTheDom(node, getElem);
        return results;
    };

    /**
     * Create a span element and put str into the inner HTML.
     * @param str
     * @returns {Element}
     */
    this.makeSpanFromString = function(str) {
        let retElem = document.createElement('span');
        retElem.innerHTML = str;
        return retElem;
    };

    /**
     * Create a document fragment out of the passed HTML.
     * @param str
     * @returns {DocumentFragment}
     */
    this.makeFragFromString = function(str) {
        let frag = document.createDocumentFragment();
        let retElem = document.createElement('span');
        retElem.innerHTML = str;
        frag.appendChild(retElem);
        return frag;
    };

    /**
     * When serializing a node, convert the tree to text. Calls walkTheDomSerialize...
     * @param node
     * @returns {string}
     */
    this.nodeToMarkupText = function(node) {
        let ret = '';
        let i;
        let len;
        const openElem = function(node) {
            switch (node.nodeType) {
                case 1:
                    ret = ret + '<' + node.nodeName;
                    for (i = 0, attrs = node.attributes, len = attrs.length; i < len; i++) {
                        ret =
                            ret +
                            ' ' +
                            attrs.item(i).nodeName +
                            '="' +
                            attrs.item(i).nodeValue +
                            '"';
                    }
                    ret = ret + '>';
                    break;
                case 3:
                    ret = ret + node.nodeValue;
                    break;
                case 4:
                    ret = ret + '<![CDATA[' + node.nodeValue + ']]';
                    break;
                case 5:
                    ret = ret + node.nodeName;
                    break;
                case 6:
                    ret = ret + node.nodeName;
                    break;
                case 12:
                    ret = ret + node.nodeName;
                    break;
                default:
                    break;
            }
        };

        const closeElem = function(nodeName) {
            if (undefined !== nodeName) {
                ret = ret + '</' + nodeName + '>';
            }
        };

        this.walkTheDomSerialize(node, openElem, closeElem);
        return ret;
    };

    /**
     * Return an array of nodes with the given attr/val
     * @param node
     * @param attr
     * @param val
     * @returns {Array}
     */
    this.getNodeElemsByAttr = function(node, attr, val) {
        let results = [];
        const getElem = function(node) {
            let act = node.nodeType === 1 && node.getAttribute(attr);
            if (typeof act === 'string' && (act === val || typeof val !== 'string')) {
                results.push(node);
            }
        };
        this.walkTheDom(node, getElem);
        return results;
    };

    /**
     * Serialize an XML node to a string.
     * @param xmlNode
     * @returns {*}
     */
    this.xml2Str = function(xmlNode) {
        if (!xmlNode) {
            console.warn('xml2Str got undefined node: ' + xmlNode);
            return;
        }
        //
        // Failsafe this a little -- If you pass a string, then maybe the string
        // is exactly what you want.  Let the caller figure it out.
        //
        if ('string' === typeof xmlNode || xmlNode instanceof String) {
            return xmlNode;
        }
        try {
            // Gecko-based browsers, Safari, Opera.
            return new XMLSerializer().serializeToString(xmlNode);
        } catch (e1) {
            try {
                // Internet Explorer
                if (!xmlNode.xml) {
                    return xmlNode;
                }
                return xmlNode.xml;
            } catch (e2) {
                //Strange Browser ??
                console.error('Conref Xmlserializer - Browser not supported: ' + e2);
            }
        }
        return false;
    };

    /**
     * Run XSLT through a mozilla browser.
     * @param xmlDoc Doc object for the XML to transform
     * @param xsl Doc object for the XSLT stylesheet
     * @param topicPath Optional Property String for the path to the xml file
     * @param shortFilename Optional Property  String for a property to set in the transform
     * @param relTopicStr Optional Property String for a property to set in the trans
     * @returns {DocumentFragment}
     */
    this.transformToFragmentMoz = function(
        xmlDoc,
        xsl,
        topicPath,
        shortFilename,
        relTopicStr,
        transformParams
    ) {
        let paramsList = transformParams || [];

        let xsltProcessor = new XSLTProcessor();
        if (!xsltProcessor) {
            console.error('undefined XSLT processor.');
            return;
        }
        xsltProcessor.importStylesheet(xsl);

        // Set some passed params if they exist...
        if (topicPath) paramsList.push({ name: 'topicPath', val: topicPath });
        if (shortFilename) paramsList.push({ name: 'shortFilename', val: shortFilename });
        if (relTopicStr) paramsList.push({ name: 'topicNameParam', val: relTopicStr });

        if (paramsList) {
            for (var i = 0; i < paramsList.length; i++) {
                xsltProcessor.setParameter(null, paramsList[i].name, paramsList[i].value);
            }
        }
        let ret = xsltProcessor.transformToFragment(xmlDoc, document);
        return ret;
    };

    /**
     * Run xslt through an Edge browser.
     * @param xmlDoc
     * @param xsl
     * @param topicPath
     * @param shortFilename
     * @param relTopicStr
     * @param transformParams
     * @returns {DocumentFragment}
     */
    this.transformToFragmentEdge = function(
        xmlDoc,
        xsl,
        topicPath,
        shortFilename,
        relTopicStr,
        transformParams
    ) {
        let tmp = this.xml2Str(xmlDoc);
        //
        // MS Edge xslt processor does not allow a DTD in the XML.  Remove the DTD statement.
        //
        tmp = tmp.replace(/\<(\?xml|(\!DOCTYPE[^\>\[]+(\[[^\]]+)?))+[^>]+\>/g, '');
        tmp = jQuery.parseXML(tmp);
        let xsltProcessor = new XSLTProcessor();
        if (!xsltProcessor) {
            console.error('undefined XSLT processor.');
            return;
        }

        xsltProcessor.importStylesheet(xsl);

        let paramsList = transformParams || [];

        // Set some passed params if they exist...
        if (topicPath) paramsList.push({ name: 'topicPath', val: topicPath });
        if (shortFilename) paramsList.push({ name: 'shortFilename', val: shortFilename });
        if (relTopicStr) paramsList.push({ name: 'topicNameParam', val: relTopicStr });

        if (paramsList) {
            for (var i = 0; i < paramsList.length; i++) {
                xsltProcessor.setParameter(null, paramsList[i].name, paramsList[i].value);
            }
        }
        return xsltProcessor.transformToFragment(tmp, document);
    };

    /**
     * Run XSLT through an IE browser.  Checks for versions less than v10, and treats them
     * differently...  Passes paths to xml and xslt rather than passing nodes.
     * @param xmlDoc Doc object for the XML to transform
     * @param xsl Doc object for the XSLT stylesheet
     * @param topicPath Optional Property String for the path to the xml file
     * @param shortFilename Optional Property  String for a property to set in the transform
     * @param relTopicStr Optional Property String for a property to set in the transform
     * @param xmlDocName String for the XML doc, to use in pre-10 IE
     * @param xslDocName String for the XSLT to use in pre-10 IE
     * @returns {DocumentFragment}
     */
    this.transformToFragmentMsIe = function(
        xmlDoc,
        xsl,
        topicPath,
        shortFilename,
        relTopicStr,
        xmlDocName,
        xslDocName,
        transformParams
    ) {
        let paramsList = transformParams || [];

        let objSrcTree = new ActiveXObject('MSXML2.FreeThreadedDOMDocument.6.0');
        if (!objSrcTree) {
            console.error('undefined Win doc tree...');
            return;
        }
        objSrcTree.async = false;
        objSrcTree.setProperty('ProhibitDTD', false);
        objSrcTree.setProperty('AllowXsltScript', true);
        objSrcTree.validateOnParse = false;
        if (isLessThan10) {
            // Cannot pass DOM - must pass filename for IE lower than v10
            objSrcTree.load(xmlDocName);
        } else {
            objSrcTree.load(xmlDoc);
        }
        if (objSrcTree.parseError.errorCode) {
            console.error(
                'Error loading XML file: ' + shortFilename + ':\n' + objSrcTree.parseError.reason
            );
            return;
        }

        let objXSLT = new ActiveXObject('MSXML2.FreeThreadedDOMDocument.6.0');
        if (!objXSLT) {
            return;
        }
        objXSLT.async = false;
        objSrcTree.setProperty('ProhibitDTD', false);
        objXSLT.setProperty('AllowXsltScript', true);
        objXSLT.validateOnParse = false;
        if (isLessThan10) {
            // Cannot pass DOM - must pass filename
            objXSLT.load(xslDocName);
        } else {
            objXSLT.load(xsl);
        }
        if (objXSLT.parseError.errorCode) {
            console.error('Error loading XSLT file: ' + xsl + ':\n' + objXSLT.parseError.reason);
            return;
        }

        let xslMachine = new ActiveXObject('Msxml2.XSLTemplate.6.0');
        if (!xslMachine) {
            console.error('NO XSL MACHINE FOR IE');
            return;
        }
        xslMachine.stylesheet = objXSLT;
        let xslproc = xslMachine.createProcessor();
        xslproc.input = objSrcTree;

        // Set some passed params if they exist...
        if (topicPath) paramsList.push({ name: 'topicPath', value: topicPath });
        if (shortFilename) paramsList.push({ name: 'shortFilename', value: shortFilename });
        if (relTopicStr) paramsList.push({ name: 'topicNameParam', value: relTopicStr });

        if (paramsList) {
            for (let i = 0; i < paramsList.length; i++) {
                // Don't set an undefined or null val as an XSLT param -- might confuse the browser
                if (paramsList[i].value === undefined || paramsList[i].value === null) {
                    paramsList[i].value = 'NULL_VAL';
                }
                xslproc.addParameter(paramsList[i].name, paramsList[i].value);
            }
        }

        xslproc.transform();
        let out = xslproc.output;
        return out;
    };

    /**
     * For an IE browser, transform an XML string (as opposed to an XML document).
     * @param xmlDoc
     * @param xsl
     * @param topicPath
     * @param shortFilename
     * @param relTopicStr
     * @param xslDocName
     */
    this.processXmlStringMS = function(
        xmlDoc,
        xsl,
        topicPath,
        shortFilename,
        relTopicStr,
        xslDocName,
        transformParams
    ) {
        let paramsList = transformParams || [];

        let objSrcTree = new ActiveXObject('Microsoft.XMLDOM');
        objSrcTree.async = false;
        objSrcTree.loadXML(xmlDoc);
        if (objSrcTree.parseError.errorCode != 0) {
            let myErr = objSrcTree.parseError;
            console.warn('ERROR IN XML DOC: ' + myErr.reason);
        }

        let objXSLT = new ActiveXObject('MSXML2.FreeThreadedDOMDocument.6.0');
        objXSLT.async = false;
        if (isLessThan10) {
            // Cannot pass DOM - must pass filename
            objXSLT.load(xslDocName);
        } else {
            objXSLT.load(xsl);
        }
        if (objXSLT.parseError.errorCode != 0) {
            let myErr = objXSLT.parseError;
            alert('XSLT error ' + myErr.reason);
        }

        let xslMachine = new ActiveXObject('Msxml2.XSLTemplate.6.0');
        xslMachine.stylesheet = objXSLT;
        var xslproc = xslMachine.createProcessor();
        xslproc.input = objSrcTree;

        // Set some passed params if they exist...
        if (topicPath) paramsList.push({ name: 'topicPath', value: topicPath });
        if (shortFilename) paramsList.push({ name: 'shortFilename', value: shortFilename });
        if (relTopicStr) paramsList.push({ name: 'topicNameParam', value: relTopicStr });

        if (paramsList) {
            for (let i = 0; i < paramsList.length; i++) {
                // Don't set an undefined or null val as an XSLT param -- might confuse the browser
                if (paramsList[i].value === undefined || paramsList[i].value === null) {
                    paramsList[i].value = 'NULL_VAL';
                }
                xslproc.addParameter(paramsList[i].name, paramsList[i].value);
            }
        }
        xslproc.transform();
        return xslproc.output;
    };
};

angular.module('vmturbo.doc.docUtils', []).service('docUtils', DocUtils);
