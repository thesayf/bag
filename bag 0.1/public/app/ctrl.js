app.controller('HomeCtrl', function($scope, $window, $location, category, categoryList) {
    $("#main-css").load(function(){
      $('body').show();
    })
    category.getCategories(function(resp) {
        $scope.categoryList = resp;
    });
})

app.controller('CategoryCtrl', function($scope, $window, $location, $http, product, categoryList, product, category, $routeParams) {
    $scope.categoryList = categoryList;
    $scope.categoryName = $routeParams.categoryName;
    $scope.categoryID = '';
    $scope.category = {};
    $scope.productList = {};

    category.getCategories(function(resp) {
        $scope.categoryList = resp;
        for(cat in $scope.categoryList) {
            if($scope.categoryList[cat].name == $scope.categoryName) {
                $scope.categoryID = $scope.categoryList[cat].id;
                $scope.category = $scope.categoryList[cat];
            }
        }
        product.getCategoryProduct($scope.categoryID, function(resp) {
            $scope.productList = resp.data.data;
            console.log($scope.productList);
        })
    });

})


app.controller('SingleProductCtrl', function($scope, $window, $location, $http, product, $routeParams, func, category) {
    $scope.productName = $routeParams.productName;
    console.log($scope.productName);

    category.getCategories(function(resp) {
        $scope.categoryList = resp;
    });

    product.getProductFromUrl($scope.productName, function(resp) {
        console.log(resp);
        $scope.single = resp.data.data;
        $scope.single.description = func.htmlToPlaintext($scope.single.description);
    })
})



app.controller('NaviCtrl', function($scope, details, member, customjs, $http, product, category, categoryList) {
    $scope.details = details;
    $scope.customjs = customjs;
    $scope.customjs.go();
    $scope.product = product;

    $scope.logout = function() {
        member.logout();
    }

    $scope.bags = function() {

    console.log("this is firing")
    $http.post('/api/bags', $scope.driver).success(function(response) {
        console.log("we added the stuff");
        console.log(response);
        console.log(response.data[0]["price"]);

        $scope.product = response.data;

        $scope.price = response.data[0]["price"]


        });

    }


})



app.controller('MemberCtrl', function($scope, $http, $location, auth, member, alerts) {
    $scope.signupData = {};
    $scope.confirmPassword = '';
    $scope.loginData = {};
    $scope.alerts = alerts;

    $scope.signupDataSubmit = function() {
        console.log($scope.signupData);
        member.signup($scope.signupData);
    }

    $scope.loginDataSubmit = function() {
        member.login($scope.loginData, function() {

        });
    }

    $scope.authenticate = function() {
        auth.getToken(function(token) {
            auth.checkToken(token, function(status) {
                console.log(status);
            })
        })
    }

})
