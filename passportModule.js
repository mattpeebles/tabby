const {BasicStrategy} = require('passport-http')
const passport = require('passport')
const {Users} = require('./models')


const basicStrategy = new BasicStrategy((email, password, callback) => {
	console.log('basic strategy: ')
	console.log(email, password)
	let user;
	Users
		.findOne({email: email})
		.exec()
		.then(_user => {
			user = _user
			console.log(user)
			if (!user){
				return callback(null, false)
			}
			return user.validatePassword(password)
		})
		.then(isValid => {
			if (!isValid){
				return callback(null, false)
			}
			else{
				return callback(null, user)
			}
		})
		.catch(err => callback(err))
})

passport.serializeUser(function(user, done) {
  console.log('serializing: ')
  console.log(user)
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function (err, user) {
    console.log('deserializing: ')
    console.log(user)
    done(err, user);
  });
});

passport.use(basicStrategy)

module.exports = passport
