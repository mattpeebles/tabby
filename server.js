const express = require('express')
const app = express()

const {DATABASE_URL, PORT} = require('./config')

const bodyParser = require('body-parser')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const passport = require('./passportModule')

const morgan = require('morgan')
const session  = require('express-session')

const upInRouter = require('./upInRouter')
const entryRouter = require('./entryRouter')

app.use(express.static('public'))
app.use('/resources', express.static('resources'))
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({extended: true}))
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use('/users', upInRouter) //provides user api route, updated /users will update the path that the api will require
app.use('/entry', entryRouter)

let server;

app.post('/login', passport.authenticate('local'), function(req, res){
	res.redirect('/journal/index.html')
})

function runServer(databaseUrl = DATABASE_URL, port=PORT){
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, {useMongoClient: true}, err => {
			if (err){
				return reject(err)
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`)
				resolve()
			})
			.on('error', err => {
				mongoose.disconnect()
				reject(err)
			})
		})
	})
}

function closeServer(){
	return mongoose.disconnect().then(() => {
		return new Promise ((resolve, reject) => {
			console.log('Closing Server')
			server.close(err => {
				if (err){
					return reject(err)
				}
				resolve()
			})
		})
	})
}

if (require.main === module) {
	runServer().catch(err => console.error(err))
}

module.exports = {app, runServer, closeServer}