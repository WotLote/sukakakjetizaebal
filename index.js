const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.get('/', (req, res) => res.sendFile(index))
	.use(bodyParser.json())
	.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-type, Accept,application/json");
		next();
	})
	.post('/auth', function(req, res){
		const data = req.body;
		connect.query('SELECT * FROM account WHERE Login LIKE "'+ data.login +'"', function(error, result, field){
			if (error) {
				console.log(error)
			} else {
				if (data.token === result[0].Token){
					res.json({res: true})
					console.log(result)
				} else {
					res.json({res: false})
					console.log(result)
				}
			}
		})
	})
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))
const io = socketIO(server);


const secret = 'ggwp'

const connect = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'st'
});

getDateNow = () => {
	var date = new Date(); 
	var day = date.getDate();
	if (day<10) day='0'+day; 
	var month = date.getMonth() + 1;
	if (month<10) month='0'+month; 
	var year = date.getFullYear(); 
	return day + '.' + month + '.' + year; 
}

connect.connect(function(error) {
	if(error) {
		console.log('Error connect to DateBase: ' + error);
	} else {
		console.log('Connected to DateBase');
	}
});

connect.query("SET SESSION wait_timeout = 604800");
