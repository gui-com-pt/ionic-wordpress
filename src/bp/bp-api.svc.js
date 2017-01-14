(function(){
	angular
		.module('gui.wp')
		.service('$guiBpApi', function($q, makeu, $http, $sce){
			var wc = null;

			var api = '/wp-json/wp/v2';

			function get(url, data){
				return callCapi(url, 'GET', data);
			}
			
			function callCapi(url, method, data) {
				var def = $q.defer();
				var req = { 
                    method: method, 
                    url: makeu.apiUrl() + api + url, 
                    cache: true
                };

                switch(method) {
                    case 'GET':
                        req.params = data;
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
			

			function decorateResult(result) {
				var properties = ['excerpt', 'content'];
                    
                    for (var i = 0; i < properties.length; i++) {
                        if(result.hasOwnProperty(properties[i])) {
                            result[properties[i]] = $sce.trustAsHtml(result[properties[i]].rendered);
                        }
                    }

                    properties = ['title', 'guid'];
                    for (var i = 0; i < properties.length; i++) {
                        if(result.hasOwnProperty(properties[i])) {
                            result[properties[i]] = result[properties[i]].rendered;
                        }
                    }

                    properties = ['date'];
                    for (var i = 0; i < properties.length; i++) {
                        if(result.hasOwnProperty(properties[i])) {
                            result[properties[i]] = Date.parse(result[properties[i]]);
                        }
                    }

                    if(result.hasOwnProperty('_embedded')) {
                        if(result._embedded.hasOwnProperty('wp:featuredmedia')) {
                            result.featured_image = result._embedded['wp:featuredmedia'][0].source_url;    
                        }
                        
                        if(result._embedded.hasOwnProperty('wp:term')) {
                            result.category = result._embedded['wp:term'][0][0].name;
                            result.category_id = result._embedded['wp:term'][0][0].id;

                        }

                        if(result._embedded.hasOwnProperty('author')) {
                            result.author_name = result._embedded.author[0].name;
                            result.author_href = result._embedded.author[0].link;
                        }

                        result.embed = true;
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
		        WC: getWc,
		        get: get
		}});
})();