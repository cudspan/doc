/**
 * Created by kalel on 10/21/16.
 */

// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
/**
 * The ID is for the element that contains the text you want to highlight.
 * @param id
 * @param tag
 * @constructor
 */
const Hilightor = function(id, passedElem) {
    let that = this;

    let targetNode;
    if (passedElem) {
        targetNode = passedElem;
    } else {
        targetNode = document.getElementById(id) || document.body;
    }
    let hiliteTag = 'EM';
    //let skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
    let skipTags = new RegExp('^(?:' + hiliteTag + '|SCRIPT|FORM)$');
    const highlightStart = '<span class="searchHighlight">';
    const highlightEnd = '</span>';

    this.input;

    // recursively apply word highlighting
    that.hiliteWords = function(node) {
        let i;
        if (!node) {
            console.warn('Hilightor.hiliteWords got a null node');
            return;
        }
        if (skipTags.test(node.nodeName)) {
            console.warn('Hilightor.hiliteWords skipping tags for ' + node.nodeName);
            return;
        }

        if (node.hasChildNodes()) {
            for (i = 0; i < node.childNodes.length; i++) {
                that.hiliteWords(node.childNodes[i]);
            }
        }
        if (node.nodeType == 3) {
            // NODE_TEXT
            if (node.nodeValue) {
                let wordLists = stemStringToParallelLists(node.nodeValue, that.input);
                if (wordLists) {
                    let output = wordLists.highlightForListOfStemmedWords(
                        that.input,
                        highlightStart,
                        highlightEnd
                    );
                    if (output) {
                        let newSpan = document.createElement('span');
                        newSpan.setAttribute('class', 'search_highlight_wrapper'); // Needed to inject the highlight...
                        newSpan.innerHTML = ' ' + output + ' ';
                        node.parentNode.insertBefore(newSpan, node);
                        node.parentNode.removeChild(node);
                    }
                }
            }
        }
    };

    // remove highlighting
    this.remove = function() {
        let arr = document.getElementsByClassName('searchHighlight');
        if (!arr) {
            return;
        }
        let limit = arr.length;
        let i;
        for (i = 0; i < limit; i++) {
            arr[0].setAttribute('class', '');
        }
        arr = document.getElementsByClassName('search_highlight_wrapper');
        if (!arr) {
            return;
        }
        limit = arr.length;
        for (i = 0; i < limit; i++) {
            arr[0].setAttribute('class', '');
        }
    };

    // start highlighting at target node
    this.apply = function(input) {
        if (!input) {
            console.warn('NO INPUT FOR HIGHLIGHT APPLY');
            return;
        }
        that.input = input;
        that.remove();
        if (!targetNode) {
            console.warn("Highlightor.apply can't find a target node.");
            return;
        }
        that.hiliteWords(targetNode);
    };
};

const stemUnstemmedList = function(list) {
    let len = list.length;
    let i;
    let w = '';
    let retList = new Array();
    for (i = 0; i < len; i++) {
        w = doStem(list[i]);
        if (!w) {
            retList[i] = 'NOT_A_VALID_WORD';
        } else {
            retList[i] = w;
        }
    }
    return retList;
};

const stemStringOfWords = function(s) {
    let i;
    if (!s) {
        return;
    }
    let inputStr = s.replace(/^\s+|\s+$/g, '');
    let input = inputStr.split(' ');
    let len = input.length;
    if (!len) {
        return;
    }

    let retList = new Array();
    for (i = 0; i < len; i++) {
        retList[i] = doStem(input[i]);
    }
    var retStr = '';
    for (i = 0; i < len; i++) {
        retStr = retStr + ' ' + retList[i];
    }
    if (retStr) {
        retStr = retStr.replace(/^\s+|\s+$/g, '');
    }
    return retStr;
};

/**
 * For the given string, create two lists, one of stemmed terms and the other of unstemmed terms.
 * @param inStr
 * @returns {{}}
 */
