(function(){
	angular
		.module('gui.wp')
		.service('$guiWpWcApi', ['$q', 'makeu', '$http', '$log', 'httpOfflineCache',
            function($q, makeu, $http, $log, httpOfflineCache){

            var wc = null;
            var api = '/wp-json/wc/v1';

            function get(options){
                return callApi(options.url, 'GET', options.data);
            }

            var callApi = function(url, method, data) {
                var req = { 
                    method: method, 
                    url: makeu.apiUrl() + api + url, 
                    cache: true
                };

                switch(method) {
                    case 'GET':
                        req.params = data;
                        return httpOfflineCache.get(req.url, req);
                        break;
                    case 'POST':
                    case 'PUT':
                    case 'DELETE':
                        req.data = data;
                        break;
                    default:
                        throw 'Method not supported: ' + method;
                }

                return $http(req)
                    .then(function(response) {
                        if (response.data instanceof Array) {
                            var c = 0;
                            var items = response.data.map(function(item) {
                                c++;
                                var item = decorateResult(item);
                                if(c === 3) {
                                    item.featured = true;
                                    c = 0;
                                }
                                return item;
                            });
                            return items;
                        } else {
                            return decorateResult(response.data);
                        }
                    });

            }
            
            function dcallCapi(url) {

                var def = $q.defer();
                var url = makeu.apiUrl() + api + url;
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
                        consumerKey: 'ck_928561878145aa70e28b8dceaaa398d83859a3e6',
                        consumerSecret: 'cs_8d31b7243fc0070fb2eec7da349c30d671612441',
                        queryStringAuth: true
                    });
                }
                return wc;
            }
        
                
            return {
                get: get
        }}]);
})();