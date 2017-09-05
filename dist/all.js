(function(){
	angular
		.module('gui.wp', [])
		.config(['$guiWpProvider', function(guiWpProvider) {

		}])
})();
(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpApiBuilder', ['$http', '$sce', 'makeu', '$log',
            function($http, $sce, makeu, $log) {

                return function(vendor, version) {

                    var api = '/wp-json/' + vendor + '/' + version;

                    function setAuthorization(auth) {
                        
                    }

                    /**
                     * Call Wordpress Rest API
                     * @param  {string} url    endpoint
                     * @param  {string} method HTTP Method
                     * @return {array|object}        array results or single object
                     */
                    var callApi = function(url, method, data) {
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

                    /**
                     * Decorate a post to make it play nice with AngularJS
                     * @param result
                     * @returns {*}
                     */
                    function decorateResult(result) {
                        var properties = ['excerpt', 'content'];
                        
                        for (var i = 0; i < properties.length; i++) {
                            if(result.hasOwnProperty(properties[i]) && result[properties[i]].hasOwnProperty('rendered')) {
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

                    this.get = function(options) {
                        return callApi(options.url, 'GET', options.data);
                    }

                    this.post = function(data, options) {
                        return callApi(options.url, 'POST', data);
                    }

                    this.put = function(url, data) {
                        return callApi(url, 'PUT', data);
                    }

                    this.parseOptions = function(options, defaults) {
                        if(typeof(options) !== 'object') {
                            return defaults;
                        }

                        angular.forEach(defaults, function(val, key) {
                            if(options.hasOwnProperty(key)) {
                                defaults[key] = options[key];
                            }
                        });

                        return defaults;
                    }
                }
            }]);
})();
(function(){
	angular
		.module('gui.wp')
		.service('$guiWpWcApi', ['$q', 'makeu', '$http', '$log',
            function($q, makeu, $http, $log){

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
(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpApi', ['$http', '$sce', 'makeu', '$log',
            function($http, $sce, makeu, $log) {

                var api = '/wp-json/wp/v2';

                function setAuthorization(auth) {
                    
                }

                /**
                 * Call Wordpress Rest API
                 * @param  {string} url    endpoint
                 * @param  {string} method HTTP Method
                 * @return {array|object}        array results or single object
                 */
                var callApi = function(url, method, data) {
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

                /**
                 * Decorate a post to make it play nice with AngularJS
                 * @param result
                 * @returns {*}
                 */
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

                    if(result.hasOwnProperty('parent')) {
                        result.parent = decorateResult(result.parent);
                    }
                    
                    return result;
                }

                function parseOptions(options, defaults) {
                    if(typeof(options) !== 'object') {
                        return defaults;
                    }

                    angular.forEach(defaults, function(val, key) {
                        if(options.hasOwnProperty(key)) {
                            defaults[key] = options[key];
                        }
                    });

                    return defaults;
                }

                return {
                    parseOptions: parseOptions,
                    get: function(options) {
                        return callApi(options.url, 'GET', options.data);
                    },
                    post: function(data, options) {
                        return callApi(options.url, 'POST', data);
                    },
                    put: function(url, data) {
                        return callApi(url, 'PUT', data);
                    },
                    delete: function(url, data) {
                        return callApi(url, 'DELETE', data);
                    },
                    setAuthorization: setAuthorization,
                    apiBase: function() {
                        return api;
                    }
                }
            }]);
})();
(function(){
	angular
		.module('gui.wp')		    
        .factory('$guiWpAuth', ['$log', '$rootScope', '$guiWpApi', 'base64', 'localStorageService', '$q', '$http', 'makeu',
            function($log, $rootScope, $guiWpApi, base64, localStorageService, $q, $http, makeu) {
                var auth;

                function setAuthorization(auth, username, rememberMe) {
                    var defer = $q.defer();
                    $http.get(makeu.apiUrl() + '/wp-json/wp/v2/comments')
                        .then(function(res) {

                            $rootScope.user = {
                                name: username
                            };

                            $http.defaults.headers.common.Authorization = 'Basic ' + auth;
                            $rootScope.isAuthenticated = true;

                            if(rememberMe) {
                                localStorageService.set('auth', auth);
                                localStorageService.set('auth:username', username);
                                $log.info('Authorization saved: ' + auth);
                            }

                            defer.resolve();
                        }, function(err) {
                            $rootScope.isAuthenticated = false;
                            defer.reject(err);
                        });

                    return defer.promise;
                }

                function basic(username, password, rememberMe) {
                    var def = $q.defer();
                    $http.post(makeu.apiUrl() + '/wp-json/jwt-auth/v1/token', {
                        username: username,
                        password: password
                    })
                    .then(function(res) {
                        $rootScope.user = {
                            name: res.data.user_display_name,
                            email: res.data.user_email,
                            nick: res.data.user_nicename
                        };

                        localStorageService.set('token', res.data.token);
                        localStorageService.set('name', $rootScope.user.name);
                        localStorageService.set('email', $rootScope.user.email);
                        localStorageService.set('nick', $rootScope.user.nick);

                        $rootScope.isAuthenticated = true;
                        def.resolve(res);
                    }, function(res) {
                        if(res.data.hasOwnProperty('code')) {
                            switch(res.data.code) {
                                case '[jwt_auth] invalid_username':
                                    def.reject({
                                        code: 'invalid'
                                    });
                                    break;
                                default:
                                    throw 'Invalid response from auth server: ' + JSON.stringify(res);
                            }
                        }
                        def.reject(res);
                    });

                    return def.promise;
                    return setAuthorization(auth, username, rememberMe);
                }

                function init() {
                    var token = localStorageService.get('token');

                    if(!_.isEmpty(token)) {
                        $rootScope.user = {
                            name: localStorageService.get('name'),
                            email: localStorageService.get('email'),
                            nick: localStorageService.get('nick')
                        };
                        $rootScope.isAuthenticated = true;
                    } else {
                        $rootScope.isAuthenticated = false;
                    }
                }

                function isAuthenticated() {
                    return $rootScope.isAuthenticated;
                }

                function logout() {
                    angular.forEach(['name', 'email', 'nick', 'token'], function(val) {
                        localStorageService.remove(val);
                    });
                    
                    $rootScope.isAuthenticated = false;
                    $rootScope.user = null;
                    $log.info('log out');
                }

                return {
                    basic: basic,
                    init: init,
                    isAuthenticated: isAuthenticated,
                    logout: logout
                }
            }])
        
})();
(function(){
	angular
		.module('gui.wp')
		.directive('wpBlogPost', function(){
			return {
				templateUrl: 'wp-blog-post.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.post = scope.$eval(attrs.post);
				}
			}
		});
})();
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
(function(){
    angular
        .module('gui.wp')    
        .factory('$guiWpComments', ['$guiWpApi',
            function($guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/comments'}));
            }

            function getListById(options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/comments'}));
            }

            function get(options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/comments', data: {_embed: 1}}));
            }

            /**
             * Create a new Comment
             * @param  {object} data    Data body
             * @param  {string} data.post The post ID
             * @param  {int}    data.author The Author ID
             * @param {string} data.author_email The author email
             * @param {string} data.author_ip The author emai
             * @param {string} data.author_url The author URL
             * @param {string} data.author_user_agent The author user agent
             * @param {string} data.content The comment message
             * @param {date} data.date The date comment was published
             * @param {mixed} data.date_gmt The gmt date comment was published
             * @param {int} data.parent The parent ID
             * @param {string} data.status The comment status
             * @param  {object} options Request options
             * @return {$q}         promise
             */
            function post(data, options) {
                return $guiWpApi.post(data, $guiWpApi.parseOptions(options, {url: '/comments'}));
            }

            return {
                getListById: getListById,
                getList: getList,
                get: get,
                post: post
            };
        }]);
})();

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
(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpOrders', ['$guiWpWcApi', '$guiWpApi',
            function($guiWpWcApi, $guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/orders', data: {}});
                return $guiWpWcApi.get(req);
            }

            function get(id, options) {
                return $guiWpWcApi.get($guiWpApi.parseOptions(options, {url: '/orders/' + id, data: {'_embed': 1}}));
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();
(function(){
	angular
		.module('gui.wp')
		.directive('wpPostCol', function(){
			return {
				templateUrl: 'wp-post-col.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.post = scope.$eval(attrs.post);
				}
			}
		});
})();
(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpPosts', ['$guiWpApi',
            function($guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/posts', data: {'_embed': 1}});
                return $guiWpApi.get(req);
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/posts/' + id, data: {'_embed': 1}}));
                //return $guiWpApi.get('/posts/' + id + '?_embed');
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();
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
(function(){
    angular
        .module('gui.wp')
        .factory('$guiWpProductsSvc', ['$guiWpWcApi', '$guiWpApi',
            function($guiWpWcApi, $guiWpApi) {

            var optionsArgs = ['url', 'method', 'data'];

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/products', data: {}});
                return $guiWpWcApi.get(req);
            }

            function get(id, options) {
                return $guiWpWcApi.get($guiWpApi.parseOptions(options, {url: '/products/' + id, data: {'_embed': 1}}));
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();
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
(function(){
	angular
		.module('gui.wp')
		.factory('$guiWpReplies', ['$guiWpApi', '$q', '$guiWpApiBuilder',
            function($guiWpApi, $q, $guiWpApiBuilder) {

            var api = new $guiWpApiBuilder('gui', 'v1');

            function getList(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/reply?filter[post_parent]=' + id, data: {'_embed': 1}}));
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/reply', data: {post: id, _embed: 1}}));
            }

            function post(data, options) {
                return api.post(data, $guiWpApi.parseOptions(options, {url: '/reply'}));
            }

            return {
                getList: getList,
                get: get,
                post: post
            }
        }]);
})();
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
(function(){
	angular
		.module('gui.wp')
		.provider('$guiWp', [function(){

			var cfg = {};

			function getOrSetConfig(key,val) {
				if(!val) {
					return cfg[key];
				}

				cfg[key] = val;
			}

			return {
				config: getOrSetConfig,
				apiUrl: function(val) {
					getOrSetConfig('apiUrl', val);
				},
				$get: ['$log', function($log) {

					return {
						config: getOrSetConfig
					}
				}]
			}
		}]);
})();
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
(function(){
	angular
		.module('gui.wp')
		.directive('wpForum', function(){
			return {
				templateUrl: 'wp-forum.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.forum = scope.$eval(attrs.forum);
				}
			}
		});
})();
(function(){
    angular
        .module('gui.wp')
        .factory('$guiBpForums', ['$guiWpApi', '$q',
            function($guiWpApi, $q) {

            function getList(options) {
                var req = $guiWpApi.parseOptions(options, {url: '/forum', data: {'_embed': 1}});
                return $guiWpApi.get(req);
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/forum/' + id, data: {'_embed': 1}}));
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();
(function(){
	angular
		.module('gui.wp')
		.directive('wpTopic', function(){
			return {
				templateUrl: 'wp-topic.html',
				replace: true,
				restrict: 'EAC',
				link: function(scope, elem, attrs) {
					scope.topic = scope.$eval(attrs.topic);
				}
			}
		});
})();
(function(){
	angular
		.module('gui.wp')
		.factory('$guiBpTopics', ['$guiWpApi', '$q', '$guiWpApiBuilder',
            function($guiWpApi, $q, $guiWpApiBuilder) {

            var api = new $guiWpApiBuilder('gui', 'v1');

            function getList(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/topic?filter[post_parent]=' + id, data: {'_embed': 1}}));
            }

            function get(id, options) {
                return $guiWpApi.get($guiWpApi.parseOptions(options, {url: '/topic/' + id, data: {_embed: 1}}));
            }

            function post(data, options) {
                return api.post(data, $guiWpApi.parseOptions(options, {url: '/topic'}));
            }

            return {
                getList: getList,
                get: get,
                post: post
            }
        }]);
})();
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
(function(){
	angular
		.module('gui.wp')
		.factory('$guiWcAuthSvc', ['$guiWcApi', '$q', '$guiWc', '$http', '$rootScope', '$cordovaInAppBrowser',
            function($guiWcApi, $q, $guiWc, $http, $rootScope, $cordovaInAppBrowser) {
                
                var baseUrl = 'wc-auth/v1/authorize';
                
                /**
                 * Generate a authorization url
                 * @return {string} url
                 */
                function authorizeUrl() {
                    return $guiWc.get('url') + '/' + baseUrl +
                        '?app_name=' + encodeURIComponent($guiWc.get('app_name')) +
                        '&return_url=' + encodeURIComponent($guiWc.get('return_url')) +
                        '&scope=' + encodeURIComponent($guiWc.get('scope')) +
                        '&callback_url=' + encodeURIComponent($guiWc.get('callback_url')) +
                        '&user_id=' + encodeURIComponent($guiWc.get('user_id'));
                }

                /**
                 * Authenticate against WC store using InAppBrowser
                 * @return {promise} promise
                 */
                function doAuthorization() {
                   
                    var defer = $q.defer();
                        $cordovaInAppBrowser.open(authorizeUrl(), '_blank')
                            .then(function(event) {
                                defer.resolve();
                            })
                            .catch(function(event) {
                                defer.reject(res);
                            });
                        $cordovaInAppBrowser.close();

                    

                    $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){

                    });

                    $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
                        
                    });


                    $rootScope.$on('$cordovaInAppBrowser:loaderror', function(e, event){

                    });

                    $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){

                    });

                    return defer.promise;
                }
                
                return {
                    authorize: doAuthorization
                }
            }])
})();
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
(function(){
	angular
		.module('gui.wp')
        .factory('$guiSqlite', [
            function() {

            function createSchema() {

            }

            return {
                createSchema: createSchema
            }
            }])
		.factory('$guiWpProducts', ['$guiWpApi', '$guiWcApi', '$q',
            function($guiWpApi, $guiWcApi, $q) {

            function getList(options, page) {
                if(!_.isNumber(page)) {
                    page = 1;
                }
                var url = 'products?page=' + page;
                if(_.isObject(options)) {
                    if(!_.isEmpty(options.data['price'])) {
                        url = url + '&filter[meta_key]=_price&filter[meta_value]=' + options.data['price'];
                        //url = url + '&filter[meta_query][key]=price&filter[meta_query][value]=' + options.data['price'];
                    }
                    if(!_.isEmpty(options.data['category'])) {
                        url = url + '&category=' + options.data['category'];
                        //url = url + '&filter[meta_query][key]=price&filter[meta_query][value]=' + options.data['price'];
                    }
                }
                return $guiWcApi.get(url);
            }

            function get(id, options) {
                return $guiWcApi.get('products/' + id);
            }

            return {
                getList: getList,
                get: get
            };
        }]);
})();
(function(){
	angular
		.module('gui.wp')
		.provider('$guiWc', function(){

            var configs = {};
            function set(key, value) {
                configs[key] = value;
            }

            function get(key) {
                return configs[key];
            }

            return {
                url: function(url) {
                    set('url', url);
                },
                appName: function(name) {
                    set('app_name', name);
                },
                returnUrl: function(url) {
                    set('return_url', url);
                },
                scope: function(scope) {
                    set('scope', scope);
                },
                callbackUrl: function(url) {
                    set('callback_url', url);
                },
                userId: function(id) {
                    set('user_id', id);
                },
                $get: ['$log', function($log) {

                    return {
                        get: get
                    }

                }]
            }
        })
})();