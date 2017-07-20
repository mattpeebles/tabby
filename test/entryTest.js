const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const expect = chai.expect()

chai.use(chaiHttp)

const mongoose = require('mongoose')
mongoose.Promise = global.Promise


const btoa = require('btoa')
const faker = require('faker')

const {TEST_DATABASE_URL} = require('../config')
const {app, runServer, closeServer} = require('../server')
const {Users, Entry} = require('../models')
const {addDays} = require('../resources/date-module')


let journalIdArray = [] //array is filled with ids from user Database
 
let priorityExpiryArray = []


	//creates User Database
//*********************************//
	function seedUserData(){
		console.info('creating test database of users')
		const seedData = []

		for (let i = 1; i <= 10; i++){
			seedData.push(generateUserData())
		}

		return Users.insertMany(seedData)
	}

	function generateUserData(){
		let journalId = generateJournalId()
		journalIdArray.push(journalId)

		let priorityExpiry = generatePriorityExpiry()
		priorityExpiryArray.push(priorityExpiry)
		
		return {
			user: {firstName: generateFirstName(),
					lastName: generateLastName()
				},
			email: generateEmail(),
			password: generatePassword(),
			joinDate: generateDate(),
			journalId: journalId,
			priorityExpiry: priorityExpiry
		}
	}

	function generateFirstName(){
		return faker.name.firstName()
	}

	function generateLastName(){
		return faker.name.lastName()
	}

	function generateEmail(){
		return faker.internet.email()
	}

	function generateDate(){
		return faker.date.recent()
	}

	function generatePassword(){
		return faker.internet.password()
	}

	function generateJournalId(){
		return faker.random.word() + faker.random.word() + faker.random.word()
	}

	function generatePriorityExpiry(){
		return {high: faker.random.number(), medium: faker.random.number(), low: faker.random.number()}
	}
//*********************************//


	//creates Entry Database
//*********************************//
	function seedEntryData(){
		console.info('creating test database of entries')
		const seedData = []
		
		for (let i = 0; i < 20; i++){
			seedData.push(generateEntry())
		}

		return Entry.insertMany(seedData)
	}

	function generateEntry(){

		let addDate = generateDate()
		let priorityExpiry = priorityExpiryArray[0]
		let priority = generatePriority()
		
		let expiry;

		let entries = {
			journalId: journalIdArray[0],
			title: generateTitle(),
			link: generateLink(),
			entryId: faker.random.uuid().toString(),
			priority: priority,
			addDate: addDate,
			expiry: generateExpiry(priority, addDate, priorityExpiry),
		}

		return entries
	}


	function generateTitle(){
		return faker.random.words()
	}

	function generateLink(){
		return faker.internet.url()
	}

	function generatePriority(){
		let priorityArray = ['high', 'medium', 'low']
		let priority = priorityArray[Math.floor(Math.random() * priorityArray.length)]
		return priority
	}

	function generateExpiry(priority, addDate, priorityExpiry){
		let expiry;

		let highExpiry = addDays(addDate, priorityExpiry.high)
		let medExpiry = addDays(addDate, priorityExpiry.medium)
		let lowExpiry = addDays(addDate, priorityExpiry.low)

		if (priority == 'high'){
			expiry = highExpiry
		}
		else if(priority == "medium"){
			expiry = medExpiry
		}
		else if(priority == 'low'){
			expiry = lowExpiry
		}

		return expiry
	}

//*********************************//


