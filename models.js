const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	user: { 
			firstName: String,
			lastName: String },
	joinDate: {type: Date, default: Date.now},
	expiry: {type: Date},
	email: {type: String, required: true},
	password: {type: String, required: true},
	journalId: {type: String}, //will be unique string that identifies the journal entries in seperate collection
	priorityExpiry: {type: Object}
})

userSchema.virtual('fullName').get(function(){
	return `${this.user.firstName} ${this.user.lastName}`.trim()
})


userSchema.methods.userRepr = function(){
	return {
		id: this._id,
		user: this.fullName,
		email: this.email,
		journalId: this.journalId,
		joinDate: this.joinDate.toString(),
		expiry: this.expiry,
		priorityExpiry: this.priorityExpiry
	}
}

const entrySchema = mongoose.Schema({
	journalId: {type: String, required: true},
	entryId: {type: String, required: true},
	title: {type: String},
	link: {type: String},
	priority: {type: String, required: true},
	addDate: {type: Date},
	expiry: {type: Date}
})

entrySchema.methods.entryRepr = function(){
	return {
		journalId: this.journalId,
		entryId: this._id,
		title: this.title,
		link: this.link,
		prioirty: this.priority,
		addDate: this.addDate,
		expiry: this.expiry
	}
}

const Users = mongoose.model('users', userSchema) //first option must match collection name
const Entry = mongoose.model('entries', entrySchema)


module.exports = {Users}