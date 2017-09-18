(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpProductsSvc', ['$guiWpWcApi', '$guiWpApi',
            function($guiWpWcApi, $guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/products', data: {}});
                return $guiWpWcApi.get(req);
            }

            function get(id, options) {
                return $guiWpWcApi.get($guiWpApi.parseOptions(options, {url: '/products/' + id, data: {'_embed': 1}}));
            }

            function post(data, options) {
                return $guiWpApi.post(data, $guiWpApi.parseOptions(options, {url: '/products/',}));
            }

            return {
                getList: getList,
                get: get,
                post: post
            };
        }]);
})();