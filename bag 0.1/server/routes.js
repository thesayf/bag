var func = require(__dirname + '/controllers/func.js');
var jwt = require('jsonwebtoken');
var jwtSecret 	= 'jwtSecretKey';
var Marketcloud = require('marketcloud-node');
var marketcloud = new Marketcloud.Client({
        public_key : '4eb1bcc1-677c-40ec-bda0-aa784219c0cc',
        secret_key : '058G6A9xGv4VAj+GRlybSwOKnwW0IT4SpndC4HzFeF0='
    })

module.exports = function(app, models, Marketcloud) {
    
    marketcloud.products.getById(70938)
        .then(function(product){   
//        console.log(product)
        // Your code here          
        });
    
    
    app.post("/api/singleProduct", function (req, res){
        console.log("this is fizzing");        
              console.log(req.body.data);
        marketcloud.products.getById(req.body.data)
            .then(function(product){    
              // Your code here 
                return res.json({
                            success: true,
                            message: 'product',
                            data: product
                        });
            console.log(product);
        });
    
    })
    
    
    app.post("/api/bags", function (req, res){
        console.log("this is firing");
        
        var query = {category_id : 70939}
        
        marketcloud.products.list(query).then(function(data){
            
            if(data){
//                console.log(data)
                console.log("this is working")
                return res.json({
                            success: true,
                            message: 'products',
                            data: data
                        });
            }
            else{
                console.log("no info")
            
            }
            }).catch(function(error){
        //Handle error
            console.log(error)
        })
        
              
        
    
    })
    
	app.post('/api/member/signup', function(req, res) {
		func.checkDuplicate(models.User, 'email', req.body.email, function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's a duplicate
				func.sendInfo(res, duplicateStatus,
					{errMessage: 'This Emails already signed up. Login or reset password.'});
			} else {
				// No duplicate in mongo so add record
				func.addRecord(models.User, req.body, function(recordStatus) {
                    marketcloud.users.create({
                        name: req.body.fName,
                        email: req.body.email,
                        password : req.body.password,
                    })
                        .then(function(data){
                        console.log(data)
                        console.log(req.body);
					   var token = jwt.sign(req.body.email, jwtSecret);
					   func.sendInfo(res, recordStatus,
						{data: token, errMessage: 'Account match!.'});
                                // Your code here
                    })     
                    
				})
			}
		})
	});

	app.post('/api/member/login', function(req, res) {
		func.checkDuplicate(models.User, ['email', 'password'], [req.body.email, req.body.password], function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's an account match
				var token = jwt.sign(req.body.email, jwtSecret);
				func.sendInfo(res, duplicateStatus,
					{data: token, errMessage: 'Account match!.'});
			} else {
				// No duplicate in mongo so no account matches
				func.sendInfo(res, duplicateStatus,
					{message: 'Email does not exist. Signup today!'});
			}
		})
	});

	app.post('/api/member/check-token', function(req, res) {
		var token = req.body.data;
		if(token !== false) {
			var decodedEmail = jwt.verify(token, jwtSecret);
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
