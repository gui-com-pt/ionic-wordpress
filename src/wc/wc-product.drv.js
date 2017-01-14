(function(){
	angular
		.module('gui.wp')
		.directive('wpWcProduct', function(){
			return {
				templateUrl: 'wp-wc-product.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.product = scope.$eval(attrs.product);
				}
			}
		});
})();