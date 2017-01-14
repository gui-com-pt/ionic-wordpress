(function(){
    angular
        .module('gui.wp')
        .factory('$guiBpForums', ['$guiWpApi', '$q',
            function($guiWpApi, $q) {

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/forum', data: {'_embed': 1}});
                return $guiWpApi.get(req);
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/forum/' + id, data: {'_embed': 1}}));
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();