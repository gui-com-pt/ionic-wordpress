describe('WP Comment Service', function() {

	var $controller;
	var makeu;
	var $guiWpComments;
	var $httpBackend;
	var $guiTestUtil;
	var $guiWpApi,
		baseUrl,
		getListResponse = [];

	beforeEach(function() {

        module('wp.test');
        
	    inject(function(_$controller_, _$guiWpComments_, _$guiWpApi_, _$injector_, _$guiTestUtil_) {
	    	console.log('Injecting dependencies');
			$controller = _$controller_;
			$guiWpComments = _$guiWpComments_;
			$httpBackend = _$injector_.get('$httpBackend');
			$guiTestUtil = _$guiTestUtil_;
			$guiWpApi = _$guiWpApi_;
			baseUrl = $guiTestUtil.apiUrl() + $guiWpApi.apiBase();

			authRequestHandler = $httpBackend.when('GET', baseUrl + '/comments?_embed')
	                            .respond(getListResponse, {'A-Token': 'xxx'});
		});
	});


	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});
	
	it('Should get comment lists', function(){
		$httpBackend.expectGET(baseUrl + '/comments?_embed');
		$guiWpComments.getList();
		$httpBackend.flush();
	});
});