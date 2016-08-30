module.exports = function(app, models, cont, libs) {

    app.post("/api/get-product-from-url", function (req, res){
        var query = {
            url: req.body.productName,
            q: req.body.productName
        };
        libs.marketcloud.products.list(query).then(function(products){
            for(prod in products) {
                console.log(req.body.productName+' = '+ products[prod].url);
                if(products[prod].url == req.body.productName) {
                    products = products[prod];
                    //console.log('in: '+ products[prod].url);
                }
            }
            return res.json({
                success: true,
                message: 'product',
                data: products
            });      // Your code here
        })
    })

    app.post("/api/get-categories", function (req, res){
        libs.marketcloud.categories.list({}).then(function(data){
            res.json({
                success: true,
                message: 'categories',
                data: data
            });
        })
    })

    app.post("/api/get-category-products", function (req, res){
        var query = {category_id : req.body.categoryID};
        libs.marketcloud.products.list(query).then(function(products){
            console.log(products);
            res.json({
                success: true,
                message: 'category-products',
                data: products
            });
        })
    })

    app.post('/api/add-to-cart', function(req, res) {
        console.log(req.body);
        if(req.body.cartID !== '') {
            console.log('here');
            libs.marketcloud.carts.add(req.body.cartID,[
                {'product_id':req.body.product, 'quantity':req.body.qty}])
            .then(function(data){
                if(data) {
                    cont.func.sendInfo(res, true, {data: data, message: 'Item Added.'});
                } else {
                    cont.func.sendInfo(res, false, {errMessage: 'No cart'});
                }
            })
        } else {
            libs.marketcloud.carts.create({
                items:[{'product_id':req.body.product, 'quantity':req.body.qty}]
            }).then(function(data){
                if(data) {
                    cont.func.sendInfo(res, true, {data: data, message: 'Item Added.'});
                } else {
                    cont.func.sendInfo(res, false, {errMessage: 'No cart'});
                }
            })
        }
    })

    app.post('/api/get-cart', function(req, res) {
        libs.marketcloud.carts.getById(req.body.cartID).then(function(data){
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Got Cart.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'No cart'});
            }
        })
    })

    app.post('/api/remove-cart-item', function(req, res) {
        libs.marketcloud.carts.remove(req.body.cartID,[{'product_id':req.body.productID}]).then(function(data){
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Removed Item.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Problem Removing Item.'});
            }
        })
    })

    app.post('/api/update-items', function(req, res) {
        libs.marketcloud.carts.update(req.body.cartID, req.body.updateArr).then(function(data){
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Updated Item.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Problem Updting Item.'});
            }
        })
    })

    app.post('/api/get-addresses', function(req, res) {
        cont.func.getAddresses(models.User, {userID: req.body.userID}, function(data) {
            if(data) {
                cont.func.sendInfo(res, true, {data: data, message: 'Updated Item.'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Problem Updting Item.'});
            }
        })
    })

    app.post('/api/add-address', function(req, res) {
        cont.func.updateArray(models.User, {'userID': req.body.userID}, {key: 'addresses', value: req.body.address}, function(recordStatus) {
            console.log(recordStatus);
        })
    })

    app.post('/api/delete-address', function(req, res) {
        cont.func.deleteAddress(models.User, {'userID': req.body.userID}, req.body.key, function(recordStatus) {
            console.log(recordStatus);
            if(recordStatus) {
                cont.func.sendInfo(res, true, {data: recordStatus, message: 'Address Deleted!'});
            } else {
                cont.func.sendInfo(res, false, {errMessage: 'Address Not Deleted!'});
            }
        })
    })

	app.post('/api/member/signup', function(req, res) {
		cont.func.checkDuplicate(models.User, 'email', req.body.email, function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's a duplicate
				cont.func.sendInfo(res, duplicateStatus,
					{errMessage: 'This Emails already signed up. Login or reset password.'});
			} else {
				// No duplicate in mongo so add record
                libs.marketcloud.users.create({
                    name: req.body.fName,
                    email: req.body.email,
                    password : req.body.password,
                }).then(function(data){
                    req.body.userID = data.id;
                    cont.func.addRecord(models.User, req.body, function(recordStatus) {
	                    var token = libs.jwt.sign(req.body.email, libs.jwtSecret);
                        if(recordStatus) {
                            cont.func.sendInfo(res, true, {data: {token: token, id: data.id}, errMessage: 'Account match!.'});
                        } else {
                            cont.func.sendInfo(res, false, {errMessage: 'Problem signing up'});
                        }
                    })
                })
			}
		})
	});

	app.post('/api/member/login', function(req, res) {
		cont.func.checkDuplicate(models.User, ['email', 'password'], [req.body.email, req.body.password], function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's an account match
				var token = libs.jwt.sign(req.body.email, libs.jwtSecret);
				cont.func.sendInfo(res, duplicateStatus, {data: token, errMessage: 'Account match!.'});
			} else {
				// No duplicate in mongo so no account matches
				cont.func.sendInfo(res, duplicateStatus, {message: 'Email does not exist. Signup today!'});
			}
		})
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
