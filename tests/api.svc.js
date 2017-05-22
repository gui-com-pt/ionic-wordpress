describe('WP Comment Service', function() {

	var $controller;
	var makeu;
	var $guiWpComments;
	var $httpBackend;
	var $guiTestUtil;
	var $guiWpApi,
		baseUrl;

	beforeEach(function() {

        module('wp.test');
        
	    inject(function(_$guiWpApi_, _$guiTestUtil_) {
	    	console.log('Injecting dependencies');
			$guiWpApi = _$guiWpApi_;
			$guiTestUtil = _$guiTestUtil_;
		});
	});

	it('Should parse undefined options with default values', function(){
		var options;
		var config = $guiWpApi.parseOptions(options, {url: '/posts?_embed'});
		expect(config.url).toBe('/posts?_embed');
	});
	
});