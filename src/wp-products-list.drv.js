(function(){
	angular
		.module('gui.wp')
		.directive('wpProductsList', ['$guiWpProductsSvc', 
			function($guiWpProductsSvc){

			function fetchProducts() {
				return $guiWpProductsSvc.getList();
			}

			return {
				templateUrl: 'wp-products-list.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.data = [];

					function loadProducts() {
						fetchProducts()
							.then(function(res) {
								scope.data = res;
							});	
					}
					
					if(_.has(attrs, 'products') && !_.isEmpty(attrs.products)) {
						var data = scope.$eval(attrs.products);
						if(_.isArray(data) && data.length > 0) {
							scope.data = data;
						} else {
							loadProducts();
						}
					} else {
						loadProducts();
					}
					
				}

			}
		}]);
})();