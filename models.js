const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const {nowDate} = require('./resources/date-module')

const UserSchema = mongoose.Schema({
	user: { 
			firstName: {type: String, default: ''},
			lastName: {type: String, default: ''}},
	joinDate: {type: Date, default: nowDate()},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	journalId: {type: String}, //unique string that identifies the journal of user
	priorityExpiry: {type: Object} //object that contains the expiration date for different priorities
})

UserSchema.virtual('fullName').get(function(){
	return `${this.user.firstName} ${this.user.lastName}`.trim()
})


UserSchema.methods.userRepr = function(){
	return {
		id: this._id,
		user: {firstName: this.user.firstName,
				lastName: this.user.lastName},
		email: this.email,
		journalId: this.journalId,
		joinDate: this.joinDate.toString(),
		priorityExpiry: this.priorityExpiry || {high: 2, medium: 4, low: 7}
	}
}

UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password)
}

UserSchema.statics.hashPassword = function(password){
	return bcrypt.hash(password, 10)
}

const EntrySchema = mongoose.Schema({
	journalId: {type: String, required: true},
	entryId: {type: String},
	title: {type: String},
	link: {type: String},
	image: {type: String},
	priority: {type: String, required: true},
	addDate: {type: Date, default: Date.now},
	expiry: {type: Date} //date the link entry is deleted
})


EntrySchema.methods.entryRepr = function(){
	return {
		journalId: this.journalId,
		entryId: this._id,
		title: this.title,
		link: this.link,
		image: this.image,
		priority: this.priority,
		addDate: this.addDate,
		expiry: this.expiry
	}
}

const Users = mongoose.model('users', UserSchema) //first option must match collection name
const Entry = mongoose.model('entries', EntrySchema)


module.exports = {Users, Entry}