app.controller('HomeCtrl', function($scope, $window, $location, category, categoryList) {
    $("#main-css").load(function(){
      $('body').show();
    })


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
            if($scope.categoryList[cat].slug == $scope.categoryName) {
                $scope.categoryID = $scope.categoryList[cat].id;
                $scope.category = $scope.categoryList[cat];
                product.getCategoryProduct($scope.categoryID, function(resp) {
                    $scope.productList = resp.results;
                })
            }
        }
    });

})

app.controller('SingleProductCtrl', function($scope, $window, $location, $http, product, $routeParams, func, category, cart, $localStorage, ModalService, prices) {
    $scope.qty = '0';
    $scope.stockLevel = '0';
    $scope.localStorage = $localStorage;

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


    $scope.addToCart = function(productID, qty) {
        cart.addToCart(productID, qty, $localStorage.cart.id, function(resp) {
            console.log(resp);
            var newCart = $.parseJSON(resp.data.data);
            console.log(newCart);
            $scope.localStorage.cart = newCart;
            $('#myModal').modal();
            $scope.updatePrices($localStorage.cart.items);
            /*ModalService.showModal({
                template: "<div>Fry lives in </div>",
                ///templateUrl: "app/views/modals/add-to-cart.html",
                controller: "ModalController"
            }).then(function(modal) {
                //it's a bootstrap element, use 'modal' to show it
                modal.element.modal();
                modal.close.then(function(result) {
                    console.log(result);
                });
            });*/
        })
    }

    $scope.toCart = function() {
        $('.modal-backdrop').hide();
        $('body').css('padding-right', '0');
        $('body').removeClass('modal-open');
        $location.path('/cart');
    }

    $scope.productName = $routeParams.productName;
    console.log($scope.productName);

    category.getCategories(function(resp) {
        $scope.categoryList = resp;
    });

    product.getProductFromUrl($scope.productName, function(resp) {
        console.log(resp.results[0]);
        $scope.single = resp.results[0];
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

    if($localStorage.cart) {
        console.log($localStorage);
        //$scope.updatePrices($localStorage.cart.items);
        /*cart.loadRemoteCart($localStorage.cart.id, function(resp) {
            $localStorage.cart = resp.data.data;
            $scope.cart = resp.data.data;
            $scope.updatePrices($localStorage.cart.items);
        });*/
    }

    $scope.removeItem = function(productID) {
        cart.removeItem($localStorage.cart.id, productID, function(resp) {
            $localStorage.cart = $.parseJSON(resp.data.data);
            $scope.cart.items = $localStorage.cart.items;
            $scope.updatePrices($localStorage.cart.items);
        });
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
                updateArr.push({id: $(v).attr('data-id'), product_id: $(v).attr('data-product-id'), quantity: $(v).val()});
            }
        })
        if(updateArr.length > 0) {
            cart.updateItems($localStorage.cart.id, updateArr, function(resp) {
                console.log(resp.data.data);
                $localStorage.cart = $.parseJSON(resp.data.data);
                $scope.cart.items = $localStorage.cart.items;
                $scope.updatePrices($localStorage.cart.items);
            })
        }
    }

})

app.controller('CheckoutCtrl', function($scope, $localStorage, checkout, prices) {
    $scope.localStorage = $localStorage;

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

    $scope.updatePrices($localStorage.cart.items);

    $scope.completeCheckout = function() {
        checkout.complete(function(resp) {
            console.log(resp);
        })
    }
})

