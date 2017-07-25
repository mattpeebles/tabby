const express = require('express')
const app = express()

const {DATABASE_URL, PORT} = require('./config')
const {Users, Entry} = require('./models')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const {passport, authorize} = require('./passportModule')

const morgan = require('morgan')
const session  = require('express-session')
const userRouter = require('./userRouter')
const entryRouter = require('./entryRouter')


app.use(jsonParser)

app.use(express.static('public'))
app.use('/resources', express.static('resources'))
app.use(require('cookie-parser')())
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { secure : false, maxAge : (4 * 60 * 60 * 1000)} }))
app.use('/users', userRouter) //provides user api route, updated /users will update the path that the api will require
app.use('/entry', entryRouter)
app.use(passport.initialize())
app.use(passport.session())




let server;

app.post('/login', function handleLocalAuthentication(req, res, next) {
    passport.authenticate('local', function(err, user, info) {  
        if (err) return next(err);
        if (!user) {
            return res.status(403).json({
                message: "no user found"
            });
        }

        // Manually establish the session...
        req.login(user, function(err) {
            if (err) return next(err);
            res.send({redirect: '/journal/index.html'})
        });
    })(req, res, next);
});

app.get('/logout', (req, res) => {
	req.logOut()
	return res.status(200).json({redirect: '/', message: 'Log out successful'})

})

app.get('/session', authorize, (req, res) => {
	res.status(200).json({user: req.user.userRepr()})
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