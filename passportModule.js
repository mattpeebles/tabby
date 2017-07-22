const {BasicStrategy} = require('passport-http')
const passport = require('passport')
const {Users} = require('./models')


const basicStrategy = new BasicStrategy((email, password, callback) => {
	let user;
	Users
		.findOne({email: email})
		.exec()
		.then(_user => {
			user = _user
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
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(basicStrategy)

module.exports = passport
