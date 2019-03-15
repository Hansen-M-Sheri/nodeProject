const express = require('express');
const app = express();



 require('dotenv').config();
var http = require('http');
const { Pool } = require('pg');

// var router = express.Router();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res)=> {
  	res.sendFile(__dirname + '/public/scriptureOfDay.html')
  })

app.get('/getUser', getUser);
app.get('/getAllTopics', getAllTopics);
app.get('/getCountScriptures', getCountScriptures);
app.get('/getScriptureByID', getScriptureByID);

// app.get('/getUser', function(req, res){
// 	res.send("WHEEE");
// });

// Start the server running
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function getUser(req, res){
	console.log("Getting user info");

	const id = req.query.id;
	console.log(id);
	const sql = 'SELECT * FROM public.user WHERE id = $1::int';
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

	const sql = 'SELECT name FROM public.topic;';

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

	const sql = 'SELECT name FROM public.topic;';

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

	const sql = 'SELECT COUNT(*) FROM public.scripture;';

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
	const sql = 'SELECT * FROM public.scripture WHERE id ='+id;

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

