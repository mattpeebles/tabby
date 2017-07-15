const express = require('express')
const app = express()
const entryRouter = express.Router()

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

entryRouter.use(jsonParser)

const {Entry} = require('./models')

entryRouter.get('/', (req, res) => {
	Entry
		.find()
		.exec()
		.then(entries => {
			res.json({
				entries: entries.map(entry => entry.entryRepr())
			})
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})

})

entryRouter.get('/:journalId', (req, res) => {
	Entry
		.find({journalId: req.params.journalId})
		.exec()
		.then(entries => {
			if (entries.length == 0){
				res.status(200).json({message: 'You have no links saved'})
			}
			else {
				res.json({
					entries: entries.map(entry => entry.entryRepr())
				})
			}
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})


module.exports = entryRouter