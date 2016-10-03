app.factory('details', function() {
    return {
        number: '555-5555',
        loggedIn: false
    }
})

app.factory('alerts', function() {
    return {
        signup: '',
        login: '',
    }
})

app.factory('prices', function() {
    var prices = {};
    prices.decimalPlace = 2;
    prices.currency = '£';
    prices.subTotal = 0;
    prices.vatPercent = 20;
    prices.vat = 0;
    prices.grandTotal = 0;
    return prices;
})

app.factory('billingInfo', function() {
    return {
        fullName: '',
        email: '',
        address1 : '',
        phoneNumber: '',
        city: '',
        postalCode: '',
        country: 'United Kingdom'
    }
})

app.factory('shippingInfo', function() {
    return {
        fullName: '',
        email: '',
        address1 : '',
        phoneNumber: '',
        city: '',
        postalCode: '',
        country: 'United Kingdom'
    }
})

app.factory('addressList', function() {
    return {};
})

app.factory('productList', function() {
    return {};
})

app.factory('categoryList', function() {
    return {};
})

app.service('category', function($http, categoryList) {
    var category = {};

    category.getCategories = function(callback) {
        $http.post('/api/get-categories').then(function(resp) {
            categoryList = $.parseJSON(resp.data.data);
            callback(categoryList.results);
        });
    }

    category.currentCategoryName = '';

    return category;
})

app.service('product', function($http) {
    var product = {};

    product.getCategoryProduct = function(categoryID, callback) {
        $http.post('/api/get-category-products', {categoryID}).then(function(resp) {
            callback($.parseJSON(resp.data.data));
        });
    }

    product.getProductFromUrl = function(productName, callback) {
        $http.post('/api/get-product-from-url', {productName}).then(function(resp) {
            callback($.parseJSON(resp.data.data));
        });
    }

    return product;
})

app.service('cart', function($http, $localStorage) {
    var cart = {};
    if($localStorage.cart) {
        var cartID = $localStorage.cart.id
    } else {
        cartID = '';
    }

    cart.createCart = function(callback) {
        $http.post('/api/create-cart', {cartID: cartID}).then(function(resp) {
            callback(resp.data);
        });
    }

    cart.addToCart = function(product, qty, cartID, callback) {
        $http.post('/api/add-to-cart', {product: product, qty: parseInt(qty), cartID: cartID}).then(function(resp) {
            callback(resp);
        });
    }

    cart.loadRemoteCart = function(cartID, callback) {
        $http.post('/api/get-cart', {cartID: cartID}).then(function(resp) {
            callback(resp);
        });
    }

    cart.removeItem = function(cartID, productID, callback) {
        $http.post('/api/remove-cart-item', {cartID: cartID, productID: productID}).then(function(resp) {
            callback(resp);
        });
    }

    cart.updateItems = function(cartID, updateArr, callback) {
        $http.post('/api/update-items', {cartID: cartID, updateArr: updateArr}).then(function(resp) {
            callback(resp);
        });
    }

    return cart;
})

app.service('checkout', function($http, $localStorage, prices) {
    var checkout = {};

    checkout.complete = function(callback) {
        var orderDetails = {};
        orderDetails.accountID = $localStorage.userID;
        orderDetails.items = $localStorage.cart.items;
        orderDetails.billing = $localStorage.billingInfo;
        orderDetails.shipping = $localStorage.shippingInfo;
        $http.post('/api/complete-checkout', orderDetails).then(function(resp) {
            callback(resp);
        });

        // prices.decimalPlace = 2;
        // prices.currency = '£';
        // prices.subTotal = 0;
        // prices.vatPercent = 20;
        // prices.vat = 0;
        // prices.grandTotal = 0;


    }

    return checkout;
})

