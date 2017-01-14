(function(){
	angular
		.module('gui.wp')
		.directive('wpComments', ['$guiWpComments', function($guiWpComments){

			return {
				templateUrl: 'wp-comments.html',
				restrict: 'EAC',
				replace: true,
				link: function(scope, elem, attrs, ctrl) {
					scope.data = [],
					scope.req = {
						message: ''
					}

					scope.postId = scope.$eval(attrs.postId);
					scope.create = function() {
						$guiWpComments.post({
							post: scope.postId,
							content: scope.req.message
						})
						.then(function(res) {
							scope.req.message = '';
							scope.data.unshift(res);
						});
					}

					$guiWpComments.get({data: {post: scope.postId, _embed: 1}})
						.then(function(res){
							scope.data = res;
						});
					
				}
			}
		}]);
})();