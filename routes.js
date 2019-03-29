var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});
var client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
//Middle ware is specific to this router

//home page route
router.get('/', (req, res) => res.sendFile('public/login.html', {root:__dirname}));
router.get('/getUser', getUser);
router.get('/topics', isAuthenticated, getAllTopics);
router.get('/getCountScriptures', getCountScriptures);
router.get('/getScriptureByID', getScriptureByID);
router.get('/notification', function(req, resp){
	resp.sendFile('notification.html', {root:__dirname});
})
router.get('/testTwilio', function(req, res){
	client.messages
	.create({
		to: '+12087618466',
		from: '+12083142782',
		body: 'Test twilio message'
	}, function(err, data){
		if(err){ console.log(err);}
		// console.log(data);
	});
	// .then(message => console.log("twilio msg: " + message.sid));
	res.redirect('notification.html');
})
router.post('/logout', logout);
router.post('/login', login);
router.post('/signup', signup);



function isAuthenticated(req, res, next){
	console.log(req.session.username);
	console.log(req.session.id);
	if(req.session.username != null && req.session.id != null){
		return next();
	} 
	else {
		res.redirect('/');
	}
}

function logout(req,res){
	if (req.session.username){
  		req.session.destroy(function(err){
  			if(err) throw err;
  			res.sendFile('login.html', {root:__dirname});
  		})
  	}
  	else{
  		res.json({success: false});
  	}
}

function signup(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var phone = req.body.phone;
// console.log("Params: "+ username + password + telephone);
	var hashedPassword = bcrypt.hashSync(password);
	var sql = 'INSERT INTO scripture.user(username, password, phone) VALUES ($1, $2, $3)';
	var params = [username, hashedPassword, phone];
	pool.query(sql, params, function(err, result){
		if(err){
			res.status(400).send("Error: " + err);
		}
		else{
			res.status(204).send({success: true});
		}
	})
}

function login(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	console.log("LOGIN():68 username/password:" + username + " " + password);
	var sql = 'SELECT id, username, password FROM scripture.user WHERE username=$1::text';
	var params = [username];

	pool.query(sql, params, function (err, data){
		console.log(data.rows[0]['username']);
		if(err){
			//authentication error
			res.status(400).send("An unkown error occurred");
		}
		else {
			bcrypt.compare(password, data.rows[0]['password'], function(err, result){
				if(!result){
					//issue with password or username
					res.status(401).send("The username or password is incorrect");
				}
				else {
					var id = data.rows[0]['id'];
					var username = data.rows[0]['username'];
					//begin session and return data
					req.session.userid = id;
					req.session.username = username;
					res.status(200).send({id: id, username: username, success: true});
				}
			})
		}
	}) 
	// console.log(username + " " + password);
	// if(username == 'admin' && password == 'password'){
 //  		req.session.username = username;
 //  		req.session.views = 2;
 //  		res.json({success:true});
 //  	}
 //  	else{
 //  		res.json({success:false});
 //  	}
}

function getUser(req, res){
	console.log("Getting user info");

	const id = req.query.id;
	console.log(id);
	const sql = 'SELECT * FROM scripture.user WHERE id = $1::int';
	const params = [id];

	pool.query(sql, params, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		res.status(200).send(json);
	})
}

function getAllTopics(req, res){
	console.log("Getting all topics");

	const sql = 'SELECT name FROM scripture.topic;';

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		res.status(200).send(json);
	})
}
//Get topic by id
function getReferencesByTopic(req, res){
	console.log("Getting all references by topic with id: " + id);

	const sql = 'SELECT name FROM scripture.topic;';

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		res.status(200).send(json);
	})
}

function getCountScriptures(req, res){
	console.log("Getting total number of scriptures in db");

	const sql = 'SELECT COUNT(*) FROM scripture.scripture;';

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		res.status(200).send(json);
	})
}

function getScriptureByID(req, res){
	console.log("Getting info for scripture id: " + req.query.id);
	var id = req.query.id;
	const sql = 'SELECT * FROM scripture.scripture WHERE id ='+id;

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		res.status(200).send(json);
	})
}

module.exports = router;