(function(){
	angular
		.module('gui.wp')
		.service('$guiWcApi', function($q){
			var wc = null;

			function get(url){
				return callCapi(url);
			}
			
			function callCapi(url) {
				var def = $q.defer();
                getWc().get(url, function(err, data, res) {

                	var data = JSON.parse(data.body);

                	if (data instanceof Array) {
                        var c = 0;
                        var items = data.map(function(item) {
                            c++;
                            var item = decorateResult(item);
                            if(c === 3) {
                                item.featured = true;
                            }
                            return item;
                        });
                        def.resolve(items);
                    }
                    else  {
                        def.resolve(decorateResult(data));
                    }
                });
                return def.promise;
			}

			function decorateResult(result) {
				if(_.isEmpty(result['price']) && !_.isEmpty(result['regular_price'])) {
					result['price_str'] = result.regular_price;
				} else if(!_.isEmpty(result['price'])) {
					result['price_str'] = result.price;
				}

				if(_.isArray(result['images']) && result['images'].length > 0) {
					result['featured_src'] = result['images'][0]['src'];
				}
				return result;
			}

			function getWc() {
	            if(_.isNull(wc)) {
	            	wc = new WooCommerceAPI.WooCommerceAPI({
		                url: 'https://makeu.pt/',
		                queryStringAuth: true
		            });
	            }
	            return wc;
	        }
		
                
		    return {
		        WC: getWc,
		        get: get
		}});
})();