app.service('addresses', function($http, $localStorage) {
    var addresses = {};

    addresses.hasAddress = false;

    addresses.getAddresses = function(callback) {
        $http.post('/api/get-addresses', {userID: $localStorage.userID}).then(function(resp) {
            callback(resp);
        });
    }

    addresses.deleteAddress = function(key, callback) {
        $http.post('/api/delete-address', {userID: $localStorage.userID, key: key}).then(function(resp) {
            callback(resp);
        });
    }

    addresses.saveAddress = function(userID, billingAddress, shippingAddress, callback) {
        $http.post('/api/add-address', {userID: userID, billingAddress: billingAddress, shippingAddress: shippingAddress}).then(function(resp) {
            callback(resp);
        });
    }

    return addresses;
})

app.service('orders', function($localStorage, $http) {
    var orders = {};

    orders.getOrders = function(callback) {
        $http.post('/api/get-orders', {userID: $localStorage.userID}).then(function(response) {
            callback(response);
        })
    }

    return orders;
})

app.service('member', function($localStorage, $location, $http, auth, details, alerts) {
    var member = {};

    member.logout = function() {
        delete $localStorage.token;
        details.loggedIn = false;
        $location.path('/login');
    }

    member.signup = function(signupData, callback) {
        $http.post('/api/member/signup', {signupData: signupData, cartID: $localStorage.cart.id}).then(function(response) {
            if(response.data.success == false) {
                toastr.warning(response.data.message);
            } else {
                var dat = $.parseJSON(response.data.data);
                $localStorage.token = response.data.token;
                $localStorage.userID = dat.id;
                $localStorage.user = dat;
                $location.path('/account-dashboard');
                details.loggedIn = true;
            }
        })
    }

    member.login = function(loginData) {
        $http.post('/api/member/login',
        {loginData: loginData, cartID: $localStorage.cart.id}).then(function(response) {
            if(response.data.status == true) {
                auth.saveStorageField('token', response.data.token, function(resp) {
                    var dat = $.parseJSON(response.data.data);
                    $localStorage.userID = dat.id;
                    $localStorage.user = dat;
                    $localStorage.cart = $.parseJSON(response.data.cart);
                    $location.path('/account-dashboard');
                    details.loggedIn = true;
                })
            } else {
                // no login do some error
                toastr.warning(response.data.message);
            }
        })
    }
    return member;
})

