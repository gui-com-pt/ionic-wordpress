
(function(){
	angular
		.module('gui.wp')
		.directive('wpOrder', function(){
			return {
				templateUrl: 'wp-order.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.order = scope.$eval(attrs.order);
				}
			}
		});
})();