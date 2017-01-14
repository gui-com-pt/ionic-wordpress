(function(){
	angular
		.module('gui.wp')
		.controller('guiWpTopicCreateCtrl', ['$scope', '$guiBpTopics', '$state', '$stateParams',
			function($scope, $guiBpTopics, $state, $stateParams) {
				var vm = this;

				this.createTopic = function() {
					$guiBpTopics.post({
						title: vm.title,
						content: vm.content,
						forum_id: $stateParams.forumId
					})
					.then(function(res) {
						$state.go('topic-view', {
							id: res.id
						});
					}, function(res) {

					});
				}
			}]);
})();