// Require Express
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');

var jwt = require('jsonwebtoken');
var jwtSecret 	= 'jwtSecretKey';

var Schema = require('schema-client')
var schemaCli = new Schema.Client('roristore', 'N3WPInduDyru4kkQWdFX23RZStSSNiog');



// DB
var mongoose        = require('mongoose');
// DB Collection
var User = require(__dirname + '/server/models/user');
// DB config
var configDB = require('./config/database.js');
// Connect DB
mongoose.connect(configDB.url);

var models = {};
models.User = User;

var cont = {};
cont.func = require('./server/controllers/func.js');

var libs = {};
libs.jwt = jwt;
libs.jwtSecret = jwtSecret;
libs.schemaCli = schemaCli;

// Set Port
app.set('port', (process.env.PORT || 5003));

// Set Web Visible Path
app.use(express.static(__dirname + '/public'));

// Need for Posting Data
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Get Server Side Main Index
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// routes
require(__dirname + '/server/routes')(app, models, cont, libs);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
