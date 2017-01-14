(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpOrders', ['$guiWpWcApi', '$guiWpApi',
            function($guiWpWcApi, $guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/orders', data: {}});
                return $guiWpWcApi.get(req);
            }

            function get(id, options) {
                return $guiWpWcApi.get($guiWpApi.parseOptions(options, {url: '/orders/' + id, data: {'_embed': 1}}));
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();