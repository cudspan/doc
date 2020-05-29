/**
 * Expands conrefs in HTML content.
 */
angular.module('vmturbo.doc.conrefService', []).factory('conrefService', [
    '$http',
    '$q',
    'extensionService',
    'docUtils',
    function($http, $q, extensionService, docUtils) {
        let _baseUrl = '../doc/'; // Default -- can be changed per config in index.html

        /**
         * Cache of conref files, with its own calls to load and get a file.
         * @type {{curFile: undefined, list: Array, getFile: conrefFiles.getFile, loadXMLDocForConref: conrefFiles.loadXMLDocForConref}}
         */
        let conrefFiles = {
            curFile: undefined,
            list: new Array(),
            //
            // Try to get a cached version of the file, and set to curFile.
            //
            getFile: function(fname) {
                this.curFile = this.list[fname];
                if (undefined === this.curFile) {
                    this.loadXMLDocForConref(fname);
                }
            },
            //
            // Asynchronously load the data file.
            //
            loadXMLDocForConref: function(dname) {
                let that = this;

                jQuery.ajax({
                    url: dname,
                    success: function(result) {
                        that.list[dname] = result;
                        that.curFile = that.list[dname];
                        if (undefined === that.curFile) {
                            alert('CURFIlE FAIlED...');
                        }
                    },
                    async: false,
                });
            },
        };

        /**
         * Some conrefs don't have a filename in them. This adds in a filename based on the parent reference.
         * @param node
         * @param parentRef
         */
        const resolveConrefAttrs = function(node, parentRef) {
            if (!node) {
                console.error('Resolving Conref Attr got null node.');
                return;
            }
            const setConfRefAttribute = function(currentElem) {
                const currRef = currentElem.getAttribute('conref');
                const refToks = currRef.split('#');
                const refFile = refToks[0];
                const hash = refToks[1];
                if (!refFile) {
                    currentElem.setAttribute('conref', parentRef + '#' + hash);
                }
            };

            let cRefList = docUtils.getNodeElemsByAttr(node, 'conref');

            cRefList.forEach(setConfRefAttribute);
        };

        //
        // Currently a placeholder.  Need to implement a JSON resolution of a conref.
        //
        const jsonConRefs = function(node, topicFullPath, xslDoc, isMsExplorer, xslDocName) {
            return node;
        };

        /**
         * Actually perform the conref expansion.
         * Gets a list of conrefs in the node, and expands them. Then tries to get get the list
         * again.  If there are nested conrefs, the list will have a len, otherwise return.
         * Note that this function actually modifies the passed node.
         * @param node
         * @param topicFullPath
         * @param xslDoc
         * @param isMsExplorer
         * @param xslDocName
         * @returns {*}
         */
        const innerDoConRefs = function(
            node,
            topicFullPath,
            xslDoc,
            isMsExplorer,
            xslDocName,
            transformParams,
            isMsExplorer
        ) {
            let i = 0;
            let listLen = 0;
            let count = 0;

            let cRefList = docUtils.getNodeElems(node, 'conrefwrapper');
            if (cRefList) {
                listLen = cRefList.length;
            }

            const setConrefFrag = function(currentElem) {
                let frag = getConrefContent(
                    currentElem.getAttribute('reference'),
                    topicFullPath,
                    xslDoc,
                    xslDocName,
                    transformParams,
                    isMsExplorer
                );
                if (frag && currentElem.parentNode) {
                    currentElem.parentNode.replaceChild(frag, currentElem);
                    return true;
                }
                if (!frag) {
                    console.error('Failed to get a conref fragment!');
                } else {
                    console.error('Failed to set a conref fragment: ' + frag);
                }
                return;
            };

            while (listLen) {
                //
                // Go through list of conrefs that are currently in the node. For each one,
                // replace the conreffed elem with the conref fragment.  This modifies the node.
                //
                const fragmentSuccess = cRefList.every(currentElem => setConrefFrag(currentElem));
                if (!fragmentSuccess) {
                    // Break out to avoid running away in the loop. A failed conref
                    // will get picked up to be expanded in the next iteration.
                    console.error('Unresolved reference. Check your conref paths.');
                    return node;
                }
                //
                // Check the node for any conrefs that were introduced by the fragments.
                //
                listLen = 0;
                cRefList = docUtils.getNodeElems(node, 'conrefwrapper');
                if (cRefList) {
                    listLen = cRefList.length;
                }
                //
                // Only go 10 levels deep for conrefs.  Just in case the loop runs away.
                //
                count++;
                if (count >= 10) {
                    console.error(
                        'Exceeded depth of conref nesting -- Circular reference in content?'
                    );
                    return node;
                }
            }
            return node;
        };

        /**
         * Get the content from a single conref. Either execute a function from the
         * ExtensionService, or get the conref data file and then get the conref fragment from that.
         * @param ref
         * @param topicFullPath
         * @param xslDoc
         * @param xslDocName
         * @returns {null}
         */
        const getConrefContent = function(
            ref,
            topicFullPath,
            xslDoc,
            xslDocName,
            transformParams,
            isMsExplorer
        ) {
            //
            // Test for Javascript Function magic conref...
            //
            if (!ref) {
                console.error('Cannot get conref content for an empty ref.');
                return;
            }
            if (-1 !== ref.indexOf('jsFunction')) {
                let fParams = ref.split(':');
                let pLen = fParams.length;
                if (!pLen) return null;
                let arg = '';
                let reply;

                if (3 === pLen) {
                    arg = fParams[2];
                }
                let funcName = fParams[1];
                if (extensionService[funcName]) {
                    reply = extensionService[funcName](arg);
                }

                if (reply) {
                    return docUtils.makeSpanFromString(reply);
                }
                return;
            }

            let refToks = ref.split('#');
            let refFile = refToks[0];
            if (null === refFile || '' === refFile) {
                console.error('NO FILE IN CONREF: ' + ref);
                return null;
            }
            let refHash = refToks[1];
            //
            // Open the file... Append the base url so we can get to the correct file.
            conrefFiles.getFile(refFile);

            let refDoc = conrefFiles.curFile;
            if (!refDoc) {
                console.error('No current file when getting conref content: ' + refFile);
                return;
            }
            return getConrefFragmentFromDoc(
                refDoc,
                refHash,
                xslDoc,
                refFile,
                xslDocName,
                _baseUrl + topicFullPath + refFile,
                transformParams,
                isMsExplorer
            );
        };

        /**
         * For a given conref data file and an ID, get and transform the actual conref fragment.
         * Iterate through children in the fragment node to the final fragment.
         * @param xmlDoc
         * @param idStr
         * @param xslDoc
         * @param parentRefFile
         * @param xslDocName
         * @returns {*}
         */
        const getConrefFragmentFromDoc = function(
            xmlDoc,
            idStr,
            xslDoc,
            parentRefFile,
            xslDocName,
            xmlDocName,
            transformParams,
            isMsExplorer
        ) {
            if (null === xmlDoc) {
                console.error('Conref processor was passed a null doc...');
                return;
            }

            let idToks = idStr.split('/');
            let tLen = idToks.length;
            let conrefFrag = xmlDoc;
            let fragArray, i;

            for (i = 0; i < tLen; i++) {
                // Loop down to the last ref id...
                if (!conrefFrag) {
                    break;
                }

                fragArray = docUtils.getNodeElemsByAttr(conrefFrag, 'id', idToks[i]);
                if (!fragArray) {
                    console.warn(
                        'Failed to get a conref fragment. Malformed ID in the conref? ' + idStr
                    );
                }
                conrefFrag = fragArray[0];
            }
            //
            // Before transforming this, need to check all conref attrs for a filename in the reference.
            // If no filename, add the parent filename...
            //
            resolveConrefAttrs(conrefFrag, parentRefFile);
            //
            // Now transform this to HTML...
            //
            if (isMsExplorer) {
                let input = docUtils.xml2Str(conrefFrag);
                let ex = docUtils.processXmlStringMS(
                    input,
                    xslDoc,
                    null,
                    null,
                    null,
                    xslDocName,
                    transformParams
                );
                return docUtils.makeSpanFromString(ex);
            } else {
                return docUtils.transformToFragmentMoz(
                    conrefFrag,
                    xslDoc,
                    null,
                    null,
                    null,
                    transformParams
                );
            }
        };

        return {
            setBaseUrl: function(s) {
                _baseUrl = s;
            },
            getBaseUrl: function() {
                return _baseUrl;
            },

            getNodeElements: function(node, elemName) {
                return docUtils.getNodeElems(node, elemName);
            },

            /**
             * Wrapper to call the whole process. If this is MS Explorer, then the node comes in as
             * text.
             * @param node
             * @param topicFillPath
             * @param xslDoc
             * @param fromMsExplorer
             * @param xslDocName
             * @returns Document Node Object for Mozilla, and markup text for IE
             */
            processConrefs: function(
                node,
                topicFillPath,
                xslDoc,
                isMsExplorer,
                xslDocName,
                transformParams,
                isLessThan10
            ) {
                let nodeToPass;
                if (isMsExplorer) {
                    nodeToPass = docUtils.makeSpanFromString(node);
                } else {
                    nodeToPass = node;
                }
                return innerDoConRefs(
                    nodeToPass,
                    topicFillPath,
                    xslDoc,
                    isMsExplorer,
                    xslDocName,
                    transformParams,
                    isMsExplorer
                );
            },

            /**
             * Wrapper to call the whole process.
             * @param node
             * @param topicFillPath
             * @param xslDoc
             * @param fromMsExplorer
             * @param xslDocName
             * @returns String
             */
            processConrefsInJson: function(
                node,
                topicFillPath,
                xslDoc,
                fromMsExplorer,
                xslDocName,
                transformParams,
                isLessThan10
            ) {
                let nodeToPass;
                if (fromMsExplorer) {
                    // MS node is already text...
                    nodeToPass = node;
                } else {
                    nodeToPass = docUtils.xml2Str(node);
                }
                //
                // Just return the JSON string that comes out of this.
                // For JSON, there's no need for IE to process into markup text.
                //
                let ret = jsonConRefs(
                    nodeToPass,
                    topicFillPath,
                    xslDoc,
                    fromMsExplorer,
                    xslDocName
                );
                return ret;
            },
        };
    },
]);
