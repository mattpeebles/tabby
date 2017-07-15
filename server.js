const express = require('express')
const app = express()

const {DATABASE_URL, PORT} = require('./config')

const bodyParser = require('body-parser')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const morgan = require('morgan')

app.use(express.static('public'))
app.use('/resources', express.static('resources'))

const upInRouter = require('./upInRouter')
const entryRouter = require('./entryRouter')
app.use('/users', upInRouter) //provides user api route, updated /users will update the path that the api will require
app.use('/entry', entryRouter)


let server;

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