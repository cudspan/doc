const TopicCtrl = function(
    $scope,
    $rootScope,
    $sce,
    $window,
    $location,
    $q,
    transformService,
    tocService,
    docSearchService,
    conrefService,
    docUtils
) {
    let that = this;

    this.conf;
    this.topiccontent = '';
    this.helptitle = '';
    this.toccontent = '';
    this.pathAndParams;
    this.inUrl;

    /**
     * Initial load of window. Set default topic and build TOC and Search.
     * @param e
     */
    $window.onload = function(e) {
        //
        // For initial load of the window, get the default topic property and set that location.
        //
        if (that.conf) {
            if (that.conf.winStr) {
                $window.location = that.conf.winStr;
            }

            that.showDiv(that.conf.tocDiv);
            that.buildToc();
            that.loadSearch();
        }
    };

    /**
     * Catch a change to the browser location and highlight the TOC.
     * If no config in the browser, initialize based on the params in the URL.
     */
    $rootScope.$on('$locationChangeSuccess', function(event, inUrl) {
        let pathAndParams = docUtils.getPathAndParamsObj(inUrl);

        if (!pathAndParams) {
            console.error('Location change but no URL to parse.');
            return;
        }

        that.pathAndParams = pathAndParams;
        that.inUrl = inUrl;

        if (!that.conf) {
            that.initConfigs(pathAndParams, inUrl);
        } else {
            that.revealTopic(pathAndParams, inUrl);
        }
    });

    /**
     * Catch an event in the TOC.
     */
    $rootScope.$on('tocResponse', function(event, response) {
        $location.replace();
        $window.location = response.data;
    });

    /**
     * Display the current topic, highight the TOC (via xref or history - enables
     * other functions to see the current selection) and scroll to the hash ID in
     * the topic.
     */
    this.revealTopic = function() {
        let pathAndParams = that.pathAndParams;
        let inUrl = that.inUrl;
        if (!that.conf) {
            console.warn('REVEAL TOPIC CALLED, but conf not initialized yet:\n' + inUrl);
            return;
        }
        // Hack needed here because sometimes we need the default topic ID...  It's not set when
        // we create the pathAndParams object.  So...  If there's no hash param, must assume
        // the default, according to config.
        if (pathAndParams && !pathAndParams.hashPObj && that.conf) {
            pathAndParams = docUtils.setHashParamsForParamObj(
                pathAndParams,
                'MAPPED&' + that.conf.defaultMappedTopic
            );
            that.pathAndParams = pathAndParams;
        }

        that.showTopicFromUrl(inUrl, pathAndParams.hashPObj);

        if (that.conf && that.conf.tocUrl) {
            tocService.highlightNodeForDefaultTopic(that.conf.tocUrl);
        } else {
            tocService.highlightNodeForDefaultTopic(pathAndParams.urlBase);
        }

        that.scrollToHash(inUrl);
    };
    /**
     * Load the configuration files and then display the current topic.
     * @param pathAndParams
     * @param inUrl
     */
    this.initConfigs = function(pathAndParams, inUrl) {
        let fileName = '';

        if (pathAndParams.qPObj && pathAndParams.qPObj.config) {
            fileName = pathAndParams.qPObj.config;
        } else {
            fileName = docUtils.getFnameOnly(pathAndParams.urlBase, 'json');
        }

        let theUrl = pathAndParams.pathOnly + fileName;

        const initConfAndGetMap = function(response) {
            that.conf = response.data;
            that.conf.hashParams = pathAndParams.hashParams;
            return transformService.getRawFile(pathAndParams.pathOnly + that.conf.topicMap);
        };

        const initMap = function(response) {
            docUtils.topicMap.initTopicMap(response.data);
            that.finalizeConfObj();
            return response;
        };

        transformService
            .getRawFile(theUrl)
            .then(initConfAndGetMap)
            .then(initMap)
            .then(that.revealTopic);
    };
    /**
     * Finalize the config data by getting the mapped default topic and setting to 'win location if necessary.
     */
    this.finalizeConfObj = function() {
        if (that.conf) {
            // Set the title in the banner...
            that.helptitle = $sce.trustAsHtml(that.conf.helptitle);
            // complete the config data...
            that.conf.defaultTopic = docUtils.topicMap.getMapEntry(
                that.conf.defaultMappedTopic
            ).topic;

            if (-1 === window.location.toString().indexOf('#')) {
                that.conf.winStr =
                    $window.location + '#!MAPPED&' + that.conf.defaultMappedTopic + '&showToc=1';
            } else {
                that.conf.winStr = $window.location;
            }

            $window.location = that.conf.winStr;
            that.showDiv(that.conf.tocDiv);
            that.buildToc();
            that.loadSearch();
        }
    };

    /**
     * Scroll the topic view to the correct position.
     * @param inUrl
     */
    this.scrollToHash = function(inUrl) {
        // Use timeout to give the topic enough time to exist.
        setTimeout(function() {
            let scrollTo = $window.document.getElementById(that.conf.topicDiv);
            if (scrollTo) {
                // Check for an ID to scroll to.  Get the last tok in path of IDs.
                // For example... index.html#!/_tasks/create_chart.xml#create_chart_1%2FchartSettings
                let retArray = inUrl.split('#');
                if (3 === retArray.length) {
                    let subToks = retArray[2].split('%2F');
                    if (subToks[subToks.length - 1]) {
                        scrollTo = $window.document.getElementById(subToks[subToks.length - 1]);
                    }
                }
                if (scrollTo) {
                    scrollTo.scrollIntoView(true);
                } else {
                    console.error('4D Help xref failed to scroll to ID.');
                }
            }
        }, 200);
    };

    /**
     * Show the passed DIV -- For tabs in the GUI.
     * First hide all the divs, then show the one you want.
     * @param divName
     */
    this.showDiv = function(divName) {
        let divs = that.conf.divsToTab;
        let i;

        for (i = 0; i < divs.length; i++) {
            jQuery('#' + divs[i]).css('display', 'none');
        }

        jQuery('#' + divName).css('display', 'block');
    };

    this.expandToc = function() {
        tocService.expandAll();
    };

    this.collapseToc = function() {
        tocService.collapseAll();
    };

    this.goBack = function() {
        history.back();
    };

    this.goForward = function() {
        history.forward();
    };

    /**
     * Load the search data into a JS object.
     */
    this.loadSearch = function() {
        let deferred = $q.defer();

        let searchCallback = function(response) {
            docSearchService.loadSearch(response.resp);
            docSearchService.setRootDocName(that.conf.baseUrl);
        };

        let errorCallback = function(response) {
            console.error('ERROR TRANSFORMING SEARCH!!!\n' + response.resp.data);
            deferred.reject('FAILURE');
        };

        transformService.transformFile(
            that.conf.searchFile,
            that.conf.searchTransform,
            searchCallback,
            undefined,
            true,
            errorCallback
        );

        deferred.resolve('SUCCESS');
        return deferred.promise;
    };

    /**
     * Transform the passed DITA map, then call the toc service to init and then
     * populate a toc.
     */
    this.buildToc = function() {
        let deferred = $q.defer();

        let tocCallback = function(response) {
            tocService.initToc(jQuery('#' + that.conf.tocTreeContainerDiv));
            tocService.buildMainToc(response.resp);
            jQuery('#' + that.conf.tocTreeContainerDiv)[0].setAttribute('style', 'display:block;');
        };

        let errorCallback = function(response) {
            console.error('ERROR TRANSFORMING TOC!!!\n' + response.resp.data);
            deferred.reject('FAILURE');
        };

        transformService.transformFile(
            that.conf.defaultMap,
            that.conf.mapTransform,
            tocCallback,
            that.conf.transform_params,
            true,
            errorCallback
        );

        deferred.resolve('SUCESS');
        return deferred.promise;
    };

    /**
     * Use the url to show the topic
     * @param inUrl
     * @param pObj
     */
    //
    // TO DO: Fix relative URLs in the Location Change handler, and reset the location
    // to the corrected path... Use $location.replace() for that cycle.
    //
    this.showTopicFromUrl = function(inUrl, pObj) {
        if (!inUrl) {
            return;
        }

        let topicPath = '';
        let toks = inUrl.split('#');

        if (!toks[1]) {
            console.warn('No topic to show for this URL: ' + inUrl);
            topicPath = pObj.hashParams;
            return;
        } else {
            topicPath = toks[1];
        }

        //
        // Strip out the /! that might be left in the url path...
        //
        if ('/' === topicPath.charAt(0)) {
            topicPath = topicPath.substr(1);
        }

        if ('!' === topicPath.charAt(0)) {
            topicPath = topicPath.substr(1);
        }

        if (topicPath.substring(0, 7) === '/MAPPED') {
            // Look up in the list of mapped topics.
            toks = topicPath.split('&');

            if (docUtils.topicMap.map) {
                topicPath = docUtils.topicMap.getMapEntry(toks[1]).topic;
                that.populateTopicContent(topicPath, that.conf.topicTransform, pObj);
            } else {
                console.warn('topic map not initialized yet: ' + topicPath);
            }
        } else {
            that.populateTopicContent(topicPath, that.conf.topicTransform, pObj);
        }
    };

    /**
     * Cache the url that serves as a key into the TOC.
     * @param url
     */
    this.setTocUrl = function(url) {
        if (!url) {
            return;
        }

        let toks = url.split('../');

        if (!toks || !toks.length) {
            return;
        }

        if (toks.length > 1) {
            that.conf.tocUrl = '../' + toks[1];
        } else {
            that.conf.tocUrl = '..' + url;
        }

        tocService.highlightNodeForDefaultTopic(that.conf.tocUrl);
    };

    /**
     * Show a topic. If pObj, then this was a search for the words sent in pObj.
     * @param xmlFilePath
     * @param xslFilePath
     * @param pObj
     */
    this.populateTopicContent = function(xmlFilePath, xslFilePath, pObj) {
        that.setTocUrl(xmlFilePath);

        const topicCallback = function(response) {
            if (pObj) {
                let myElem = document.createElement('div');
                myElem.innerHTML = response.resp;
                docSearchService.setHighlightForUrl(pObj, myElem);
                that.topiccontent = $sce.trustAsHtml(myElem.innerHTML);
            } else {
                that.topiccontent = $sce.trustAsHtml(response.resp);
            }
        };

        const errorCallback = function(response) {
            console.error('populateTopicContent: ERROR TRANSFORMING FILE!!!\n' + response);
            console.error('XML FILE PATH: ' + xmlFilePath);
            console.error('XSL FILE PATH ' + xslFilePath);
        };

        transformService.transformFile(
            xmlFilePath,
            xslFilePath,
            topicCallback,
            that.conf.transform_params,
            false,
            errorCallback
        );
    };
};

angular.module('vmturbo.doc').controller('TopicCtrl', TopicCtrl);
