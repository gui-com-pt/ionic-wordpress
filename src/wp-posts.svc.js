(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpPosts', ['$guiWpApi',
            function($guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/posts', data: {'_embed': 1}});
                return $guiWpApi.get(req);
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/posts/' + id, data: {'_embed': 1}}));
                //return $guiWpApi.get('/posts/' + id + '?_embed');
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();