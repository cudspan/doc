/**
 * Init the TOC, then read the passed data to populate it.
 * Support calls to get tree nodes, expand/collapse, and highlight.
 */
angular.module('vmturbo.doc.tocService', []).factory('tocService', [
    '$window',
    '$rootScope',
    function($window, $rootScope) {
        let _tocTree, _currentNode;
        let _tocIsBuilt = false;

        return {
            getIsTocBuilt: function() {
                return _tocIsBuilt;
            },

            getCurrentNode: function() {
                return _currentNode;
            },

            getCurrentNodeKey: function() {
                if (!_currentNode) {
                    return;
                }
                return _currentNode.key;
            },

            /**
             * Create an empty TOC tree in the passed div.
             * @param div
             */
            initToc: function(div) {
                const tocResponse = function(node) {
                    _currentNode = node;
                    node.setExpanded();
                    $rootScope.$broadcast('tocResponse', {
                        data: '#!' + node.key.replace('../', ''), // Strip leading ../
                    });
                };

                const activatedItem = function(event, data) {
                    if (!data) {
                        console.error('UNDEFINED DATA TO HANDLE TOC EVENT!');
                    } else {
                        _currentNode = data.node;
                        tocResponse(data.node);
                    }
                };

                div.fancytree(
                    { source: [] }, // Make an empty tree...
                    { activate: activatedItem },
                    { minExpandLevel: 1 },
                    { icons: false }
                );
                _tocTree = div.fancytree('getTree');
            },
            /**
             * The passed string is a transform of the DITA map. Use this to
             * populate the TOC.
             * @param cleanedStr
             */
            buildMainToc: function(cleanedStr) {
                let i;
                let rootNode = _tocTree.getRootNode();
                let rootKey = rootNode.key;
                _currentNode = rootNode;

                let theKey = '';
                let theNode;
                let itemsList = cleanedStr.split('|');
                let item = [];
                for (i = 0; i < itemsList.length; i++) {
                    item = itemsList[i].split('+');
                    if (item.length === 3) {
                        if (item[1] === 'root') {
                            theKey = rootKey;
                        } else {
                            theKey = item[1];
                        }
                        theNode = _tocTree.getNodeByKey(theKey);
                        theNode.addChildren({
                            title: item[2],
                            tooltip: item[2],
                            key: item[0],
                            isFolder: true,
                        });
                    }
                }
                _tocIsBuilt = true;
            },

            getChildrenOfNodeByKey: function(keyStr) {
                let keyNode = _tocTree.getNodeByKey(keyStr);
                if (!keyNode) {
                    return;
                }
                return keyNode.getChildren();
            },

            getChildrenOfCurrentNode: function() {
                if (!_currentNode) {
                    return;
                }
                return _currentNode.getChildren();
            },

            getTocNodeByKey: function(keyStr) {
                return _tocTree.getNodeByKey(keyStr);
            },

            expandAll: function() {
                _tocTree.getRootNode().visit(function(node) {
                    node.setExpanded(true);
                });
            },

            collapseAll: function() {
                _tocTree.getRootNode().visit(function(node) {
                    node.setExpanded(false);
                });
            },

            highlightNodeForDefaultTopic: function(url) {
                if (!_tocTree) {
                    console.warn(
                        'highlightNodeForDefaultTopic has undefined tocTree -- could be initial topic: ' +
                            url
                    );
                    return;
                }
                // First clear current selection
                _tocTree.getRootNode().visit(function(node) {
                    node.setActive(false);
                    node.setSelected(false);
                });
                let node = _tocTree.getNodeByKey(url);

                // Now select the current one
                if (node) {
                    node.makeVisible();
                    node.setSelected();
                    node.setExpanded(true);
                    node.scrollIntoView();
                    _currentNode = node;
                }
            },
        };
    },
]);
