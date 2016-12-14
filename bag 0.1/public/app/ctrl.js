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
                prices.subTotal += (items[key].price * items[key].qty);
            }
            prices.vat = prices.subTotal * (prices.vatPercent / 100);
            prices.vat = Math.ceil(prices.vat * 10) / 10;
            prices.grandTotal = prices.vat + prices.subTotal;
        }
    }


    $scope.addToCart = function(productID, qty) {
        var flag = 0;
        flag = func.validate(qty, 'number', 'Choose a quantity!');
        if(flag == 0) {
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
                prices.subTotal += (items[key].price * items[key].qty);
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
            if($scope.categoryList[k].id == catID) {
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

app.controller('CheckoutCtrl', function($scope, $localStorage, checkout, prices, $http, $location) {
    $scope.localStorage = $localStorage;
    $scope.chosenDeliveryMethod = true;
    $scope.orderNumber = '';
    $scope.number = '';
    $scope.month = '';
    $scope.year = '';
    $scope.cvc = '';

    $scope.updatePrices = function(items) {
        prices.subTotal = 0;
        prices.vat = 0;
        prices.grandTotal = 0;
        if(items && items.length > 0) {
            for(key in items) {
                prices.subTotal += (items[key].price * items[key].quantity);
            }
            prices.vat = prices.subTotal * (prices.vatPercent / 100);
            prices.vat = Math.ceil(prices.vat * 10) / 10;
            prices.grandTotal = prices.vat + prices.subTotal;
        }
    }

    $scope.updatePrices($localStorage.cart.items);

    $scope.getDelivery = function() {
        checkout.getDelivery(function(delivery) {
            $scope.deliveryMethods = {};
            $scope.deliveryMethods[0] = delivery;
            $localStorage.cart.shipment_price = $scope.deliveryMethods[0].price;
        })
    }

    $scope.addDelivery = function() {
        $scope.localStorage.cart.grand_total_del = ($localStorage.cart.grand_total + $localStorage.cart.shipment_price);
    }

    $scope.deliveryClick = function() {
        console.log($scope.chosenDeliveryMethod);
    }

    $scope.completeCheckout = function() {
        var total = $localStorage.cart.grand_total_del;
        var userID = $localStorage.userID;

        var flag = 0;
        if($scope.number.length !== 16) {
            flag++;
            toastr.warning('Card number should be 16 digits!');
        }
        if($scope.month.length !== 2 || $scope.month > 12) {
            flag++;
            toastr.warning('Card expiry month should be 2 digits & between 1-12');
        }
        if($scope.year.length !== 2) {
            flag++;
            toastr.warning('Card expiry year should be 2 digits!');
        }
        if($scope.cvc.length !== 3) {
            flag++;
            toastr.warning('Card cvc should be 3 digits!');
        }

        if(flag < 1) {
            Stripe.card.createToken({
                  number: $scope.number,
                  exp_month: $scope.month,
                  exp_year: $scope.year,
                  cvc: $scope.cvc
            }, function(status, res) {
                if(res.error) {
                    toastr.warning(res.error.message);
                } else {
                    res.total = total;
                    res.userID = userID;
                    $http.post("/api/charge-card", res, {total: total, userID: userID}).then(function(response){
                        var paymentID = response.data.id;
                        checkout.complete(paymentID, function(resp) {
                            if(resp.data.success == true) {
                                delete $localStorage.cart;
                                $scope.localStorage.orderNumber = resp.data.data;
                                $location.url("/checkout-complete");
                            }
                        })
                    });
                }
            });
        }

    }
})

app.controller('AddressCtrl', function($scope, $location, addresses, addressList, $localStorage, billingInfo, shippingInfo, func) {
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

    if($localStorage.user.billing) {
        $scope.billingInfo = $localStorage.user.billing;
    }
    if($localStorage.user.shipping) {
        $scope.shippingInfo = $localStorage.user.shipping;
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
        var flag = 0;
        flag = func.validate($scope.billingInfo.name, 'text', 'Enter the billing name!');
        flag = func.validate($scope.billingInfo.address1, 'text', 'Enter the address 1!');
        flag = func.validate($scope.billingInfo.phoneNumber, 'text', 'Enter the billing phone number!');
        flag = func.validate($scope.billingInfo.city, 'text', 'Enter the billing city!');
        flag = func.validate($scope.billingInfo.postalCode, 'text', 'Enter the billing postal code!');
        flag = func.validate($scope.billingInfo.name, 'text', 'Enter the billing name!');

        if(flag == 0) {
            var flag2 = 0;
            $localStorage.sameShippingAddress = $scope.sameShippingAddress;
            $localStorage.billingInfo = $scope.billingInfo;
            if($scope.sameShippingAddress == false) {
                $localStorage.shippingInfo = $scope.shippingInfo;
                flag2 = func.validate($scope.shippingInfo.name, 'text', 'Enter the shipping name!');
                flag2 = func.validate($scope.shippingInfo.address1, 'text', 'Enter the shipping address 1!');
                flag2 = func.validate($scope.shippingInfo.phoneNumber, 'text', 'Enter the shipping phone number!');
                flag2 = func.validate($scope.shippingInfo.city, 'text', 'Enter the shipping city!');
                flag2 = func.validate($scope.shippingInfo.postalCode, 'text', 'Enter the shipping postal code!');
            } else {
                $scope.shippingInfo = $scope.billingInfo;
                $localStorage.shippingInfo = $scope.shippingInfo;
            }

            if(flag2 == 0) {
                addresses.saveAddress($localStorage.userID, $scope.billingInfo, $scope.shippingInfo, function(resp) {
                    $localStorage.user = $.parseJSON(resp.data.data);
                    $location.path('/checkout-step-2');
                })
            }

        }




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

    $scope.populateBilling = function(type) {
        if(type == 'billing') {
            $scope.billingInfo = $localStorage.user.billing;
        } else {
            $scope.billingInfo = $localStorage.user.shipping;
        }
        $scope.populated = true;
        console.log($scope.billingInfo);
    }
    $scope.populateShipping = function(type) {
        if(type == 'billing') {
            $scope.shippingInfo = $localStorage.user.billing;
        } else {
            $scope.shippingInfo = $localStorage.user.shipping;
        }
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

app.controller('OrdersCtrl', function($scope, orders, $localStorage, $location, prices, product) {
    $scope.prices = prices;

    orders.getOrders(function(resp) {
        $localStorage.orders = $.parseJSON(resp.data.data);
        $scope.orders = $localStorage.orders;
        $scope.user = $localStorage.user;
        $scope.currentProd = [];

        $scope.orderID = $location.path().split('/')[2];
        //$scope.orders
        for(key in $scope.orders.results) {
            if($scope.orders.results[key].number == $scope.orderID) {
                $scope.currentOrder = $scope.orders.results[key];
            }
            //console.log($scope.currentOrder);
            if(parseInt(key)+1 == $scope.orders.results.length) {
                //console.log('in');
                var idArr = [];
                for(key in $scope.currentOrder.items) {
                    idArr[key] = $scope.currentOrder.items[key].product_id;
                    if(parseInt(key)+1 == $scope.currentOrder.items.length) {
                        //console.log('in2');
                        product.getProductFromID(idArr, function(resp) {
                            console.log(resp.length);
                            if(resp.length > 1) {
                                for(key in resp) {
                                    $scope.currentProd[key] = $.parseJSON(resp[key]);
                                }
                            } else {
                                $scope.currentProd[0] = $.parseJSON(resp);
                            }
                            console.log($scope.currentProd);
                            /*console.log(resp.results[0]);
                            $scope.single = resp.results[0];
                            $scope.single.description = func.htmlToPlaintext($scope.single.description);
                            $scope.stockLevel = $scope.single.stock_level;
                            $scope.numberToArray($scope.stockLevel);*/
                        })
                    }
                }


            }
        }



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

app.controller('MemberCtrl', function($scope, $http, $location, auth, member, alerts, $localStorage, func) {
    $scope.signupData = {};
    $scope.confirmPassword = '';
    $scope.loginData = {};
    $scope.alerts = alerts;
    $scope.lostEmail = '';
    $scope.newPassword = '';
    $scope.resetCode = $location.search().code;

    $scope.getProfileData = function() {
        $scope.profileInfo = $localStorage.user;
        $scope.newProfileData = {};
    }

    $scope.updateProfile = function() {
        $scope.newProfileData.userID = $localStorage.userID;
        member.updateProfile($scope.newProfileData, function(userData) {
            $localStorage.user = $.parseJSON(userData.data);
            $scope.profileInfo = $localStorage.user;
        })
    }

    $scope.signupDataSubmit = function() {
        var flag = 0;
        flag = func.validate($scope.signupData.fName, 'text', 'Enter your first name!');
        flag = func.validate($scope.signupData.lName, 'text', 'Enter your last name!');
        flag = func.validate($scope.signupData.email, 'email', 'Enter a valid email!');
        flag = func.validate($scope.signupData.password, 'password', 'Enter your password!<br>Minimum 6 characters.');

        if(flag == 0) {
            member.signup($scope.signupData);
        }

    }

    $scope.loginDataSubmit = function() {
        var flag = 0;
        flag = func.validate($scope.loginData.email, 'email', 'Enter a valid email!');
        flag = func.validate($scope.loginData.password, 'password', 'Enter your password!<br>Minimum 6 characters.');
        if(flag == 0) {
            member.login($scope.loginData, function() {

            });
        }
    }

    $scope.forgotPasswordSubmit = function() {
        if($scope.lostEmail !== '') {
            member.lostPassword($scope.lostEmail, function() {

            })
        }
    }

    $scope.resetPassword = function() {
        if($scope.resetCode.length > 3) {
            if($scope.newPassword !== '') {
                member.resetPassword($scope.newPassword, $scope.resetCode, function(resp) {
                    if(resp.data.success == true) {
                          toastr.success(resp.data.message);
                          $location.path('/login');
                    }
                })
            }
        }

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
