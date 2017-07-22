const express = require('express')
const app = express()

const {DATABASE_URL, PORT} = require('./config')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

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
app.use(jsonParser)
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use('/users', upInRouter) //provides user api route, updated /users will update the path that the api will require
app.use('/entry', entryRouter)


let server;


app.post('/login', (req, res, next) => {
	console.log(req.body)
	passport.authenticate(('basic'), (err, user, info) => {
		console.log(user)
		if (err){
			console.log('immediate error')
			return next(err)
		}

		if (!user){
			console.log('no user')
			return res.status(401).json({err: info})
		}

		req.login(user, (err) => {
			if (err){
				console.log('error logging in')
				return res.status(500).json({
					err: "Could not log in user"
				})
			}

			res.status(200).json({
				status: 'Login successfull'
			})
		})
	})(req, res, next)
})

// app.post('/login', passport.authenticate('basic', {session: true}), function(req, res){
// 	console.log(req)
// 	res.redirect('/journal/index.html')
// })

app.get('/logout', (req, res) => {
	req.logOut()
	return res.status(200).json({status: 'Logout successfull'})

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