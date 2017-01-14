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