const {BasicStrategy} = require('passport-http')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const {Users} = require('./models')


passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'   
    },
    function verify(email, password, done) {
	 	let user;
	 	Users
			.findOne({email: email})
			.exec()
			.then(_user => {
				user = _user
				if (!user){
					return done(null, false)
				}
				return user.validatePassword(password)
			})
			.then(isValid => {
				if (!isValid){
					return done(null, false)
				}
				else{
					return done(null, user)
				}
			})
			.catch(err => done(err))
	}
))

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


module.exports = passport
