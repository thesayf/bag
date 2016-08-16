// Directives Path
var dir = 'app/views/';

app.directive('head', function() {
	return {
		templateUrl: dir+'head.html',
		controller: 'HomeCtrl',
	}
})

app.directive('navi', function() {
	return {
		templateUrl: dir+'navi.html',
		controller: 'NaviCtrl',
	}
})

app.directive('foot', function() {
	return {
		templateUrl: dir+'footer.html',
		controller: 'HomeCtrl',
	}
})
