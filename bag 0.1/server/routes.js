module.exports = function(app, models, cont, libs) {

    app.post("/api/get-product-from-url", function (req, res){
        libs.schemaCli.get('/products', {
            active: true,
            slug: req.body.productName
        }, function(err, prod) {
            if(err) {
                res.json({
                  success: false,
                  message: 'products',
                  data: err
                });
            } else {
                res.json({
                    success: true,
                    message: 'product',
                    data: prod
                });
            }
        })

    })

    app.post("/api/get-categories", function (req, res){
        libs.schemaCli.get('/categories', {active: true}, function(err, cat) {
            if(err) {
                res.json({
                  success: false,
                  message: 'categories',
                  data: err
                });
            } else {
                res.json({
                    success: true,
                    message: 'categories',
                    data: cat
                });
            }
        });
    })

    app.post("/api/get-category-products", function (req, res){
        libs.schemaCli.get('/products', {
            'category_index.id': req.body.categoryID,
            active: true
        }, function(err, prods) {
            //console.log(prods);
            if(err) {
                res.json({
                  success: false,
                  message: 'products',
                  data: err
                });
            } else {
                res.json({
                    success: true,
                    message: 'products',
                    data: prods
                });
            }
        })
    })

    app.post('/api/create-cart', function(req, res) {
        libs.schemaCli.post('/carts', {

        }, function(err, result) {
            if(err) {
                cont.func.sendInfo(res, false, {data: err, errMessage: 'Cart Created Failed.'});
            } else {
                cont.func.sendInfo(res, true, {data: result, message: 'Cart Created.'});
            }
        });

    })

    app.post('/api/add-to-cart', function(req, res) {
        console.log(req.body);
        if(req.body.cartID !== '') {
            var cartData = {
                cart_id: req.body.cartID,
                items: {
                    product_id: req.body.product,
                    qty: req.body.qty
                }
            };
            libs.schemaCli.put('/carts/{cart_id}/items', cartData, function(err, data) {
                if(err) {
                    cont.func.sendInfo(res, false, {data: err, errMessage: 'No cart'});
                } else {
                    console.log(req.body.cartID);
                    libs.schemaCli.get('/carts/{id}', {
                        id: req.body.cartID,
                        expand: 'items.product, items.variant, items.bundle_items.product, items.bundle_items.variant'
                    }, function(err, result) {
                        console.log(err);
                        console.log(result);
                        cont.func.sendInfo(res, true, {data: result, message: 'Item Added.'});
                    });
                }
            })

            /*libs.marketcloud.carts.add(req.body.cartID,[
                {'product_id':req.body.product, 'quantity':req.body.qty}])
            .then(function(data){
                if(data) {
                    cont.func.sendInfo(res, true, {data: data, message: 'Item Added.'});
                } else {
                    cont.func.sendInfo(res, false, {errMessage: 'No cart'});
                }
            })*/
        } else {
            /*libs.marketcloud.carts.create({
                items:[{'product_id':req.body.product, 'quantity':req.body.qty}]
            }).then(function(data){
                if(data) {
                    cont.func.sendInfo(res, true, {data: data, message: 'Item Added.'});
                } else {
                    cont.func.sendInfo(res, false, {errMessage: 'No cart'});
                }
            })*/
        }
    })

    app.post('/api/get-cart', function(req, res) {
        /*libs.marketcloud.carts.getById(req.body.cartID).then(function(data){
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Got Cart.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'No cart'});
            }
        })*/
    })

    app.post('/api/remove-cart-item', function(req, res) {
        libs.schemaCli.delete('/carts/{cart_id}/items/{item_id}', {
            cart_id: req.body.cartID,
            item_id: req.body.productID
        }, function(err, data) {
            libs.schemaCli.get('/carts/{id}', {
                id: req.body.cartID,
                expand: 'items.product, items.variant, items.bundle_items.product, items.bundle_items.variant'
            }, function(err, result) {
                console.log(err);
                console.log(result);
                cont.func.sendInfo(res, true, {data: result, message: 'Item Added.'});
            });
        })



        /*libs.marketcloud.carts.remove(req.body.cartID,[{'product_id':req.body.productID}]).then(function(data){
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Removed Item.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Problem Removing Item.'});
            }
        })*/
    })

    app.post('/api/update-items', function(req, res) {
        libs.schemaCli.put('/carts/{cart_id}', {
            cart_id: req.body.cartID,
            items: req.body.updateArr
        }, function(err, result) {
            libs.schemaCli.get('/carts/{id}', {
                id: req.body.cartID,
                expand: 'items.product, items.variant, items.bundle_items.product, items.bundle_items.variant'
            }, function(err, result) {
                console.log(err);
                console.log(result);
                cont.func.sendInfo(res, true, {data: result, message: 'Item Added.'});
            });
        })



        /*libs.marketcloud.carts.update(req.body.cartID, req.body.updateArr).then(function(data){
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Updated Item.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Problem Updting Item.'});
            }
        })*/
    })

    app.post('/api/get-addresses', function(req, res) {

        /*cont.func.getAddresses(models.User, {userID: req.body.userID}, function(data) {
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Updated Item.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Problem Updting Item.'});
            }
        })*/
    })

    app.post('/api/add-address', function(req, res) {
        libs.schemaCli.put('/accounts/{id}', {
            id: req.body.userID,
            'billing.address1': req.body.billingAddress.address1,
            'billing.city': req.body.billingAddress.city,
            'billing.name': req.body.billingAddress.fullName,
            'billing.phone': req.body.billingAddress.phoneNumber,
            'billing.zip': req.body.billingAddress.postalCode,
            'shipping.address1': req.body.shippingAddress.address1,
            'shipping.city': req.body.shippingAddress.city,
            'shipping.name': req.body.shippingAddress.fullName,
            'shipping.phone': req.body.shippingAddress.phoneNumber,
            'shipping.zip': req.body.shippingAddress.postalCode
        }, function(err, resp) {
            console.log(resp);
            if(err) {
                cont.func.sendInfo(res, false, {data: data, errMessage: 'Billing Address Not Added!'});
            } else {
                cont.func.sendInfo(res, true, {data: resp, message: 'Billing Address Added!'});
            }
            console.log(resp);
        });

        /*cont.func.updateArray(models.User, {'userID': req.body.userID}, {key: 'addresses', value: req.body.address}, function(recordStatus) {
            //console.log(recordStatus);
        })*/
    })

    app.post('/api/delete-address', function(req, res) {
        if(req.body.key == 'billing') {
            var unsetter = 'billing';
        }
        if(req.body.key == 'shipping') {
            var unsetter = 'shipping';
        }
        libs.schemaCli.put('/accounts/{id}', {
            id: req.body.userID,
            $unset: unsetter
        }, function(err, result) {
            if(err) {
                cont.func.sendInfo(res, false, {errMessage: 'Address Not Deleted!'});
            } else {
                cont.func.sendInfo(res, true, {data: result, errMessage: 'Address Deleted!'});
            }
        });
        /*cont.func.deleteAddress(models.User, {'userID': req.body.userID}, req.body.key, function(recordStatus) {
            //console.log(recordStatus);
            if(recordStatus) {
                cont.func.sendInfo(res, true, {data: recordStatus, message: 'Address Deleted!'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Address Not Deleted!'});
            }
        })*/
    })

    app.post('/api/get-orders', function(req, res) {
        console.log(req.body);
        libs.schemaCli.get('/orders', {
            account_id: req.body.userID
        }, function(err, result) {
            if(err) {
                cont.func.sendInfo(res, false, {data: recordStatus, errMessage: 'Order Problem!'});
            } else {
                cont.func.sendInfo(res, true, {data: result, message: 'Got Orders!'});
            }
        });
    })

    app.post('/api/complete-checkout', function(req, res) {
        libs.schemaCli.post('/orders', {
            account_id: req.body.accountID,
            items: req.body.items,
            billing: req.body.billing,
            shipping: req.body.shipping,
            'items.taxes.amount' : req.body.itemsTaxesAmount
        }, function(err, result) {
            console.log(err);
            console.log(result);
        });
    })

	app.post('/api/member/signup', function(req, res) {
        libs.schemaCli.post('/accounts', {
            email: req.body.signupData.email,
            password: req.body.signupData.password,
            first_name: req.body.signupData.fName,
            last_name: req.body.signupData.lName
        }, function(err, result) {
            if(err) {
                cont.func.sendInfo(res, false, {data: err});
            } else {
                if(result.errors) {
                    if(result.errors.email.code == 'UNIQUE') {
                        cont.func.sendInfo(res, false, {errMessage: 'Email Already Exists!'});
                    }
                } else {
                    libs.schemaCli.put('/carts/{cart_id}', {
                        cart_id: req.body.cartID,
                        account_id: result.id
                    }, function(err, result) {
                        libs.schemaCli.get('/carts/{id}', {
                            id: req.body.cartID,
                            expand: 'items.product, items.variant, items.bundle_items.product, items.bundle_items.variant'
                        }, function(err, cart) {
                            var token = libs.jwt.sign(req.body.signupData.email, libs.jwtSecret);
                            res.json({
                                status: true,
                                data: result,
                                token: token,
                                cart: cart,
                                message: 'Successful Signup!'
                            });
                        });
                    })
                }
            }
        });
	});

	app.post('/api/member/login', function(req, res) {
        console.log(req.body);
        libs.schemaCli.get('/accounts/:login', {
            email: req.body.loginData.email,
            password: req.body.loginData.password
        }, function(err, data) {
            if(err) {
                cont.func.sendInfo(res, false, {errMessage: err});
            }
            if(data) {
                libs.schemaCli.put('/carts/{cart_id}', {
                    cart_id: req.body.cartID,
                    account_id: data.id
                }, function(err, result) {
                    libs.schemaCli.get('/carts/{id}', {
                        id: req.body.cartID,
                        expand: 'items.product, items.variant, items.bundle_items.product, items.bundle_items.variant'
                    }, function(err, cart) {
                        var token = libs.jwt.sign(req.body.loginData.email, libs.jwtSecret);
                        res.json({
                            status: true,
                            data: data,
                            token: token,
                            cart: cart,
                            message: 'Successful Login!'
                        });
                    });
                })
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'No Account Found'});
            }
        })
		/*cont.func.checkDuplicate(models.User, ['email', 'password'], [req.body.email, req.body.password], function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's an account match
				var token = libs.jwt.sign(req.body.email, libs.jwtSecret);
				cont.func.sendInfo(res, duplicateStatus, {data: token, errMessage: 'Account match!.'});
			} else {
				// No duplicate in mongo so no account matches
				cont.func.sendInfo(res, duplicateStatus, {message: 'Email does not exist. Signup today!'});
			}
		})*/
	});

	app.post('/api/member/check-token', function(req, res) {
		var token = req.body.data;
		if(token !== false) {
			var decodedEmail = libs.jwt.verify(token, libs.jwtSecret);
			if(decodedEmail) {
				res.json({status: true});
			} else {
				res.json({status: false});
			}
		} else {
			res.json({status: false});
		}
	});

	app.get('*', function(req, res) {
        res.render('pages/index');
    });




}; // End Routes
