(function(){
	angular
		.module('gui.wp')
		.directive('wpReplies', ['$guiWpReplies', function($guiWpReplies){

			return {
				templateUrl: 'wp-replies.html',
				restrict: 'EAC',
				replace: true,
				link: function(scope, elem, attrs, ctrl) {
					scope.data = [],
					scope.req = {
						message: ''
					}

					scope.postId = scope.$eval(attrs.postId);
					scope.create = function() {
						$guiWpReplies.post({
							topic_id: scope.postId,
							content: scope.req.message
						})
						.then(function(res) {
							scope.req.message = '';
							scope.data.unshift(res);
						});
					}

					$guiWpReplies.get(scope.postId, {data: {post: scope.postId, _embed: 1}})
						.then(function(res){
							scope.data = res;
						});
					
				}
			}
		}]);
})();