const stemStringToParallelLists = function(inStr) {
    if (!inStr) {
        return;
    }
    let s = inStr.replace(/\n/g, ' '); // Strip unwanted \n
    s = s.replace(/^\s+|\s+$/g, ''); // Will have to add spaces before and after when putting back into node.
    if (!s) {
        return;
    }

    let unstemmedList = s.split(' ');
    let len = unstemmedList.length;
    if (!len) {
        return;
    }
    let stemmedList = this.stemUnstemmedList(unstemmedList);

    let retObj = {};
    retObj.that = this;
    retObj.len = len;
    retObj.unstemmedList = unstemmedList;
    retObj.stemmedList = stemmedList;

    retObj.getUnstemmedWord = function(w) {
        for (var i = 0; i < this.len; i++) {
            if (this.stemmedList[i] === w) {
                return this.unstemmedList[i];
            }
        }
        return undefined;
    };

    retObj.highlightForListOfStemmedWords = function(stemmedSearchTerms, hlStart, hlEnd) {
        let foundHit = false;
        //
        // Update the unstemmed list with the highlight spans...
        //
        let highlightUnstemmedHits = function(stemmedWord, hlStart, hlEnd) {
            let i;
            for (i = 0; i < retObj.len; i++) {
                if (retObj.stemmedList[i] === stemmedWord) {
                    retObj.unstemmedList[i] = hlStart + retObj.unstemmedList[i] + hlEnd;
                    foundHit = true;
                }
            }
        };

        let searchTerms = stemmedSearchTerms.replace(/^\s+|\s+$/g, '');
        let list = searchTerms.split(' ');
        let listLen = list.length;
        if (!listLen) {
            console.warn('Highlighter got called with empty list of search terms.');
            return;
        }
        let i;
        for (i = 0; i < listLen; i++) {
            highlightUnstemmedHits(list[i], hlStart, hlEnd);
        }

        let retStr = '';
        for (i = 0; i < this.len; i++) {
            retStr = retStr + this.unstemmedList[i] + ' ';
        }
        if (foundHit === true) {
            return retStr;
        }
    };
    return retObj;
};

//
// Client side must replicate stemming that was done to create search database.
//
const doStem = function(w) {
    let len = w.length;
    let sBuf = '';
    let code;
    let i;
    for (i = 0; i < len; i++) {
        code = w.charCodeAt(i);
        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
            sBuf = sBuf + w.charAt(i);
        } else {
            break;
        }
    }
    return stemmer(sBuf.toLowerCase());
};

