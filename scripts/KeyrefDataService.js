(function() {
    /**
     * TODO: Get these from a config file...
     * Ultimately need to set up all the 4D parameters through this service.
     */
    const MAP_FILE = 'maps/keyDefMap.xml';
    const MAP_TRANSFORM_FILE = 'xsl/keys.xsl';

    /**
     * Load the passed keyref map and XSL stylesheet, and create an object.
     * Set that object into the KeyrefProcessService.
     */
    class KeyrefDataService {
        constructor(
            $rootScope,
            $q,
            $location,
            $window,
            transformService,
            conrefService,
            keyrefProcessService
        ) {
            'ngInject';
            this._$window = $window;
            this._$location = $location;
            this._$rootScope = $rootScope;
            this._transformService = transformService;
            this._conrefService = conrefService;
            this._keyrefProcessService = keyrefProcessService;
            this._kDat = null;
            this._isInitialized = false;
            this._whenInitializedDefer = $q.defer();
        }

        /**
         * @return {boolean}
         */
        get isInitialized() {
            return this._isInitialized;
        }

        /**
         * @Type {Promise}
         */
        get whenInitialized() {
            return this._whenInitializedDefer.promise;
        }

        /**
         *
         * @param keyFile {string}
         * @param keyTransform {string}
         */
        loadKeys(keyFile, keyTransform) {
            //
            // This is the first thing that happens in the app.  And so, must set a
            // configured baseUrl if such a thing is there.
            //
            if (this._$window.conf && this._$window.conf.baseUrl) {
                console.log("BASE URL IS: "+this._$window.conf.baseUrl);
                this._transformService.setBaseUrl(this._$window.conf.baseUrl);
                this._conrefService.setBaseUrl(this._$window.conf.baseUrl);
            }
            
            console.log("TRYING TO TRANSFORM FILE: "+keyFile);
            console.log("USING TRANSFORM: "+keyTransform);
            this._transformService.transformFile(
                keyFile,
                keyTransform,
                this._keyDataCallback.bind(this),
                undefined,
                true,
                this._keyDataError.bind(this)
            );
        }

        /**
         * @param response {*}
         * @private
         */
        _keyDataCallback(response) {
            if (!response.resp) {
                console.error('KEY CALLBACK GOT UNDEFINED RESPONSE!');
                this._keyDataError('KEY CALLBACK GOT UNDEFINED RESPONSE!');
                return;
            }
            this._kDat = JSON.parse(response.resp);
            this._kDat.len = this._kDat.kDataArray.length;
            this._keyrefProcessService.setData(this._kDat);
            this._isInitialized = true;
            this._whenInitializedDefer.resolve(true);
        }

        _keyDataError(errStr) {
            if (errStr !== undefined) {
                console.error('KEY_DATA_INIT_ERROR: ' + errStr);
            } else {
                console.error('KEY_DATA_INIT_ERROR: undefined err string');
            }
            this._kDat = ['NO DATA'];
            this._kDat.len = 1;
            this._keyrefProcessService.setData(this._kDat);
            this._isInitialized = true;
            this._whenInitializedDefer.resolve(true);
        }

        static initialize(keyrefDataService) {
            if (!keyrefDataService.isInitialized) {
                keyrefDataService.loadKeys(MAP_FILE, MAP_TRANSFORM_FILE);
            }
        }
    }

    angular
        .module('vmturbo.doc.KeyrefDataService', [])
        .service('keyrefDataService', KeyrefDataService)
        .run(['keyrefDataService', KeyrefDataService.initialize]);
})();
