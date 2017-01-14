angular
	.module('wp.test', ['gui.wp']);

angular
	.module('wp.test')
	.factory('$guiTestUtil', ['$guiWp',
		function(guiWp){
			
			return {
				apiUrl: function() {
					return guiWp.apiUrl();
				}
			}
		}]);
