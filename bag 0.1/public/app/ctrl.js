app.controller('HomeCtrl', function($scope, $window, $location) {
    $("#main-css").load(function(){
      $('body').show();
    })
})

app.controller('ProductCtrl', function($scope, $window, $location, $http, product) {
    
    
    if($location.path() == "/single-product"){
        $scope.singleProductId = $location.search().id;
        
        $http.post('/api/singleProduct', {data: id}).success(function(response) {
            
            $scope.product = response.data;
            console.log("we added the stuff");     
            console.log(response.data.price);
            console.log(response.data.name);
            
            $scope.single = {};
            $scope.single.price = response.data.price;
            $scope.single.name = response.data.name;
            
            
        });
    
    }
  console.log("product page is firiing");
    $http.post('/api/bags').success(function(response) {
        console.log("we added the stuff");
//        console.log(response);
        console.log(response.data[0]["price"]);
        $scope.product = response.data;        

        });
    
    $scope.singleProduct = function(id){
        
        $location.path("/single-product?id="+ id);

    
    }
    
    $scope.test = function(){
        console.log("lets see id this is working ");
    
    }
    
})


app.controller('SingleProductCtrl', function($scope, $window, $location, $http, product) {
    
    
    if($location.path() == "/single-product"){
        $scope.singleProductId = $location.search().id;
        
        $http.post('/api/singleProduct', {data: id}).success(function(response) {
            
            $scope.product = response.data;
            console.log("we added the stuff");     
            console.log(response.data.price);
            console.log(response.data.name);
            
            $scope.single = {};
            $scope.single.price = response.data.price;
            $scope.single.name = response.data.name;
            
            
        });
    
    }
    
})



app.controller('NaviCtrl', function($scope, details, member, customjs, $http, product) {
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
