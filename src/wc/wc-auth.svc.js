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