(function(){
	angular
		.module('gui.wp')
		.provider('$guiWp', [function(){

			var cfg = {};

			function getOrSetConfig(key,val) {
				if(!val) {
					return cfg[key];
				}

				cfg[key] = val;
			}

			return {
				config: getOrSetConfig,
				apiUrl: function(val) {
					getOrSetConfig('apiUrl', val);
				},
				$get: ['$log', function($log) {

					return {
						config: getOrSetConfig
					}
				}]
			}
		}]);
})();