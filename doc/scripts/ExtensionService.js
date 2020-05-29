/**
 * A dictionary of JS functions that can be called when resolving references in
 * HTML.  The function results expand into the content.
 */

angular.module('vmturbo.doc.extensionService', []).factory('extensionService', [
    'tocService',
    function(tocService) {
        return {
            utcConverter: function() {
                let str =
                    'UTC time in ms: <input type="button" value="Calculate" onclick="vmtHelpCustom.doUTC(this.parentNode)" /> ';
                str +=
                    'dd:<input name="dd" size="1"/> mm:<input name="mm" size="1"/> yyyy:<input name="yyyy" size="2"/> ';
                return str;
            },

            buildRefList: function(s) {
                if (!tocService.getIsTocBuilt()) {
                    // Called buildRefList before TOC is built -- Cannot build list.
                    return;
                }
                let str = '';

                if (s) {
                    str = str + '<p><b>' + s.replace(/%20/g, ' ') + ':</b></p>';
                }
                let toks = window.location.href.split('#');
                let children = tocService.getChildrenOfCurrentNode();
                if (!children || !children.length) {
                    // NO TOC CHILDREN!!!
                    return;
                }
                str = str + '<ul>';
                for (let i = 0; i < children.length; i++) {
                    str =
                        str +
                        '<li><a href=' +
                        toks[0] +
                        '#!/' +
                        children[i].key +
                        '>' +
                        children[i].title +
                        '</a></li>';
                }
                str = str + '</ul>';
                return str;
            },
        };
    },
]);
