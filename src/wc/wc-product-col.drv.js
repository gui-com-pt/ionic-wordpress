(function(){
	angular
		.module('gui.wp')		
		.directive('wcProductCol', function(){
			return {
				templateUrl: 'wc-product-col.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.product = scope.$eval(attrs.product);
				}
			}
		})
})();