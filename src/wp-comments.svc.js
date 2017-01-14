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