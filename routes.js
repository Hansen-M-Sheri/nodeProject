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
router.get('/getUserPhone', getUserPhone);
// router.get('/getPhone', getPhone);
router.get('/topics', isAuthenticated, getAllTopics);
router.get('/getCountScriptures', getCountScriptures);
router.get('/getScriptureByID', getScriptureByID);
router.get('/getNumScripturesByTopicID', getNumScripturesByTopicID);
router.get('/getTopicIDByName', getTopicIDByName);
// router.get('/getScriptureRefById', getScriptureRefById);
router.get('/notification', function(req, resp){
	resp.sendFile('notification.html', {root:__dirname});
})
router.get('/twilio', sendTwilioMsg);


router.post('/logout', logout);
router.post('/login', login);
router.post('/signup', signup);

// function getPhone(req, res){
// 	console.log("Enter GetPhone");
// 	if (req.session.phone){
// 		console.log("Exit getPhone, phone is : " + req.session.phone);
//   		res.json({success: true, phone: req.session.phone});
//   	}
//   	else{
//   		console.log("Exit getPhone, no session");
//   		res.json({success: false});
//   	}
// }

function sendTwilioMsg(req, res){
	console.log("Enter sendTwilioMsg");
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
	console.log("Exit sendTwilioMsg, msg sent");
	res.redirect('notification.html');
}

function isAuthenticated(req, res, next){
	console.log("Enter isAuthenticated");
	console.log(req.session.username);
	console.log(req.session.id);
	if(req.session.username != null && req.session.id != null){
		console.log("Exit isAuthenticated, success");
		return next();
	} 
	else {
		console.log("Exit isAuthenticated, no authentication");
		res.redirect('/');
	}
}

function logout(req,res){
	console.log("Enter logout");
	if (req.session.username){
  		req.session.destroy(function(err){
  			if(err) throw err;
  			console.log("Exit logout, success");
  			res.sendFile('login.html', {root:__dirname});
  		})
  	}
  	else{
  		console.log("Exit logout, no session");
  		res.json({success: false});
  	}
}

function signup(req, res){
	console.log("Enter signup");
	var username = req.body.username;
	var password = req.body.password;
	var phone = req.body.phone;
// console.log("Params: "+ username + password + telephone);
	var hashedPassword = bcrypt.hashSync(password);
	var sql = 'INSERT INTO scripture.user(username, password, phone) VALUES ($1, $2, $3) RETURNING id';
	var params = [username, hashedPassword, phone];
	pool.query(sql, params, function(err, data){
		console.log("Line 77:" + data);
		if(err){
			console.log("Exit signup with error");
			res.status(400).send("Error: " + err);
		}
		else{
			console.log("Exit signup, success!");
			res.status(200).send({success: true});
		}
	})
}

function login(req, res) {
	console.log("Enter login");
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
					console.log("Exit login");
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

function getUserPhone(req, res){
	console.log("Enter getUserPhone");

	const id = req.session.userid;
	console.log("SessionID = " + id);
	const sql = 'SELECT phone FROM scripture.user WHERE id = $1::int';
	const params = [id];

	pool.query(sql, params, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			// callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		console.log("Exit getUserPhone");
		res.status(200).send(json);
	})
}
function getTopicIDByName(req, res){
	console.log("Enter getTopicIDByName");
	var name = req.query.name;
	const sql = 'SELECT id FROM scripture.topic WHERE name =' + name;
	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			// callback(err, null);
		}

		// console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		console.log("Exit getTopicIDByName");
		res.status(200).send(json);
	})

}

function getAllTopics(req, res){
	console.log("Enter getAllTopics : req = " + req);

	const sql = 'SELECT name, id FROM scripture.topic;';

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			// callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		console.log("Exit getAllTopics");
		res.status(200).send(json);
	})
}
//Get topic by id
function getReferencesByTopic(req, res){
	console.log("Enter getReferencesByTopic");
	console.log("Getting all references by topic with id: " + id);

	const sql = 'SELECT name FROM scripture.topic;';

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			// callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		console.log("Exit getReferencesByTopic");
		res.status(200).send(json);
	})
}

function getCountScriptures(req, res){
	console.log("Enter getCountScriptures");
	console.log("Getting total number of scriptures in db");

	const sql = 'SELECT COUNT(*) FROM scripture.scripture;';

	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			// callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		console.log("Exit getCountScriptures");
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
			// callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows);
		res.status(200).send(json);
	})
}
function getNumScripturesByTopicID(req, res){
	console.log("Enter getNumScripturesByTopicID");
	var id = req.query.id;
	const sql = "SELECT COUNT(*) FROM scripture.scripturextopic WHERE topicid ="+ id;
	pool.query(sql, function(err, result){
		if (err) {
			console.log("Error in query: " + err);
			// callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));
		var json = JSON.stringify(result.rows[0].count);
		console.log("Exit getNumScripturesByTopicID");
		res.status(200).send(json);
	})
}


// function getScriptureRefById(req, res){
// 	var id = req.query.id;
// 	const sql = 'SELECT * FROM scripture.scripture WHERE id ='+id;

// 	pool.query(sql, function(err, result){
// 		if (err) {
// 			console.log("Error in query: " + err);
// 		}

// 		console.log("Found result: " + JSON.stringify(result.rows));
// 		var json = JSON.stringify(result.rows);
// 		res.status(200).send(json);
// 	})
// }


module.exports = router;