angular.module('vmturbo.doc.docSearchService', []).factory('docSearchService', [
    '$window',
    '$rootScope',
    'transformService',
    function($window, $rootScope, transformService) {
        let sDat;
        let words;
        let that = this;
        let tmpVal = [];
        let retVal = [];
        let _searchType;
        let _searchTermStr = '';
        let rootDoc = '';

        const getWordWeights = function(word) {
            let w = doStem(word);
            let i;
            if ('And' === _searchType) {
                tmpVal = [];
            }
            for (i = 0; i < sDat.len; i++) {
                let bodyVal = sDat.searchData[i].body[w];
                let titleVal = sDat.searchData[i].title[w];
                let keywordsVal = sDat.searchData[i].keywords[word];
                let val = 0;
                if (bodyVal) {
                    val = parseInt(bodyVal);
                }
                if (titleVal) {
                    val = parseInt(val) + 20 * parseInt(titleVal);
                }
                if (keywordsVal) {
                    val = parseInt(val) + 20 * parseInt(keywordsVal);
                }

                if (0 !== val) {
                    let item = {};
                    item.and = 0;
                    item.score = val;
                    item.file = sDat.searchData[i].file;
                    item.name = sDat.searchData[i].name;
                    tmpVal.push(item);
                    //console.log("getWordWeights - Pushing entry into list: "+item.name +" :: "+item.file);
                }
            }
        };

        /**
         * Call getWordWeights for an OR search
         */
        const getOrWeight = function() {
            tmpVal = [];
            let len = words.length;
            for (let i = 0; i < len; i++) {
                getWordWeights(words[i]);
            }
        };

        /**
         * Call getWordWeights for an AND search
         * @param words
         */
        const getAndWeight = function(words) {
            let len = words.length;
            if (len === 0) {
                console.log('getAndWeight: No Search Terms!');
                return;
            }
            getWordWeights(words[0]);
            mergeHits(); // first word hits go straight into retVal...
            for (let i = 1; i < len; i++) {
                // refine the list...
                andWordIntoList(words[i]);
            }
        };

        /**
         * Step through all the tmpVal items and look for duplicate filenames.
         * Merge these and add up the weights in retVal
         */
        const mergeHits = function() {
            retVal = [];
            let len = tmpVal.length;
            for (let i = 0; i < len; i++) {
                if (i === 0) {
                    retVal.push(tmpVal[i]);
                } else {
                    let retIndex = getRetValFileIndex(tmpVal[i].file);
                    if (-1 === retIndex) {
                        retVal.push(tmpVal[i]);
                    } else {
                        retVal[retIndex].score =
                            parseInt(retVal[retIndex].score) + parseInt(tmpVal[i].score);
                    }
                }
            }
        };

        /**
         * Called for AND search, for subsequent words in the list of words to search.
         * getWordWeights reset tehe tempList to an empty array, and then gets hists.
         * For all the hits, then search through retList for any with a matching file...
         * Set the .and value to 1, then delete all that have .and === 0.
         * @param w
         */
        const andWordIntoList = function(w) {
            console.log('ADDING AND WORD: ' + w);
            getWordWeights(w);
            let i;
            let len = tmpVal.length;
            for (i = 0; i < len; i++) {
                let retIndex = getRetValFileIndex(tmpVal[i].file);
                if (-1 !== retIndex) {
                    tmpVal[i].score = parseInt(retVal[retIndex].score) + parseInt(tmpVal[i].score);
                    tmpVal[i].and = 1;
                }
            }
            retVal = [];
            retVal.length = 0;
            for (i = 0; i < len; i++) {
                if (tmpVal[i].and === 1) {
                    tmpVal[i].and = 0; // Clear the flag
                    retVal.push(tmpVal[i]);
                }
            }
        };

        const getRetValFileIndex = function(s) {
            let retLen = retVal.length;
            for (let i = 0; i < retLen; i++) {
                if (retVal[i].file === s) {
                    return i;
                }
            }
            return -1;
        };

        const sortHits = function() {
            retVal.sort(function(obj1, obj2) {
                // Descending sort...
                return obj2.score - obj1.score;
            });
        };

        //
        // Client side must replicate stemming that was done to create search database.
        //
        const doStem = function(w) {
            let len = w.length;
            let sBuf = '';
            let code;
            for (let i = 0; i < len; i++) {
                code = w.charCodeAt(i);
                if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                    sBuf = sBuf + w.charAt(i);
                } else {
                    break;
                }
            }
            return stemmer(sBuf.toLowerCase());
        };

        return {
            setRootDocName: function(s) {
                rootDoc = s;
            },

            getRootDocName: function() {
                return rootDoc;
            },

            loadSearch: function(str) {
                sDat = JSON.parse(str);
                sDat.len = sDat.searchData.length;
            },

            doSearch: function(wordsStr, searchType) {
                _searchTermStr = wordsStr;
                _searchType = searchType;
                let s = wordsStr.replace(/^\s+|\s+$/g, '');
                if (undefined === s || '' === s) return undefined;
                words = s.split(' ');
                __searchType = searchType;

                if (_searchType === 'Or') {
                    getOrWeight();
                    mergeHits();
                } else if (_searchType === 'And') {
                    getAndWeight(words);
                }

                sortHits();
                return retVal;
            },

            undoHighlight: function() {
                let myHilightor = new Hilightor('result');
                myHilightor.remove();
                myHilightor = null;
            },

            doHighlight: function(s, passedElem) {
                let myHilightor = new Hilightor('result', passedElem);
                myHilightor.apply(stemStringOfWords(s));
                myHilightor = null;
            },
            setHighlightForUrl: function(params, passedElem) {
                if (params === undefined) {
                    return;
                }
                let highlightParam = params.showHighlight;
                if (highlightParam) {
                    this.doHighlight(_searchTermStr, passedElem);
                }
            },
        };
    },
]);
