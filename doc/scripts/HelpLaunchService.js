(function() {
    class HelpLaunchService {
        constructor($rootScope, $window, transformService) {
            'ngInject';
            this._$window = $window;
            this._$rootScope = $rootScope;
            this._transformService = transformService;
            this._winCache = [];
        }

        /**
         * If a window closes, then the cache entry will not have a name.
         * Must remove entries with no name.
         */
        cleanCache() {
            let ar = [];
            let i;
            let name;
            for (i = 0; i < this._winCache.length; i++) {
                name = '';
                // Do this in TRY to handle MS Edge...  Gives error if the window is not there.
                try {
                    name = this._winCache[i].name;
                } catch (err) {
                    name = '';
                }
                if (name) {
                    ar.push(this._winCache[i]);
                }
            }
            this._winCache = ar;
        }

        /**
         * Get an iten from the win cache that matches the passed name.
         * Clean the cache first...
         * @param n
         * @returns {*}
         */
        haveWindowOfName(n) {
            let i;
            this.cleanCache();
            for (i = 0; i < this._winCache.length; i++) {
                if (this._winCache[i].name === n) {
                    return this._winCache[i];
                }
            }
        }

        /**
         * First check to see if the help window is already open. If yes, just show it.
         * Otherwise, spawn a new window, with the passed in doc url.
         * @param doc
         * @param name
         */
        helpStart(doc, name) {
            let myWin = this.haveWindowOfName(name);
            if (myWin) {
                myWin.focus();
                return;
            }

            let url = this._transformService.getBaseUrl() + doc;

            let i;
            let w = 1000;
            let h = 600;
            let qStr = url.split('?');
            if (qStr.length !== 2) {
                qStr = url.split('#');
            }
            if (qStr.length === 2) {
                let param_list = {};
                let params = qStr[1].split('&');
                for (i = 0; i < params.length; i++) {
                    param_item = params[i].split('=');
                    param_list[param_item[0]] = param_item[1];
                }
                if (typeof param_list.width !== 'undefined') {
                    w = param_list.width;
                }
                if (typeof param_list.height !== 'undefined') {
                    h = param_list.height;
                }
            }
            let winParams = 'menubar=0,width=' + w + ',height=' + h;
            let helpWin = this._$window.open(url, name, winParams);
            this._winCache.push(helpWin);
            helpWin.focus();
        }
    }

    angular
        .module('vmturbo.doc.helpLaunchService', [])
        .service('helpLaunchService', HelpLaunchService);
})();
