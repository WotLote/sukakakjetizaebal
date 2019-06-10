const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
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
	host: 'sql7.freemysqlhosting.net',
	user: 'sql7294860',
	password: '61Gyjn7u5x',
	database: 'sql7294860'
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



io.on('connection', (socket) => {
	io.emit('gg', ('gisnktqjmkn'))
	var handshakeData = socket.request;
	console.log("middleware:", handshakeData._query['foo']);
	var socketRoom = handshakeData._query['foo'];
	socket.join(socketRoom)

	console.log('connected')
	socket.on('auth', function(data){
	console.log('auth')

	console.log(socket.rooms)
		connect.query('SELECT * FROM account WHERE Login LIKE "'+ data.login +'"', function(error, result, field){
			if (error) {
				console.log(error)
			} else {
				if (result.length) {
					if (result[0].Password == data.password) {
						let token = jwt.sign(result[0].Login, secret)
						socket.emit('resAuth', {token, login: result[0].Login, account: result[0].Account, Name: result[0].Name, id: result[0].Id});
						connect.query('UPDATE account SET Token = "'+ token +'" WHERE Id LIKE '+ result[0].Id, function(error, result, field){
							if (error) {
								console.log(error)
							} else {
								
							}
						})
					}
				}
			}
		})
	})
	socket.on('authCheck', function(data){
		connect.query('SELECT * FROM account WHERE Login LIKE "'+ data.login +'"', function(error, result, field){
			if (error) {
				console.log(error)
			} else {
				if (data.token === result[0].Token){
					socket.emit('resAuthCheck', true)
				} else {
					socket.emit('resAuthCheck', false)

				}
			}
		})
	})

	socket.on('storageFindOne', (find) => {
		console.log(find)
		connect.query('SELECT * , manufacturers.Name as NameMF, type.Name as NameT, storage.Name as Name, storage.Id as Id FROM storage, type, manufacturers WHERE TypeId LIKE type.Id and ManufacturerId LIKE manufacturers.Id and fd LIKE 0 and Quantity NOT LIKE 0 and Count NOT LIKE 0 and (storage.Name LIKE "%'+find+'%" or Price LIKE "%'+find+'%" or Number LIKE "%'+find+'%" or Quantity LIKE "%'+find+'%")', (err, res) => {
			!err ? io.emit('resStorageFindOne', res) : console.log(err)
		})
	})

	socket.on('selectDarr', (id) => {
		connect.query('SELECT *,darr.Date as Date, darr.Id as Id, people.Name as NamePeo, providers.Name as NamePro FROM darr, people, providers WHERE people.Id LIKE PeopleId and providers.Id LIKE ProviderId and FF LIKE 1 and AccId LIKE '+ id,(err, res) => {
			if (err) console.log(err)
			else {
				darr = res;
				if (darr.length){
					connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ darr[0].Id, (err, res) => {
						!err ? io.to(socketRoom).emit('resInformationSelectDarr',{darr,res}) : console.log(err)
					})
				} else {
					io.to(socketRoom).emit('resInformationSelectDarr',{darr: [],res: []})
				}

			}
		})
	})
	socket.on('selectDreal', (id) => {
		connect.query('SELECT *, dreal.Id as Id FROM dreal, people WHERE people.Id LIKE PeopleId and FF LIKE 1 and AccId LIKE '+ id,(err, res) => {
			if (err) console.log(err,'1') 
			else {
				dreal = res;
				if (dreal.length){
						console.log(res,'111111111111111111111111111111111')
					connect.query('SELECT *, storage.Id as IdS, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ dreal[0].Id, (err, res) => {
						!err ? io.to(socketRoom).emit('resInformationSelectDreal',{dreal,res}) : console.log(err,'2')
					})
				} else {
					console.log('nkjmqknkmqjnkmqjntkmtnjqkmtnqjmkjnqtmknt')
					io.to(socketRoom).emit('resInformationSelectDreal',{dreal: [], res: []})
				}
			}
		})
	})
	socket.on('selectArrival', (Id) => {
		connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ Id, (err, res) => {
			!err ? io.to(socketRoom).emit('resInformationSelectArrival',res) : console.log(err)
		})
	})
	socket.on('selectReal', (Id) => {
		connect.query('SELECT *, storage.Id as IdS, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ Id, (err, res) => {
			console.log(res)
			!err ? io.to(socketRoom).emit('resInformationSelectReal', res) : console.log(err)
		})
	})

	socket.on('getInformation', function(obj, id){
		if (obj === "Tovars"){
			connect.query('SELECT *, manufacturers.Name as NameMF, type.Name as NameT, tovars.Name as Name, tovars.Id FROM tovars, manufacturers, type WHERE manufacturers.ID LIKE ManufacturerId and type.ID LIKE TypeId and fd LIKE 0 ORDER BY tovars.ID', function(error, result, field){
				if(error){
					console.log('26: error ', obj)
				}else{
					io.emit('resInformation'+obj, result, obj);
				}
			})
		} else if (obj === 'Manufacturers') {
			connect.query('SELECT * FROM manufacturers', function(error, result, field){
				if(error){
					console.log('26: error ', obj)
				}else{
					io.emit('resInformation'+obj, result, obj);
				}
			})
		} else if (obj === 'Providers'){
			connect.query('SELECT * FROM providers', function(error, result, field){
				if(error){
					console.log('26: error ', obj)
				}else{
					io.emit('resInformation'+obj, result, obj);
				}
			})
		} else if (obj === 'People'){
			connect.query('SELECT * FROM people', function(error, result, field){
				if(error){
					console.log('26: error ', obj)
				}else{
					io.emit('resInformation'+obj, result, obj);
				}
			})
		} else if (obj === 'Type'){
			connect.query('SELECT * FROM type', function(error, result, field){
				if(error){
					console.log('26: error ', obj)
				}else{
					io.emit('resInformation'+obj, result, obj);
				}
			})
		} else if (obj === 'Storage'){
			connect.query('SELECT * , manufacturers.Name as NameMF, type.Name as NameT, storage.Name as Name, storage.Id as Id FROM storage, type, manufacturers WHERE TypeId LIKE type.Id and ManufacturerId LIKE manufacturers.Id and fd LIKE 0 and Quantity NOT LIKE 0 and Count NOT LIKE 0', function(error, result, field){
				if(error){
					console.log('26: error ', error)
				}else{
					io.emit('resInformation'+obj, result, obj);
					console.log(result)
				}
			})
		} else if (obj === 'Arrival'){
			console.log(socket.rooms)
			connect.query('SELECT * FROM darr WHERE FF LIKE 0 and AccId LIKE '+ socketRoom, (err, res) => {
				if (!err && res.length) {
					var Number = res[0].Id
					connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ Number, (err, res) => {
						!err ? io.to(socketRoom).emit('resInformation', res, obj, {Number, Date: getDateNow()}) : console.log(err)
					})
				} else {
					console.log('gg')
					connect.query('INSERT INTO darr (Date, AccId) VALUES ("'+getDateNow()+'", "'+socketRoom+'")', (err, res) => {
					!err ? io.to(socketRoom).emit('resInformation', [], obj, {Number: res.insertId, Date: getDateNow()}) : console.log(err)
					})
				}
			})
		} else if (obj === 'Real'){
			console.log(socket.rooms)
			connect.query('SELECT * FROM dreal WHERE FF LIKE 0 and AccId LIKE '+ socketRoom, (err, res) => {
				if (!err && res.length) {
					var Number = res[0].Id
					connect.query('SELECT *, storage.Id as IdS, realt.Quantity as Quantity, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ Number, (err, res) => {
						!err ? io.to(socketRoom).emit('resInformation', res, obj, {Number, Date: getDateNow()}) : console.log(err)
					})
				} else {
					console.log('gg')
					connect.query('INSERT INTO dreal (Date, AccId) VALUES ("'+getDateNow()+'", "'+socketRoom+'")', (err, res) => {
					!err ? io.to(socketRoom).emit('resInformation', [], obj, {Number: res.insertId, Date: getDateNow()}) : console.log(err)
					})
				}
			})
		} else if (obj === 'StatisticsArrival'){
			var account, darr;
			connect.query('SELECT Account, Id, Name FROM account WHERE Account LIKE "user"',(err, res) => {
				if (err) console.log(err) 
				else {
					account = res;
					connect.query('SELECT *,darr.Date as Date, darr.Id as Id, people.Name as NamePeo, providers.Name as NamePro FROM darr,people, providers WHERE people.Id LIKE PeopleId and providers.Id LIKE ProviderId and FF LIKE 1 and AccId LIKE '+ res[0].Id,(err, res) => {
						if (err) console.log(err) 
						else {
							darr = res;
							connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ darr[0].Id, (err, res) => {
								!err ? io.to(socketRoom).emit('resInformation'+obj,{account,darr,res}, obj, {Number, Date: getDateNow()}) : console.log(err)
							})
						}
					})
				}
			})
		} else if (obj === 'StatisticsReal'){
			var account, dreal;
			connect.query('SELECT Account, Id, Name FROM account WHERE Account LIKE "user"',(err, res) => {
				if (err) console.log(err) 
				else {
					account = res;
					connect.query('SELECT *, dreal.Id as Id FROM dreal, people WHERE people.Id LIKE PeopleId and FF LIKE 1 and AccId LIKE '+ res[0].Id,(err, res) => {
						if (err) console.log(err) 
						else {
							dreal = res;
							connect.query('SELECT *, storage.Id as IdS, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ dreal[0].Id, (err, res) => {
								!err ? io.to(socketRoom).emit('resInformation'+obj,{account,dreal,res}, obj, {Number, Date: getDateNow()}) : console.log(err)
							})
						}
					})
				}
			})
		} 

	})

	socket.on('getInformationModal', function(text){
		if (text === "Manufacturers"){
			connect.query('SELECT * FROM manufacturers', function(error, result, field){
				if(error){
					console.log('38: error ',text)
				}else{
					io.emit('resInformationModal', result, text);
				}
			})
		} else if (text === "Type"){
			connect.query('SELECT * FROM type', function(error, result, field){
				if(error){
					console.log('46: error ',text)
				}else{
					io.emit('resInformationModal', result, text);
				}
			})
		} else if (text === "Tovars"){
			connect.query('SELECT *, manufacturers.Name as NameMF, type.Name as NameT, tovars.Name as Name, tovars.Id as Id FROM tovars, manufacturers, type WHERE manufacturers.ID LIKE ManufacturerId and type.ID LIKE TypeId and fd LIKE 0 ORDER BY tovars.ID', function(error, result, field){
				if(error){
					console.log('46: error ',text)
				}else{
					console.log('jnq;mj;njmq;tnmj')
					io.emit('resInformationModal', result, text);
				}
			})
		} else if (text === "People"){
			connect.query('SELECT * FROM people', function(error, result, field){
				if(error){
					console.log('46: error ',text)
				}else{
					io.emit('resInformationModal', result, text);
				}
			})
		} else if (text === "Providers"){
			connect.query('SELECT * FROM providers', function(error, result, field){
				if(error){
					console.log('46: error ',text)
				}else{
					io.emit('resInformationModal', result, text);
				}
			})
		} else if (text === "Storage"){
			connect.query('SELECT * , manufacturers.Name as NameMF, type.Name as NameT, storage.Name as Name, storage.Id as Id FROM storage, type, manufacturers WHERE TypeId LIKE type.Id and ManufacturerId LIKE manufacturers.Id and fd LIKE 0 and Quantity NOT LIKE 0 and Count NOT LIKE 0', function(error, result, field){
				if(error){
					console.log('26: error ', text)
				}else{
					io.emit('resInformationModal', result, text);
				}
			})
		}

			console.log('knjmqk')
	})

	socket.on('insertInTo', function(text, data) {
		if (text === 'Tovars'){
			connect.query('INSERT INTO tovars (Number, Name, Price, Unit, TypeId, ManufacturerId) VALUES ("'+ data.Number +'", "'+ data.Name +'", "'+ data.Price +'", "'+ data.Unit +'", "'+ data.TypeId +'", "'+ data.ManufacturerId +'")', function(error, result, field){
				if(error){
					console.log('Error INSERT INTO tovars' + error);
				}else{
					connect.query('SELECT *, manufacturers.Name as NameMF, type.Name as NameT, tovars.Name as Name, tovars.Id FROM tovars, manufacturers, type WHERE manufacturers.ID LIKE ManufacturerId and type.ID LIKE TypeId and fd LIKE 0 ORDER BY tovars.ID', function(error, result, field) {
						if(error){
							console.log('66: error ',text)
						}else{
							console.log(result)
							io.emit('resInformation'+ text, result, text);
						}
					})
				}
			})
			connect.query('INSERT INTO storage (Number, Name, Price, Unit, Quantity, TypeId, ManufacturerId, Count) VALUES ("'+ data.Number +'", "'+ data.Name +'", "'+ data.Price +'", "'+ data.Unit +'", 0 , "'+ data.TypeId +'", "'+ data.ManufacturerId +'", 0)', function(error, result, field){
				if(error){
					console.log('Error INSERT INTO storage');
				}else{
					console.log(result)
				}
			})
		} else if (text === 'Manufacturers'){
			console.log('manufacturers')
			connect.query('INSERT INTO manufacturers (Name, Site) VALUES ("'+ data.Name +'", "'+ data.Site +'")', function(error, result, field){
				if(error){
					console.log('Error INSERT INTO tovars' + error);
				}else{
					console.log('insert')
					connect.query('SELECT * FROM manufacturers', function(error, result, field) {
						if(error){

						}else{
							console.log('select', result, text)
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Type') {
			connect.query('INSERT INTO type (Name) VALUES ("'+ data.Name +'")', function(error, result, field){
				if(error){
					console.log('Error INSERT INTO tovars' + error);
				}else{
					console.log('insert')
					connect.query('SELECT * FROM type', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Providers') {
			connect.query('INSERT INTO providers (Name, Address, Tel, Email, Date, INN) VALUES ("'+ data.Name +'", "'+ data.Address +'", "'+ data.Tel +'", "'+ data.Email +'", "'+ data.Date +'", "'+ data.INN +'")', function(error, result, field){
				if(error){
					console.log('Error INSERT INTO tovars' + error);
				}else{
					console.log('insert')
					connect.query('SELECT * FROM providers', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'People') {
			connect.query('INSERT INTO people (Name, Address, Year, Ep, Num, Tel, Position) VALUES ("'+ data.Name +'", "'+ data.Address +'", "'+ data.Year +'", "'+ data.Ep +'", "'+ data.Num +'", "'+ data.Tel +'", "'+ data.Position +'")', function(error, result, field){
				if(error){
					console.log('Error INSERT INTO tovars' + error);
				}else{
					console.log('insert')
					connect.query('SELECT * FROM people', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Arrival') {
			var DateId = data.DateId;
				connect.query('SELECT * FROM arrivalt WHERE TovarId LIKE '+data.TovarId+' and DateId LIKE '+data.DateId, function(error, result, field) {
					if(error) {
						console.log(error);
					} else {
						if (result.length) {
							var Quan = +result[0].Quantity + +data.Quantity
							console.log(result)
							connect.query('UPDATE arrivalt SET Quantity = '+Quan+' WHERE Id LIKE '+result[0].Id, function(error, result, field){
								if(error){
									console.log('Error UPDATE arrivalt' + error);
								}else{
									connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ data.DateId, (err, res) => {
										!err ? io.to(socketRoom).emit('resInformation', res, text, {Number: data.DateId, Date: getDateNow()}) : console.log(err)
									})
								}
							})
						} else {
							connect.query('INSERT INTO arrivalt (TovarId, Quantity, DateId) VALUES ("'+ data.TovarId +'", "'+ data.Quantity +'", "'+ data.DateId +'")', function(error, result, field){
								if(error){
									console.log(error);
								}else{
									connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ data.DateId, (err, res) => {
										!err ? io.to(socketRoom).emit('resInformation', res, text, {Number: data.DateId, Date: getDateNow()}) : console.log(err)
									})
								}
							})
						}
					}
				})
		} else if (text === 'Real') {
			console.log(data)
			var DateId = data.DateId;
				connect.query('SELECT * FROM storage WHERE Id LIKE '+ data.StorageId, (err, res) => {
					if (err){
						console.log(err)
					} else {
						console.log(+res[0].reserved + +data.Quantity , res[0].Quantity)
						if(+res[0].reserved + +data.Quantity < res[0].Quantity || +res[0].reserved + +data.Quantity == res[0].Quantity){
							connect.query('SELECT * FROM realt WHERE StorageId LIKE '+data.StorageId+' and DateId LIKE '+data.DateId, function(error, result, field) {
								if(error) {
									console.log(error);
								} else {
									console.log(result)
									if (result.length) {
										var Quan = +result[0].Quantity + +data.Quantity
										console.log(result)
										connect.query('UPDATE realt SET Quantity = '+Quan+' WHERE Id LIKE '+result[0].Id, function(error, result, field){
											if(error){
												console.log('Error UPDATE realt' + error);
											}else{
												connect.query('SELECT *, storage.Id as IdS, realt.Quantity as Quantity, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ data.DateId, (err, res) => {
													console.log(res)
													!err ? io.to(socketRoom).emit('resInformation', res, text, {Number: data.DateId, Date: getDateNow()}) : console.log(err)
												})
											}
										})
									} else {
										connect.query('INSERT INTO realt (StorageId, Quantity, DateId) VALUES ("'+ data.StorageId +'", "'+ data.Quantity +'", "'+ data.DateId +'")', function(error, result, field){
											if(error){
												console.log(error);
											}else{
												console.log(data.DateId)

												connect.query('SELECT *, storage.Id as IdS, realt.Quantity as Quantity, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ data.DateId, (err, res) => {
													!err ? io.to(socketRoom).emit('resInformation', res, text, {Number: data.DateId, Date: getDateNow()}) : console.log(err)
												})
											}
										})
									}
								}
							})
							var Quan = +res[0].reserved + +data.Quantity;
							connect.query('UPDATE storage SET reserved = '+ Quan +' WHERE Id LIKE ' +data.StorageId, (err, res) => {
								if (err){
									console.log(err)
								} else {
									console.log(res, 'gg')
								}
							})
					}
				}
			})
		} else if (text === 'StorageFromArrival') {
			let dataLet = data.data;
			console.log(data)
			function gg(i){

				connect.query('SELECT * FROM storage WHERE Id LIKE "'+ dataLet[i].Id+'"', function(error, result){
					if(error){
						console.log(error);
					}else{
						var item = result[0]
						var Quan = +item.reserved - +dataLet[i].Quantity;
						connect.query('UPDATE storage SET Quantity = '+(+item.Quantity + +dataLet[i].Quantity)+', Count = '+ (+item.Count + +dataLet[i].Count)+' WHERE Id LIKE "'+ dataLet[i].Id+'"', function(error, result){
								if(error){
									console.log(error)
								}else{
								
								}
						})
					}
				})
			}
			connect.query('UPDATE darr SET FF = 1 , PeopleId = '+data.people+', Date = "'+getDateNow()+'", ProviderId = "'+data.Provider+'" WHERE Id LIKE "'+ data.DateId +'"')

			var chain = Promise.resolve();
			for (var i = 0; i <= dataLet.length - 1; i++) {
				chain = chain.then( gg(i));
			}

			chain.then(() => {
				connect.query('INSERT INTO darr (Date, AccId) VALUES ("'+getDateNow()+'", "'+socketRoom+'")', (err, res) => {
					!err ? io.to(socketRoom).emit('resInformation', [], 'Arrival', {Number: res.insertId, Date: getDateNow()}) : console.log(err)
				})
			})


		} else if (text === 'StorageFromReal') {
			let dataLet = data.data;
			console.log(data)
			function gg(i){

				connect.query('SELECT * FROM storage WHERE Id LIKE "'+ dataLet[i].Id+'"', function(error, result){
					if(error){
						console.log(error);
					}else{
						var item = result[0]
						var Quan = +item.reserved - +dataLet[i].Quantity;

						connect.query('UPDATE storage SET Quantity = '+(+item.Quantity - +dataLet[i].Quantity)+', Count = '+ (+item.Count - +dataLet[i].Count)+', reserved = '+ Quan +' WHERE Id LIKE "'+ dataLet[i].Id+'"', function(error, result){
								if(error){
									console.log(error)
								}else{
								
								}
						})

					}
				})
			}
			connect.query('UPDATE dreal SET FF = 1 , peopleId = '+data.people+', Date = "'+getDateNow()+'" WHERE Id LIKE "'+ data.DateId +'"')

			var chain = Promise.resolve();
			for (var i = 0; i <= dataLet.length - 1; i++) {
				chain = chain.then( gg(i));
			}

			chain.then(() => {
				connect.query('INSERT INTO dreal (Date, AccId) VALUES ("'+getDateNow()+'", "'+socketRoom+'")', (err, res) => {
					!err ? io.to(socketRoom).emit('resInformation', [], 'Real', {Number: res.insertId, Date: getDateNow()}) : console.log(err)
				})
			})


		}
	})

	socket.on('deleteFrom', function(text, id){
		if (text === 'Tovars'){
			console.log(id)
			connect.query('UPDATE tovars SET fd = 1 WHERE Id LIKE '+ id, function(error, result){
				if(error){
					console.log(error)
				}else{
					connect.query('SELECT *, manufacturers.Name as NameMF, type.Name as NameT, tovars.Name as Name, tovars.Id FROM tovars, manufacturers, type WHERE manufacturers.ID LIKE ManufacturerId and type.ID LIKE TypeId and fd LIKE 0 ORDER BY tovars.ID', function(error, result, field) {
						if(error){
							console.log('66: error ',text)
						}else{
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
			connect.query('UPDATE storage SET fd = 1 WHERE Id LIKE '+ id, function(error, result){
				if(error){
					console.log(error)
				}else{

				}
			})
		} else if (text === 'Manufacturers') {
			connect.query('DELETE FROM manufacturers WHERE Id LIKE '+ id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('delete')
					connect.query('SELECT * FROM manufacturers', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Type') {
			connect.query('DELETE FROM type WHERE Id LIKE '+ id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('delete')
					connect.query('SELECT * FROM type', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Providers') {
			connect.query('DELETE FROM providers WHERE Id LIKE '+ id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('delete')
					connect.query('SELECT * FROM providers', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'People') {
			connect.query('DELETE FROM people WHERE Id LIKE '+ id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('delete')
					connect.query('SELECT * FROM people', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Arrival') {
			connect.query('DELETE FROM arrivalt WHERE Id LIKE '+ id.id, function(error, result){
				if(error){
					console.log(error)
				}else{
					connect.query('SELECT *, tovars.Id as IdT, arrivalt.Id as Id FROM arrivalt, tovars WHERE tovars.Id LIKE TovarId and DateId LIKE '+ id.DateId, (err, res) => {
						!err ? io.to(socketRoom).emit('resInformation'+text, res, text, {Number: id.DateId, Date: getDateNow()}) : console.log(err)
					})
				}
			})
		} else if (text === 'Real') {
			
			connect.query('SELECT * FROM storage WHERE Id LIKE '+ id.IdS, (err, res) => {
				if (err){
					console.log(err)
				} else {
					connect.query('DELETE FROM realt WHERE Id LIKE '+ id.id, function(error, result){
						if(error){
							console.log(error)
						}else{
							connect.query('SELECT *, storage.Id as IdS, realt.Quantity as Quantity, realt.Id as Id FROM realt, storage WHERE storage.Id LIKE StorageId and DateId LIKE '+ id.DateId, (err, res) => {
								!err ? io.to(socketRoom).emit('resInformation', res, text, {Number: id.DateId, Date: getDateNow()}) : console.log(err)
							})
						}
					})
					let reserved = res[0].reserved - id.Quan;
					connect.query('UPDATE storage SET reserved = '+ reserved +' WHERE Id LIKE '+ id.IdS , function(error, result){
						if(error){
							console.log(error)
						}else{
						}
					})
				}


			})
		}
	})

	socket.on('update', function(text, data) {
		if (text === 'Tovars'){
			connect.query('UPDATE tovars SET Number = "'+data.Number+'", Name = "'+data.Name+'", Price = "'+data.Price+'", Unit = "'+data.Unit+'", TypeId = '+data.TypeId+', ManufacturerId = '+data.ManufacturerId+' WHERE Id LIKE '+ data.Id, function(error, result){
				if(error){
					console.log(error)
				}else{
					connect.query('SELECT *, manufacturers.Name as NameMF, type.Name as NameT, tovars.Name as Name, tovars.Id FROM tovars, manufacturers, type WHERE manufacturers.ID LIKE ManufacturerId and type.ID LIKE TypeId and fd LIKE 0 ORDER BY tovars.ID', function(error, result, field) {
						if(error){
							console.log('66: error ',text)
						}else{
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Manufacturers'){
			connect.query('UPDATE manufacturers SET Name = "'+data.Name+'", Site = "'+data.Site+'" WHERE Id LIKE '+ data.Id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('update')
					connect.query('SELECT * FROM manufacturers', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Type') {
			connect.query('UPDATE type SET Name = "'+data.Name+'" WHERE Id LIKE '+ data.Id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('update')
					connect.query('SELECT * FROM type', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'Providers') {
			connect.query('UPDATE providers SET Name = "'+data.Name+'", Address = "'+data.Address+'" , Tel = "'+data.Tel+'" , Email = "'+data.Email+'" , Date = "'+data.Date+'" , INN = "'+data.INN+'" WHERE Id LIKE '+ data.Id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('update')
					connect.query('SELECT * FROM providers', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		} else if (text === 'People') {
			connect.query('UPDATE people SET Name = "'+data.Name+'", Address = "'+data.Address+'", Year = "'+data.Year+'", Ep = "'+data.Ep+'", Num = "'+data.Num+'", Tel = "'+data.Tel+'", Position = "'+data.Position+'" WHERE Id LIKE '+ data.Id, function(error, result){
				if(error){
					console.log(error)
				}else{
					console.log('update')
					connect.query('SELECT * FROM people', function(error, result, field) {
						if(error){

						}else{
							console.log('select')
							io.emit('resInformation'+text, result, text);
						}
					})
				}
			})
		}

	})


		socket.on('statistic', function(min, max){
		console.log(min);
		console.log(max);
		async function realS(){
			connect.query('SELECT * FROM dreal WHERE FF LIKE 1', function(error, result, field){
				if(error){
					console.log(error)
				}else{
					var resultSDreal = result;
					connect.query('DELETE FROM session',function(error, result, field){
						if (error){
							console.log('error from delete session 2');
						} else {
							result = resultSDreal;
							for (var i = 0; i < result.length; i++) {
								var per = result[i].Date;
								var DateReal = per[3] + per[4] + per[0] + per[1];

								if (DateReal >= min & DateReal <= max) {
									connect.query('INSERT INTO session (DateId) VALUES ('+result[i].Id+')', function(error, result, field){
										if(error){
											console.log(error)
										}else{
										}
									})
								} 
							}
							connect.query('SELECT *,session.DateId, realt.DateId FROM session, realt WHERE realt.DateId LIKE session.DateId', function(error, result, field){
								if(error){
									console.log('error select session and realt',error);
								} else {
									console.log(result,'untbmjqnkqjsknjqsnkt')
									console.log('result select session and realt',result);
									var resultSReal = result;
									connect.query('SELECT * FROM tovars', function(error, result, field){
										if(error){
											console.log('error select tovars for session 2');
										} else {
											ggg2(result,resultSReal);

											/*for (var i = 0; i < result.length; i++) {
												for (var j = 0; j < resultSReal.length;j++) {

															gg2(j,i, result,resultSReal,resultTovar);


												}
											}*/

										}
									})
								}
							})
							
						}
					})
				}
			})
		}
		function updateSt(){
			connect.query('SELECT * FROM statistics', function(error, result, field){
				if(error){
					console.log(error);
				} else {
					for (var i = 0; i < result.length; i++) {
					var residue = +result[i].QA - +result[i].QR;
						connect.query('UPDATE statistics SET residue = '+ residue +' WHERE Id LIKE '+ result[i].Id, function(error, result, field){
							if(error){
								console.log(error);
							} else {
							}
						})
					}
								connect.query('SELECT *, tovars.Id FROM statistics, tovars WHERE tovars.Id LIKE TovarId', function(error, result, field){
									if(error){
										console.log(error);
									} else {
										socket.emit('resStatistics', result);
									}
								})
				}
			})
		}
		function select2(j,i, result,resultSReal, resultTovar){
			return new Promise(resolve => 
			connect.query('SELECT * FROM statistics WHERE TovarId LIKE '+ result[i].Id, function(error, result, field){
				if(error){
					console.log('error ')
				} else {
					//chain2.then( gv2(j,i, result,resultSReal, resultTovar));
					if(result.length){
						var QuantityCount = +result[0].QR + +resultSReal[j].Quantity;
						console.log(QuantityCount,'1');
						connect.query('UPDATE statistics SET QR = statistics.QR + '+resultSReal[j].Quantity+' WHERE statistics.TovarId LIKE '+resultTovar.Id+' and Id LIKE '+result[0].Id, function(error, result, field){
							if(error){
								console.log('error UPDATE into statistics 2',error);
							} else {
								//console.log('result',result);
								resolve();
								
							}
						})
					} else {
						connect.query('INSERT INTO statistics (TovarId, QR) VALUES ('+resultTovar.Id+','+resultSReal[j].Quantity+')', function(error, result, field){
							if(error){
								console.log('error insert into statistics 2');
							} else {
								//console.log('result',result);
								resolve()
								
							}
						})
					}
				
				}
			})
			);
		}

		async function gg2(j,i, result,resultSReal){
			  if (result[i].Id === resultSReal[j].StorageId){
					var resultTovar = result[i];
						await select2(j,i, result,resultSReal, resultTovar)

			}
		}
		async function ggg2(result,resultSReal){
			for (var i = 0; i < result.length; i++) {
				for (var j = 0; j < resultSReal.length;j++) {
					await gg2(j,i, result,resultSReal);
				}

				console.log('for closed')
			}
			await updateSt();
			
		}

		function select1(j,i, result,resultSArr,resultTovar){

			return new Promise(resolve => 
				connect.query('SELECT * FROM statistics WHERE TovarId LIKE '+ result[i].Id, function(error, result, field){
					if(error){
						console.log('error ')
					} else {
						console.log('select statistics')
						
						if(result.length){
							var QuantityCount = +result[0].QA + +resultSArr[j].Quantity;
							console.log(QuantityCount,'1');
							connect.query('UPDATE statistics SET QA = statistics.QA + '+resultSArr[j].Quantity+' WHERE statistics.TovarId LIKE '+resultTovar.Id+' and Id LIKE '+result[0].Id, function(error, result, field){
								if(error){
									console.log('error UPDATE into statistics',error);
								} else {
									//console.log('result',result);
									resolve();
									
								}
							})
						} else {
							connect.query('INSERT INTO statistics (TovarId, QA) VALUES ('+resultTovar.Id+','+resultSArr[j].Quantity+')', function(error, result, field){
								if(error){
									console.log('error insert into statistics');
								} else {
									//console.log('result',result);
									resolve();
									
								}
							})
						}
					}
				})

			)
		}
		async function gg1(j,i, result,resultSArr){
			  if (result[i].Id === resultSArr[j].TovarId){
					var resultTovar = result[i];
						await select1(j,i, result,resultSArr, resultTovar)
			}
		}
		async function ggg1(result,resultSArr){
			for (var i = 0; i < result.length; i++) {
				for (var j = 0; j < resultSArr.length;j++) {
					await gg1(j,i, result,resultSArr);

				}
				console.log('for closed')
			}
			await realS();

			//await updateSt();


		}
		/*arrivalt*/
		connect.query('delete from statistics', function(error, result, field){
			if(error){

			} else {
				
			}
		})
		connect.query('SELECT * FROM darr WHERE FF LIKE 1', function(error, result, field){
			if(error){
				console.log(error)
			}else{
				var resultSdarr = result;
				connect.query('DELETE FROM session',function(error, result, field){
					if (error){
						console.log('error from delete session');
					} else {
						console.log('delete session true');
						result = resultSdarr;
						for (var i = 0; i < result.length; i++) {
							var per = result[i].Date;
							var DateArr = per[3] + per[4] + per[0] + per[1];


							if (DateArr >= min & DateArr <= max) {
								console.log('datearr <>', DateArr)
								connect.query('INSERT INTO session (DateId) VALUES ('+result[i].Id+')', function(error, result, field){
									if(error){
										console.log(error)
									}else{
										console.log('insert into session true')
									}
								})
							} 
						}
						connect.query('SELECT *,session.DateId, arrivalt.DateId FROM session, arrivalt WHERE arrivalt.DateId LIKE session.DateId', function(error, result, field){
							if(error){
								console.log('error select session and arrivalt',error);
							} else {
								var resultSArr = result;
								connect.query('SELECT * FROM tovars', function(error, result, field){
									if(error){
										console.log('error select tovars for session');
									} else {
										ggg1(result,resultSArr);
/*										for (var i = 0; i < result.length; i++) {
											for (var j = 0; j < resultSArr.length; j++) {
												if (result[i].Id === resultSArr[j].TovarId){
													console.log(result[i].Id, ' ',resultSArr[j].Quantity);

													//chain1 = chain1.then( gg1(j,i, result,resultSArr));
													
													connect.query('INSERT INTO statistics (TovarId, QA) VALUES ('+result[i].Id+','+resultSArr[j].Quantity+')', function(error, result, field){
														if(error){
															console.log('error insert into statistics');
														} else {
															console.log(result);
														}
													})
												}
											}
										}*/
										
										

									

									}
								})
							}
						})
						
					}
				})
			}
		})

	})

});
