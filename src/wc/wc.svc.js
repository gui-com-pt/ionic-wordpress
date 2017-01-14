(function(){
	angular
		.module('gui.wp')
		.provider('$guiWc', function(){

            var configs = {};
            function set(key, value) {
                configs[key] = value;
            }

            function get(key) {
                return configs[key];
            }

            return {
                url: function(url) {
                    set('url', url);
                },
                appName: function(name) {
                    set('app_name', name);
                },
                returnUrl: function(url) {
                    set('return_url', url);
                },
                scope: function(scope) {
                    set('scope', scope);
                },
                callbackUrl: function(url) {
                    set('callback_url', url);
                },
                userId: function(id) {
                    set('user_id', id);
                },
                $get: ['$log', function($log) {

                    return {
                        get: get
                    }

                }]
            }
        })
})();