app.controller('AddressCtrl', function($scope, $location, addresses, addressList, $localStorage, billingInfo, shippingInfo) {
    $scope.addresses = addresses;
    $scope.addressList = addressList;
    $scope.billingInfo = billingInfo;
    $scope.shippingInfo = shippingInfo;
    $scope.sameShippingAddress = true;
    $scope.billingMatches = false;
    $scope.shippingMatches = false;
    $scope.billingInfo.country = '';
    $scope.shippingInfo.country = '';
    $scope.localStorage = $localStorage;
    addresses.hasAddress = false;
    addresses.hasAddressShipping = false;

    if($localStorage.billingInfo) {
        $scope.billingInfo = $localStorage.billingInfo;
    }
    if($localStorage.shippingInfo) {
        $scope.shippingInfo = $localStorage.shippingInfo;
    }
    if($localStorage.sameShippingAddress == false) {
        $scope.sameShippingAddress = $localStorage.sameShippingAddress;
    }

    if($scope.localStorage.user.billing) {
        addresses.hasAddress = true;
    }
    if($scope.localStorage.user.shipping) {
        addresses.hasAddressShipping = true;
    }

    $scope.saveAddress = function() {

        $localStorage.sameShippingAddress = $scope.sameShippingAddress;
        $localStorage.billingInfo = $scope.billingInfo;
        if($scope.sameShippingAddress == false) {
            $localStorage.shippingInfo = $scope.shippingInfo;
        } else {
            $scope.shippingInfo = $scope.billingInfo;
            $localStorage.shippingInfo = $scope.shippingInfo;
        }

        addresses.saveAddress($localStorage.userID, $scope.billingInfo, $scope.shippingInfo, function(resp) {
            $localStorage.user = $.parseJSON(resp.data.data);
            $location.path('/checkout-step-2');
        })

        // /*for(key in $scope.addressList) {
        //     if(angular.toJson($scope.billingInfo) === angular.toJson($scope.addressList[key])) {
        //         $scope.billingMatches = true;
        //     }
        // }*/
        //
        // if($scope.sameShippingAddress == false) {
        //     $localStorage.shippingInfo = $scope.shippingInfo;
        //     /*for(key in $scope.addressList) {
        //         if(angular.toJson($scope.shippingInfo) === angular.toJson($scope.addressList[key])) {
        //             $scope.shippingMatches = true;
        //         }
        //     }*/
        //     if($scope.billingMatches == true && $scope.shippingMatches == true ) {
        //         $location.path('/checkout-step-2');
        //     } else {
        //         if($scope.billingMatches == true) {
        //             var newAdd = $scope.shippingInfo;
        //         } else {
        //             var newAdd = $scope.billingInfo;
        //         }
        //         addresses.saveAddress($localStorage.userID, newAdd, function(resp) {
        //             $location.path('/checkout-step-2');
        //         })
        //     }
        // } else {
        //     if($scope.billingMatches == true) {
        //         $location.path('/checkout-step-2');
        //     }
        // }*/
    }

    $scope.deleteAddress = function(key) {
        addresses.deleteAddress(key, function(resp) {
            if(resp.data.success == true) {
                $localStorage.user = $.parseJSON(resp.data.data);
                $scope.localStorage.user = $.parseJSON(resp.data.data);
                if(key == 'billing') {addresses.hasAddress = false;}
                if(key == 'shipping') {addresses.hasAddressShipping = false;}

                //$scope.addressList = resp.data.data.addresses;
            }
        })
    }

    $scope.populateBilling = function($index) {
        $scope.billingInfo = $scope.addressList[$index];
        $scope.populated = true;
    }
    $scope.populateShipping = function($index) {
        $scope.shippingInfo = $scope.addressList[$index];
        $scope.shippingPopulated = true;
    }

    if($location.path() == '/account-address' || $location.path() == '/checkout-step-1') {
        addresses.getAddresses(function(resp) {

            /*console.log(resp.data.data[0].addresses);
            if(resp.data.data[0].addresses.length < 1) {
                // no addresses
                addresses.hasAddress = false;
            } else {
                addresses.hasAddress = true;
                $scope.addressList = resp.data.data[0].addresses;
            }*/
        })
    }

})

app.controller('OrdersCtrl', function($scope, orders, $localStorage) {


    orders.getOrders(function(resp) {
        $localStorage.orders = $.parseJSON(resp.data.data);
        $scope.orders = $localStorage.orders;
    })
})

app.controller('NaviCtrl', function($scope, details, member, customjs, $http, product, category, categoryList, $localStorage, func, cart, prices) {
    $scope.details = details;
    $scope.customjs = customjs;
    $scope.customjs.go();
    $scope.product = product;
    $scope.localStorage = $localStorage;

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

    if($localStorage.cart) {
        if($localStorage.cart.items) {
            $scope.updatePrices($localStorage.cart.items);
        }
    }


    if($localStorage.categoryList) {
        $scope.categoryList = $localStorage.categoryList;
    } else {
        category.getCategories(function(resp) {
            $scope.categoryList = resp;
            $localStorage.categoryList = $scope.categoryList;
        });
    }


    // If we have a cart with ID
    if($localStorage.cart !== undefined) {
        /*cart.loadRemoteCart($localStorage.cart.id, function(resp) {
            $localStorage.cart = resp.data.data;
            $scope.cart = resp.data.data;
            $scope.updatePrices($localStorage.cart.items);
        });*/
    } else {
        cart.createCart(function(cart) {
            if(cart.success == true) {
                $localStorage.cart = $.parseJSON(cart.data);
            } else {
                console.log(resp.errMessage);
            }
        })
    }


    $scope.logout = function() {
        member.logout();
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
    close("Success!");
});
