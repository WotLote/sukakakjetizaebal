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
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))
/*	.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-type, Accept,application/json");
		next();
	})*/
	.use(bodyParser.json())
/*	.post('/auth', function(req, res){
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
	})*/
const io = socketIO(server);

