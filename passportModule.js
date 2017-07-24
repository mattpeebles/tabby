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

function authorize(req, res, next){
	if (req.user !== undefined){
		console.log('authorized')
		next()
	}
	else {
		console.log('not authorized')
		res.status(403).send('Forbidden')	
	}
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function (err, user) {
    done(err, user);
  });
});


module.exports = {passport, authorize}
