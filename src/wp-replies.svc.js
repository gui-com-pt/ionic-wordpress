(function(){
	angular
		.module('gui.wp')
		.factory('$guiWpReplies', ['$guiWpApi', '$q', '$guiWpApiBuilder',
            function($guiWpApi, $q, $guiWpApiBuilder) {

            var api = new $guiWpApiBuilder('gui', 'v1');

            function getList(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/reply?filter[post_parent]=' + id, data: {'_embed': 1}}));
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/reply', data: {post: id, _embed: 1}}));
            }

            function post(data, options) {
                return api.post(data, $guiWpApi.parseOptions(options, {url: '/reply'}));
            }

            return {
                getList: getList,
                get: get,
                post: post
            }
        }]);
})();