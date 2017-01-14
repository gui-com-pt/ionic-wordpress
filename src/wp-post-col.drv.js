(function(){
	angular
		.module('gui.wp')
		.directive('wpPostCol', function(){
			return {
				templateUrl: 'wp-post-col.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.post = scope.$eval(attrs.post);
				}
			}
		});
})();