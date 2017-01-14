(function(){
	angular
		.module('gui.wp')
		.directive('wpBlogPost', function(){
			return {
				templateUrl: 'wp-blog-post.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.post = scope.$eval(attrs.post);
				}
			}
		});
})();