(function(){
	angular
		.module('gui.wp')
		.factory('$guiBpTopics', ['$guiWpApi', '$q', '$guiWpApiBuilder',
            function($guiWpApi, $q, $guiWpApiBuilder) {

            var api = new $guiWpApiBuilder('gui', 'v1');

            function getList(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/topic?filter[post_parent]=' + id, data: {'_embed': 1}}));
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/topic/' + id, data: {_embed: 1}}));
            }

            function post(data, options) {
                return api.post(data, $guiWpApi.parseOptions(options, {url: '/topic'}));
            }

            return {
                getList: getList,
                get: get,
                post: post
            }
        }]);
})();