/**
 * Created by kalel on 10/25/16.
 */

(function() {
    angular
        .module('vmturbo.doc')
        .directive('searchDirective', function(docSearchService, tocService) {
            return {
                restrict: 'EA',
                templateUrl: 'templates/doc.search.html',
                scope: {
                    highlightclass: '@',
                    highlightsrc: '@',
                    andorclass: '@',
                    andorsrc: '@',
                    searchterm: '@',
                    searchobj: '=',
                },
                controller: function($scope, $sce, $attrs) {
                    $scope.highlightsrc = './_graphics/icons/highlightDone.png';
                    $scope.highlightclass = 'highlightButtonOn';
                    $scope.andorclass = 'And';
                    $scope.andorsrc = './_graphics/icons/find_and.png';
                    $scope.searchterm = '';

                    $scope.searchobj = {};

                    let obj = $scope.searchobj;

                    let spec = {};
                    spec.terms = 'open';
                    spec.searchType = 'And';

                    let haveMatch = false;

                    let vmtLiStart =
                        '<li class="SearchList"><a href = "' +
                        docSearchService.getRootDocName() +
                        '#!';
                    let vmtLiStartHttp = '<li class="SearchList"><a href = "#!';
                    let vmtLiEnd = '</a></li>';

                    $scope.setAndOr = function(event) {
                        event.preventDefault();

                        if ($scope.andorclass === 'Or') {
                            $scope.andorclass = 'And';
                            $scope.andorsrc = './_graphics/icons/find_and.png';
                        } else if ($scope.andorclass === 'And') {
                            $scope.andorclass = 'Or';
                            $scope.andorsrc = './_graphics/icons/find_or.png';
                        } else {
                            $scope.andorclass = 'And';
                            $scope.andorsrc = './_graphics/icons/find_and.png';
                        }

                        let boolButton = document.getElementById('andOrButton');
                    };

                    $scope.doHighlight = function(event) {
                        event.preventDefault();

                        if ($scope.highlightclass === 'highlightButtonOn') {
                            $scope.highlightclass = 'highlightButtonOff';
                            $scope.highlightsrc = './_graphics/icons/highlightToDo.png';
                            docSearchService.undoHighlight();
                        } else if ($scope.highlightclass === 'highlightButtonOff') {
                            $scope.highlightclass = 'highlightButtonOn';
                            $scope.highlightsrc = './_graphics/icons/highlightDone.png';
                            docSearchService.doHighlight($scope.searchterm);
                        }
                    };

                    $scope.callSearch = function(event) {
                        event.preventDefault();

                        spec.terms = $scope.searchterm;

                        let x = docSearchService.doSearch(spec.terms, spec.searchType);
                        let len = x.length;

                        let out = '';
                        if (undefined === len || len < 1) {
                            console.log('Search lengeth is zero');
                            out = '<i>No matches found for</i> "' + spec.terms + '".';
                        } else {
                            out = '<ul>';
                            for (let i = 0; i < len; i++) {
                                let node = tocService.getTocNodeByKey(
                                    docSearchService.getRootDocName() + '/' + x[i].file
                                );
                                if (null !== node) {
                                    // Map to role-based TOC...
                                    if (x[i].file.substr(0, 4) === 'http') {
                                        out =
                                            out +
                                            vmtLiStartHttp +
                                            x[i].file +
                                            '?showHighlight=true">' +
                                            x[i].name +
                                            vmtLiEnd;
                                    } else {
                                        out =
                                            out +
                                            vmtLiStart +
                                            docSearchService.getRootDocName() +
                                            '/' +
                                            x[i].file +
                                            '?showHighlight=true">' +
                                            x[i].name +
                                            vmtLiEnd;
                                    }
                                    haveMatch = true;
                                }
                            }
                            out = out + '</ul>';
                            if (false == haveMatch) {
                                console.log('Search got zero matching nodes from TOC');
                                out = '<i>No matches found for</i> "' + spec.terms + '".';
                            }
                        }
                        obj.content = $sce.trustAsHtml(out);
                    };
                },
            };
        });
}.call(this));
