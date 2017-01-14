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