app.service('auth', function($window, $location, $http, $localStorage) {
    var auth = {};

    auth.getToken = function(callback) {
        var token = $localStorage.token;
        if(token) {
            callback(token);
        } else {
            callback(false);
        }
    }

    auth.checkToken = function(token, callback) {
        $http.post('/api/member/check-token', {data: token}).then(function(res) {
            if(res.status == true) {
                console.log('is veri');
            }
            callback(res);
        })
        .catch(function(res) {
            console.error('error', res.status, res.data);
        })
        .finally(function() {
            //callback(res);
        });
    }

    auth.saveStorageField = function(field, value, callback) {
        console.log(field);
        console.log(value);
        if(field) {
            $localStorage[field] = value;
            if($localStorage[field]) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    }

    return auth;

});

app.service('hacks', function($location) {
    var hacks = {};

    hacks.css = function() {
        var bodyColor = '#fff';
        switch($location.path()) {
            case '/login': bodyColor = '#DADADA'; break;
            case '/signup': bodyColor = '#DADADA'; break;
        }
        $('body').css('background', bodyColor);
    }
    return hacks;
})

app.service('func', function() {
    var func = {};

    func.seoUrl = function(text) {
        return text.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
    }

    func.htmlToPlaintext = function(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }

    func.createID = function(callback) {
        callback((Math.random().toString(16)+"000000000").substr(2,8));
    }

    return func;
})



app.service('customjs', function() {
    var customjs = {};

    customjs.go = function() {

        //============================== header =========================


            var navbar = $('.navbar-main');
            console.log(navbar);
            var distance = navbar.offset().top,
                $window = $(window);

        	    $window.scroll(function() {
        	    	if(($window.scrollTop() >= distance) && ($(".navbar-default").hasClass("navbar-main")))
        	        {
        	            navbar.removeClass('navbar-fixed-top').addClass('navbar-fixed-top');
        	          	$("body").addClass("padding-top");
        	          	$(".topBar").css("display","none");
        	        } else {
        	            navbar.removeClass('navbar-fixed-top');
        	            $("body").removeClass("padding-top");
        	            $(".topBar").css("display","block");
        	        }
        	    });


        //============================== ALL DROPDOWN ON HOVER =========================
            $('.dropdown').hover(function() {
                $(this).addClass('open');
            },
            function() {
                $(this).removeClass('open');
            });
        //============================== RS-SLIDER =========================
        	  jQuery('.fullscreenbanner').revolution({
        		delay: 5000,
        		startwidth: 1170,
        		startheight: 500,
        		fullWidth: "on",
        		fullScreen: "off",
        		hideCaptionAtLimit: "",
        		dottedOverlay: "twoxtwo",
        		navigationStyle: "preview4",
        		fullScreenOffsetContainer: "",
        		hideTimerBar:"on",
        	});

        //============================== OWL-CAROUSEL =========================
        	var owl = $('.owl-carousel.featuredProductsSlider');
        	  owl.owlCarousel({
        		  loop:true,
        		  margin:28,
        		  autoplay:true,
        		  autoplayTimeout:2000,
        		  autoplayHoverPause:true,
        		  nav:true,
        		  moveSlides: 4,
        		  dots: false,
        		  responsive:{
        			  320:{
        				  items:1
        			  },
        			  768:{
        				  items:3
        			  },
        			  992:{
        			  	items:4
        			  }
        		  }
        	  });
        	var owl = $('.owl-carousel.partnersLogoSlider');
        	  owl.owlCarousel({
        		  loop:true,
        		  margin:28,
        		  autoplay:true,
        		  autoplayTimeout:6000,
        		  autoplayHoverPause:true,
        		  nav:true,
        		  dots: false,
        		  responsive:{
        			  320:{
        			  	slideBy: 1,
        				  items:1
        			  },
        			  768:{
        			  	slideBy: 3,
        				  items:3
        			  },
        			  992:{
        			  	slideBy: 5,
        				  items:5
        			  }
        		  }
        	  });
        //============================== SELECT BOX =========================
        	$('.select-drop').selectbox();

        //============================== SIDE NAV MENU TOGGLE =========================
        	$('.side-nav li a').click(function() {
        		$(this).find('i').toggleClass('fa fa-minus fa fa-plus');
        	});

        //============================== PRICE SLIDER RANGER =========================
        	var minimum = 20;
        	var maximum = 300;

        	$( "#price-range" ).slider({
        		range: true,
        		min: minimum,
        		max: maximum,
        		values: [ minimum, maximum ],
        		slide: function( event, ui ) {
        			$( "#price-amount-1" ).val( "$" + ui.values[ 0 ] );
        			$( "#price-amount-2" ).val( "$" + ui.values[ 1 ] );
        		}
        	});

        	$( "#price-amount-1" ).val( "$" + $( "#price-range" ).slider( "values", 0 ));
        	$( "#price-amount-2" ).val( "$" + $( "#price-range" ).slider( "values", 1 ));
        //============================== PRODUCT SINGLE SLIDER =========================

        	  $('#thumbcarousel').carousel(0);
        	  var $thumbItems = $('#thumbcarousel .item');
        	    $('#carousel').on('slide.bs.carousel', function (event) {
        	     var $slide = $(event.relatedTarget);
        	     var thumbIndex = $slide.data('thumb');
        	     var curThumbIndex = $thumbItems.index($thumbItems.filter('.active').get(0));
        	    if (curThumbIndex>thumbIndex) {
        	      $('#thumbcarousel').one('slid.bs.carousel', function (event) {
        	        $('#thumbcarousel').carousel(thumbIndex);
        	      });
        	      if (curThumbIndex === ($thumbItems.length-1)) {
        	        $('#thumbcarousel').carousel('next');
        	      } else {
        	        $('#thumbcarousel').carousel(numThumbItems-1);
        	      }
        	    } else {
        	      $('#thumbcarousel').carousel(thumbIndex);
        	    }
        	  });


        	$(".quick-view .btn-block").click(function(){
                $(".quick-view").modal("hide");
            });

    };


    return customjs;
})