function tearDownDb(){
	return new Promise((resolve, reject) => {
		console.warn('Delete test database')
		return mongoose.connection.dropDatabase()
		.then(result => resolve(result))
		.catch(err => reject(err))
	})
}

	describe('Entry API resource', () => {
		before(() => {
			console.info(`Opening test database at ${TEST_DATABASE_URL}`)
			return runServer(TEST_DATABASE_URL)
		})
		beforeEach(() => {
			journalIdArray = []
			priorityExpiryArray = []
			return seedUserData()
		})
		beforeEach(() => {
			return seedEntryData()
		})
		afterEach(() => {
			return tearDownDb()
		})
		after(() => {
			console.info('Closing test database')
			return closeServer()
		})

		describe('Get endpoint', () => {
			it('should return a list of all entries in database on GET', ()=> {
				let res;
				return chai.request(app)
					.get('/entry')
					.then(_res => {
						res = _res
						res.should.have.status(200)
						res.body.entries.should.have.length.of.at.least(1)
					})
			})

			it('should return a list of entries specific to user', () =>{
				let entryData =     [{
								      "journalId": "inputFantasticback up",
								      "title": "changed title",
								      "link": "www.google.com",
								      "priority": "medium",
								      "addDate": "2017-07-16T18:34:44.565Z",
								      "expiry": "2017-07-16T17:26:49.000Z"
								    },
								    {
								      "journalId": "inputFantasticback up",
								      "title": "test title",
								      "link": "www.google.com",
								      "priority": "medium",
								      "addDate": "2017-07-16T17:26:49.746Z",
								      "expiry": "2017-07-16T17:26:49.000Z"
								    },
								    {
								      "journalId": "inputFantasticback up",
								      "title": "weef title",
								      "link": "www.google.com",
								      "priority": "medium",
								      "addDate": "2017-07-16T17:27:27.644Z",
								      "expiry": "2017-07-16T17:27:27.000Z"
								    }]

				let userData = { "user": { 
											"firstName": "Harry",
											"lastName": "Potter"
										},
										"joinDate": "Fri Jul 14 2017 15:00:22 GMT-0700 (PDT)",
										"email": "testemail@test.com",
										"password": "yolo",
										"journalId": "inputFantasticback up", 
										"priorityExpiry": {"high": 2, "medium": 4, "low": 7}
								} 
				
				let res;

				return chai.request(app)
					.post('/users')
					.send(userData)
					.then(res => {
							return Entry.insertMany(entryData)
					})
					.then(res => {
						let BasicAuthToken = 'Basic ' + btoa(userData.email + ':' + userData.password) //authorization header value


						let randIndex = Math.floor(Math.random()*(9-0)) + 0
						let journalId = journalIdArray[0]
						let priorityExpiry = priorityExpiryArray[randIndex]
						return chai.request(app)
							.get(`/entry/entries`)
							.set('Authorization', BasicAuthToken)
							.then(_res => {
								res = _res
								let entries = res.body.entries
								res.should.have.status(200)
								res.should.be.json
								
								if (res.body.entries === undefined){
									res.should.have.status(200)
									res.should.be.json
									res.body.message.should.be.equal('You have no links saved')			
								}
								else {
									entries.should.be.a('array')
									entries.should.have.length(3)
								
									entries.forEach(entry => {
										entry.journalId.should.be.equal(userData.journalId)
										entry.entryId.should.be.a('string')
										entry.link.should.be.a('string')
										entry.title.should.be.a('string')
										entry.priority.should.be.a('string')
										entry.addDate.should.be.a('string')
										entry.expiry.should.be.a('string')
									})
								}
							})
					})

			})

			it('should return a json message for a user with no entries', () => {
				let userData = { "user": { 
											"firstName": "Harry",
											"lastName": "Potter"
										},
										"joinDate": "Fri Jul 14 2017 15:00:22 GMT-0700 (PDT)",
										"email": "testemail@test.com",
										"password": "yolo",
										"journalId": "inputFantasticback up", 
										"priorityExpiry": {"high": 2, "medium": 4, "low": 7}
								}
				let BasicAuthToken = 'Basic ' + btoa(userData.email + ':' + userData.password) //authorization header value

				return chai.request(app)
					.post('/users')
					.send(userData)
					.then(res => {

						return chai.request(app)
							.get(`/entry/entries`)
							.set('Authorization', BasicAuthToken)
							.then(res => {
								res.should.have.status(200)
								res.should.be.json
								res.body.message.should.be.equal('You have no links saved')
							})
					})
			})
		})

		describe('POST endpoint', () => {
			it('should add entry on user\'s journal', () => {
				
				let priorityExpiry = priorityExpiryArray[0]

				const newEntry = {
						journalId: journalIdArray[0],
						title: generateTitle(),
						link: generateLink(),
						priority: generatePriority(),
						addDate: generateDate()
					}
				return chai.request(app)
					.post('/entry')
					.send(newEntry)
					.then(res => {
						res.should.have.status(201)
						res.body.journalId.should.be.a('string')
						res.body.journalId.should.be.equal(newEntry.journalId)
						res.body.entryId.should.be.a('string')
						res.body.title.should.be.a('string')
						res.body.title.should.be.equal(newEntry.title)
						res.body.priority.should.be.a('string')
						res.body.priority.should.be.equal(newEntry.priority)
						res.body.addDate.should.be.a('string')
						res.body.expiry.should.be.a('string')

						
						let expiryDate = new Date(res.body.expiry)
						let addDate = new Date(res.body.addDate)
						let dateDiff = Math.round((expiryDate.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))

						switch(res.body.priority){
							case 'high': 
								(dateDiff).should.equal(priorityExpiry.high) 
								break;
							case 'medium': 
								(dateDiff).should.equal(priorityExpiry.medium) 
								break;
							case 'low': 
								(dateDiff).should.equal(priorityExpiry.low) 
								break;
						}
					})
		})
	})

	describe('PUT endpoint', () => {
		
		it('should update entry on PUT', () => {
			const updateEntry = {
				"title": generateTitle(),
				"link": generateLink(),
			}

				return Entry
					.findOne()
					.exec()
					.then(entry => {
						updateEntry.entryId = entry._id
						return chai.request(app)
							.put(`/entry/${entry._id}`)
							.send(updateEntry)
					})
					.then(res => {
						res.should.have.status(201)
						
						return Entry.findById(updateEntry.entryId).exec()
					})
					.then(entry => {
						entry.title.should.be.equal(updateEntry.title)
						entry.link.should.be.equal(updateEntry.link)
					})
		})

		it('should update expiry when priority is updated', () => {
			let updateEntry = {
				"title": generateTitle(),
				"link": generateLink(),
				"priority": generatePriority()
			}

				return Entry
					.findOne()
					.exec()
					.then(res => {
						updateEntry.entryId = res._id
						return chai.request(app)
							.put(`/entry/${updateEntry.entryId}`)
							.send(updateEntry)
					})
					.then(res => {
						res.should.have.status(201)
						res.body.should.be.a('object')

						return Entry.findById(updateEntry.entryId).exec()
					})
					.then(entry => {
						entry.title.should.be.equal(updateEntry.title)
						entry.link.should.be.equal(updateEntry.link)
						entry.priority.should.be.equal(updateEntry.priority)
					})
		})
	})

	describe('DELETE endpoint', () => {
		it('should remove entry on DELETE', () => {
			return Entry
				.findOne()
				.exec()
				.then(res => {
					let entryId = res.entryId
					return chai.request(app)
						.delete(`/entry/${entryId}`)
				})
				.then(res => {
					res.should.have.status(204)
				})
		})

		it('should remove all entries from journal', () => {
			Users
				.find({journalId: journalIdArray[0]})
				.exec()
				.then(res => {
					let journalId = res.journalId
					return chai.request(app)
						.delete(`/entry/journal/${journalId}`)
				})
				.then(res => {
					res.should.have.status(204)
				})
		})
	})
})