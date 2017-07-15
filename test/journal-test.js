const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const {app} = require('../server')

chai.use(chaiHttp)


// function generateEntry(name){
// 	let priorityArray = ['high', 'medium', 'low']

// 	function addDays(startDate, numberOfDays){
// 		var returnDate = new Date(
// 								startDate.getFullYear(),
// 								startDate.getMonth(),
// 								startDate.getDate() + numberOfDays,
// 								startDate.getHours(),
// 								startDate.getMinutes(),
// 								startDate.getSeconds());
// 		return returnDate;
// 	}

// 	let addDate = generateDate()

// 	let priority = priorityArray[Math.floor(Math.random()*priorityArray.length)]

// 	let highExpiry = addDays(addDate, priorityExpiry.high)
// 	let medExpiry = addDays(addDate, priorityExpiry.medium)
// 	let lowExpiry = addDays(addDate, priorityExpiry.low)

// 	let expiry;

// 	if (priority == 'high'){
// 		expiry = highExpiry
// 	}
// 	else if(priority == "medium"){
// 		expiry = medExpiry
// 	}
// 	else if(priority == 'low'){
// 		expiry = lowExpiry
// 	}

// 	let entries = {
// 		id: faker.random.uuid().toString(),
// 		title: faker.random.words(),
// 		link: faker.internet.url(),
// 		name: name.firstName + " " + name.lastName,
// 		priority: priority,
// 		addDate: addDate,
// 		expiry: expiry,
// 	}

// 	return entries
// }

// function generateJournalEntries(name){
// 	let journalEntries = []
// 	for (let i = 1; i <= 5; i++){
// 		journalEntries.push(generateEntry(name))
// 	}
// 	return journalEntries
// }