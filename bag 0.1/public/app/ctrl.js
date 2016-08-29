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


app.controller('SingleProductCtrl', function($scope, $window, $location, $http, product, $routeParams, func, category, cart, $localStorage, ModalService) {
    $scope.qty = '0';
    $scope.stockLevel = '0';

    $scope.addToCart = function(productID, qty) {
        cart.addToCart(productID, qty, function(resp) {
            $localStorage.cart = resp.data.data;
            ModalService.showModal({
                templateUrl: "app/views/modals/add-to-cart.html",
                controller: "ModalController"
            }).then(function(modal) {
                //it's a bootstrap element, use 'modal' to show it
                modal.element.modal();
                modal.close.then(function(result) {
                    console.log(result);
                });
            });
        })
    }

    $scope.productName = $routeParams.productName;
    console.log($scope.productName);

    category.getCategories(function(resp) {
        $scope.categoryList = resp;
    });

    product.getProductFromUrl($scope.productName, function(resp) {
        console.log(resp);
        $scope.single = resp.data.data;
        $scope.single.description = func.htmlToPlaintext($scope.single.description);
        $scope.stockLevel = $scope.single.stock_level;
        $scope.numberToArray($scope.stockLevel);
    })

    $scope.numberToArray = function(num) {
        var tempNumArr = [];
        for(var i = 1; i < num+1; i++) {
            tempNumArr.push(i);
        }
        $scope.stockLevelArr = tempNumArr;
    }
})

app.controller('CartCtrl', function($scope, cart, $localStorage, prices, categoryList, $location) {
    $scope.prices = prices;
    $scope.cart = $localStorage.cart;
    $scope.categoryList = categoryList;

    cart.loadRemoteCart($localStorage.cart.id, function(resp) {
        $localStorage.cart = resp.data.data;
        $scope.cart = resp.data.data;
        $scope.updatePrices($localStorage.cart.items);
    });

    $scope.removeItem = function(productID) {
        cart.removeItem($localStorage.cart.id, productID, function(resp) {
            $localStorage.cart.items = resp.data.data.items;
            $scope.cart.items = $localStorage.cart.items;
            $scope.updatePrices($localStorage.cart.items);
        });
    }

    $scope.updatePrices = function(items) {
        prices.subTotal = 0;
        prices.vat = 0;
        prices.grandTotal = 0;
        if(items.length > 0) {
            for(key in items) {
                prices.subTotal += (items[key].price * items[key].quantity);
            }
            prices.vat = prices.subTotal * (prices.vatPercent / 100);
            prices.vat = Math.ceil(prices.vat * 10) / 10;
            prices.grandTotal = prices.vat + prices.subTotal;
        }
    }

    $scope.goToProductPage = function(catID, productURL) {
        for(k in $scope.categoryList) {
            console.log(catID);
            if($scope.categoryList[k].id == catID) {
                console.log($scope.categoryList[k].id);
                $location.path('/'+$scope.categoryList[k].name+'/'+productURL);
            }
        }
    }

    $scope.updateCartQty = function() {
        var cartItemArr = $('.update-qty-input');
        var updateArr = [];
        $.each(cartItemArr, function(k,v) {
            if($(v).val() !== '') {
                updateArr.push({product_id: $(v).attr('data-product-id'), quantity: $(v).val()});
            }
        })
        if(updateArr.length > 0) {
            cart.updateItems($localStorage.cart.id, updateArr, function(resp) {
                $localStorage.cart.items = resp.data.data.items;
                $scope.cart.items = $localStorage.cart.items;
                $scope.updatePrices($localStorage.cart.items);
            })
        }
    }

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

app.controller('ModalController', function($scope, close) {

  // when you need to close the modal, call close
  close("Success!");
});
