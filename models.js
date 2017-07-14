const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	user: { 
			firstName: String,
			lastName: String },
	date: {type: Date, default: Date.now},
	expiry: {type: Date},
	email: {type: String, required: true},
	password: {type: String, required: true},
	journalEntries: {type: Array},
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
		entries: this.journalEntries,
		date: this.date,
		expiry: this.expiry,
		priorityExpiry: this.priorityExpiry
	}
}

const Users = mongoose.model('users', userSchema) //first option must match collection name

module.exports = {Users}