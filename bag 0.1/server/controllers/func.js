var func = {};

func.checkDuplicate = function(model, field, value, callback) {
    var query = {};
    if(typeof(field) == 'object') {
        for(var i = 0; i < field.length; i++) {
            query[field[i]] = value[i];
        }
    } else {
        query[field] = value;
    }

    model.findOne(query, function(err, duplicate) {
        if(err) {callback(err);}
        if(duplicate) {
            callback(false);
        } else {
            callback(true);
        }
    })
}

func.addRecord = function(model, dataObj, callback) {
    var mod = new model();
    for (var prop in dataObj) {
        mod[prop] = dataObj[prop];
    }
    mod.save(function(err, user){
        if(err){
            callback(err);
        } else {
            callback(user);
        }
    })
}

func.updateRecord = function(model, selector, dataObj, callback) {
    query = {};
    query[selector.key] = selector.value;

    model.findOne(query, function(err, doc) {
        if(err) {
            callback(err);
        } else {
            for (var prop in dataObj) {
                if(prop !== '_id') {
                    doc[prop] = dataObj[prop];
                }
            }
            doc.save(function(err) {
                if(err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback(true);
                }
            })
        }

    });
}

func.getAddresses = function(model, query, callback) {
    model.find(query, {addresses: 1}, function(err, docs) {
        if(err) {callback(err);}
        if(docs) {
            callback(docs);
        } else {
            callback(false);
        }
    })
}

func.deleteAddress = function(model, query, value, callback) {
    console.log(value);
    model.findOne(query, function(err, doc) {
        doc.addresses.splice(value, 1)
        doc.save(function(err) {
            if(err) {
                console.log(err);
                callback(err);
            } else {
                callback(doc);
            }
        })
    });
}

func.updateArray = function(model, query, dataObj, callback) {
    var pushQuery = {};
    pushQuery[dataObj.key] = dataObj.value;
    model.findOneAndUpdate(query,
        {$push: pushQuery},
        { safe: true, upsert: true },
        function(err, model) {
            if(err) {callback(err);} else {
                callback(model);
            }
        });
}

func.sendInfo = function(res, status, dataObj) {
    //console.log(dataObj);
    if(dataObj.data) {
        var dataHold = dataObj.data;
    }
    if(status == true) {
        res.json({
            success: status,
            message: dataObj.message,
            data: dataHold
        })
    } else {
        res.json({
            success: status,
            message: dataObj.errMessage,
            data: dataHold
        })
    }
}

func.makeId = function(cb) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    cb(text);
}

func.sendEmail = function(sg, emailObj, cb) {
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: emailObj.toJSON(),
    });

    sg.API(request, function(error, response) {
        console.log(error);
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
}


module.exports = func;
