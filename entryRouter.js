const express = require('express')
const app = express()
const entryRouter = express.Router()

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

entryRouter.use(jsonParser)

const {Users, Entry} = require('./models')

const {addDays} = require('./resources/date-module')


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

entryRouter.post('/', (req, res) => {
	const requiredFields = ['title', 'link', 'priority', 'journalId'];
	let priorityExpiryObject = {}
	let priority = req.body.priority
	let addDate = new Date(Date(req.body.addDate))
	requiredFields.forEach((field) => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message)
			return res.status(400).send(message)
		}
	})

		Users
			.find({journalId: req.body.journalId})
			.exec()
			.then(res => {
				priorityExpiryObject = res[0].priorityExpiry
				expiry = addDays(addDate, priorityExpiryObject[priority])
				return expiry
			})
			.then(expiry => {
				Entry
							.create({
								title: req.body.title,
								link: req.body.entry,
								journalId: req.body.journalId,
								priority: req.body.priority,
								addDate: req.body.addDate,
								expiry: expiry
							})
							.then(entry => res.status(201).json(entry.entryRepr()))
							.catch(err => {
								console.error(err)
								return res.status(400).json({message: 'Internal server error'})
							})
			})
})

entryRouter.put('/:entryId', (req, res) => {
	if (!(req.params.entryId === req.body.entryId)){
		const message = (
		  `Request path entryId (${req.params.id}) and request body entryId ` +
		  `(${req.body.id}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}

	let toUpdate = {}
	const updateableFields = ['title', 'link', "priority"]
	let addDate;
	
	updateableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field]
		}
	})

	if (!("priority" in toUpdate)){
		Entry
			.findByIdAndUpdate(req.params.entryId, {$set: toUpdate}, {new: true})
			.then(updateEntry => res.status(201).json(updateEntry.entryRepr()))
	}
	else {
		Entry
			.findById(req.body.entryId)
			.exec()
			.then(res => {
				let journalId = res.journalId
				return journalId
			})
			.then(journalId => {
				Users
					.find({journalId: journalId})
					.exec()
					.then(res => {
						let priorityExpiryObject = res[0].priorityExpiry
						return priorityExpiryObject
					})
					.then(object => {
						let priority = req.body.priority
						let priorityExpiry = object[priority]
						console.log("PRIORITY EXPIRY: " + priorityExpiry)
						return priorityExpiry
					})
					.then(priorityExpiry => {
						Entry
							.find({entryId: req.params.entryId})
							.exec()
							.then(res => {
								addDate = new Date(Date(res.addDate))
								expiry = addDays(addDate, priorityExpiry)
								console.log("ADD DATE: " + addDate)
								console.log("EXPIRY: " + expiry)
								return expiry 
							})
							.then(expiry => {
								toUpdate.expiry = expiry
								Entry
									.findByIdAndUpdate(req.params.entryId, {$set: toUpdate}, {new: true})
									.then(updateEntry => res.status(201).json(updateEntry.entryRepr()))
									.catch(err => res.status(500).message({message: 'Internal server error'}))
							})
					
					})
			})
	}
})


entryRouter.delete('/:entryId', (req, res) => {
	Entry
		.find({entryId: req.params.entryId})
		.remove()
		.exec()
		.then(() => {
			console.log(`Entry ${req.params.entryId} was deleted`)
			res.status(204).end()
		})
})

entryRouter.delete('/journal/:journalId', (req, res) => {
	Entry
		.find({journalId: req.params.journalId})
		.remove()
		.exec()
		.then(() => {
			console.log(`Journal ${req.params.journalId} was deleted`)
			res.status(204).end()
		})
})

module.exports = entryRouter