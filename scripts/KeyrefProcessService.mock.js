angular
    .module('vmturbo.doc.keyrefProcessService.mock', ['vmturbo.doc.keyrefProcessService'])
    .config(function($provide) {
        $provide.decorator('keyrefProcessService', function($delegate) {
            $delegate.setData({
                transform_params: { dv_attr: 'mock_dv_attr', dv_vals: 'mock_dv_vals' },
            });
            return $delegate;
        });
    });
