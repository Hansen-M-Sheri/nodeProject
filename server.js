const express = require('express');
const app = express();
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var expressValidator = require('express-validator');
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO.TOKEN);

var session; //global

require('dotenv').config();
var http = require('http');
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(expressValidator());
app.use(session({
  	name: 'server-session-cookie-id',
  	secret: 'my secret is secret',
  	saveUnititialized: true,
  	resave: true,
  	store: new FileStore()
  }))
app.use(require('./routes'));


// Start the server running
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


