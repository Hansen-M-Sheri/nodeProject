var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});
//Middle ware is specific to this router

//home page route
router.get('/', (req, res) => res.sendFile('public/login.html', {root:__dirname}));
router.get('/getUser', getUser);
router.get('/topics', getAllTopics);
router.get('/getCountScriptures', getCountScriptures);
router.get('/getScriptureByID', getScriptureByID);

router.post('/logout', logout);
router.post('/login', login);

router.get('/notification', function(req, resp){
	resp.sendFile('notification.html', {root:__dirname});
})

function logout(req,res){
	if (req.session.username){
  		req.session.destroy(function(err){
  			if(err) throw err;
  			res.json({success:true});
  		})
  	}
  	else{
  		res.json({success: false});
  	}
}

function login(req, res) {
	console.log("loginFunction line 32 called");
	if(req.body.username == 'admin' && req.body.password == 'password'){
  		req.session.username = req.body.username;
  		req.session.views = 2;
  		res.json({success:true});
  	}
  	else{
  		res.json({success:false});
  	}
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