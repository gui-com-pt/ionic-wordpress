(function(){
	angular
		.module('gui.wp')
		.directive('wpTopic', function(){
			return {
				templateUrl: 'wp-topic.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.topic = scope.$eval(attrs.topic);
				}
			}
		});
})();