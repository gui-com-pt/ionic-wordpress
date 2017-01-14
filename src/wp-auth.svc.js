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