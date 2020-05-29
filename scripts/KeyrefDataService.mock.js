angular
    .module('vmturbo.doc.KeyrefDataService.mock', ['vmturbo.doc.KeyrefDataService'])
    .config(function($provide) {
        $provide.decorator('keyrefDataService', function($delegate) {
            $delegate._isInitialized = true;
            $delegate._whenInitializedDefer.resolve(true);
            return $delegate;
        });
    });
