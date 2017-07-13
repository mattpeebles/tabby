const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	user: { 
			firstName: String,
			lastName: String },
	date: {type: Date, default: Date.now},
	email: {type: String, required: true},
	password: {type: String, required: true},
	journalEntries: {type: Array}
})

userSchema.virtual('fullName').get(function(){ //cannot use =>
	return `${this.user.firstName} ${this.user.lastName}`.trim()
})


userSchema.methods.userRepr = function(){
	return {
		id: this._id,
		user: this.fullName,
		email: this.email,
		entries: this.journalEntries,
		date: this.date
	}
}

userSchema.methods.entriesRepr = function(){
	let entries = this.journalEntries
	return {
		id: entries.id,
		title: entries.title,
		priority: entries.priority,
		link: entries.link,
		user: entry.user,
		date: entry.date

	}
}

const Users = mongoose.model('users', userSchema) //first option must match collection name

module.exports = {Users}