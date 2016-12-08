app.config(function(/*$stateProvider, $urlRouterProvider,*/ $locationProvider, $routeProvider) {

    var viewDir = 'app/views/';

    $routeProvider

    .when('/', {
        templateUrl : viewDir+'home/home-view.html',
        controller  : 'HomeCtrl'
    })

    .when('/cart', {
        templateUrl : viewDir+'cart/cart-page.html',
        controller  : 'CartCtrl'
    })

    .when('/checkout-step-1', {
        templateUrl : viewDir+'checkout/checkout-step-1.html',
        controller  : 'AddressCtrl',
        type: 'protected'
    })

    .when('/checkout-step-2', {
        templateUrl : viewDir+'checkout/checkout-step-2.html',
        controller  : 'MemberCtrl'
    })

    .when('/checkout-step-3', {
        templateUrl : viewDir+'checkout/checkout-step-3.html',
        controller  : 'MemberCtrl'
    })

    .when('/checkout-step-4', {
        templateUrl : viewDir+'checkout/checkout-step-4.html',
        controller  : 'CheckoutCtrl'
    })

    .when('/checkout-complete', {
        templateUrl : viewDir+'checkout/checkout-complete.html',
        controller  : 'MemberCtrl'
    })

    .when('/signup', {
        templateUrl : viewDir+'member/signup-view.html',
        controller  : 'MemberCtrl'
    })

    .when('/login', {
        templateUrl : viewDir+'member/login-view.html',
        controller  : 'MemberCtrl'
    })

    .when('/account-dashboard', {
        templateUrl : viewDir+'member/account-view.html',
        controller  : 'MemberCtrl',
        type: 'protected'
    })

    .when('/account-profile', {
        templateUrl : viewDir+'member/account-profile.html',
        controller  : 'MemberCtrl'
    })

    .when('/account-address', {
        templateUrl : viewDir+'member/account-address.html',
        controller  : 'AddressCtrl'
    })

    .when('/account-all-orders', {
        templateUrl : viewDir+'member/account-all-orders.html',
        controller  : 'OrdersCtrl'
    })

    .when('/account-wishlist', {
        templateUrl : viewDir+'member/account-wishlist.html',
        controller  : 'MemberCtrl'
    })

    .when('/account-single-order', {
        templateUrl : viewDir+'member/account-single-order.html',
        controller  : 'MemberCtrl'
    })

    .when('/about-us', {
        templateUrl : viewDir+'pages/about-us.html',
        controller  : 'MemberCtrl'
    })

    .when('/lost-password', {
        templateUrl : viewDir+'pages/lost-password.html',
        controller  : 'MemberCtrl'
    })

    .when('/reset-password', {
        templateUrl : viewDir+'pages/reset-password.html',
        controller  : 'MemberCtrl'
    })

    .when('/terms-and-conditions', {
        templateUrl : viewDir+'pages/terms-and-conditions.html',
        controller  : 'MemberCtrl'
    })

    .when('/:categoryName', {
        templateUrl : viewDir+'category/category-page.html',
        controller  : 'CategoryCtrl'
    })

    .when('/:categoryName/:productName', {
        templateUrl : viewDir+'product/single-product.html',
        controller  : 'SingleProductCtrl'
    })


    /*.otherwise({
        redirectTo: '/'
    });*/

    $locationProvider.html5Mode(true);

});

app.run(function($http, $localStorage, $log, $location, details, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
        var type = current.type;
        if(type == 'protected') {
            var token = $localStorage.token;
            if(token) {
                $http.post('/api/member/check-token', {data: token}).then(function(res) {
                    if(res.data.status == true) {
                        // verified
                        details.loggedIn = true;
                    } else {
                        details.loggedIn = false;
                        $location.path('/login');
                    }
                })
            } else {
                details.loggedIn = false;
                $location.path('/login');
            }
        }
    });
})
