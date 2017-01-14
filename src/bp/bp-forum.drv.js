(function(){
	angular
		.module('gui.wp')
		.directive('wpForum', function(){
			return {
				templateUrl: 'wp-forum.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.forum = scope.$eval(attrs.forum);
				}
			}
		});
})();