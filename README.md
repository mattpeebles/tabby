# Tabby
[![Build Status](https://travis-ci.org/mattpeebles/tabby.svg?branch=master)](https://travis-ci.org/mattpeebles/tabby)

http://minimal-tabby.herokuapp.com/

## Description
Tabby provides a simple way for a user to stay on top of a sea of browser tabs. I found that when I browse the internet, I come across a ton of interesting sites that I open with the intention of getting to later. In short order, I have over a hundred tabs open, with no real way to determine which are the most interesting to me and no real motivation to plumb through them all.

Tabby allows users to add links and sort them by priority. In order to provide motivation to read them, the length of time Tabby retains the links is inversely proportional to the priority set. High priority links will be deleted before medium priority and medium before low. 

The length of time each link is retained is customizable by the user but is always in days. However, there's nothing stopping a person from customizing the settings to keep high priority posts the longest and low the shortest. In this setting, Tabby acts as a typical bookmarking site but still provides motivation to get to important links before they are deleted. Some users may just want to clean out their low priority links more often than their high.

>The ultimate goal of Tabby is to provide a user with an easy way to manage tab overload and be motivated to revisit tabs that they found interesting enough to save.

## Screenshots

Adding entries to a new or empty journal
![alt text](/resources/screenCaps/addEmpty.gif "Empty Journal Gif")

Adding entry
![alt text](/resources/screenCaps/add.gif "Add Entry Gif")

Follow link
![alt text](/resources/screenCaps/followLink.gif "Follow Link Gif")

Editing an entries priority and title
![alt text](/resources/screenCaps/edit.gif "Edit Entry Gif")

Editing the expiration settings
![alt text](/resources/screenCaps/editExpiry.gif "Edit Expiration Gif")

Deleting an entry
![alt text](/resources/screenCaps/delete.gif "Delete Entry Gif")

## Definitions
- Entry: a link that a user has submitted
- Priority Expiry - the length of time in days that the database holds the post depending on priority. 
- Journal: all entries that a user has posted


## Technology
	
Front-end: HTML, CSS, Javascript/ECMAScript 6

Back-end: node.js, Mongo, Mongoose

TDD: Mocha/Chai

Supplements worth mentioning
- Passport is used for authorization and session management
- Hosted on Heroku
- Bootstrap is used for responsive web development
- node-schedule is used for cron-job like functionality to delete expired links every day

## Schema and API
Tabby uses mongo hosted on mlab. There are two schemas - users and entry.

```javascript
UserSchema = mongoose.Schema({
	user: { 
			firstName: {type: String, default: ''},
			lastName: {type: String, default: ''}},
	joinDate: {type: Date, default: nowDate()},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	journalId: {type: String}, //unique string that identifies the journal of user
	priorityExpiry: {type: Object} //object that contains the expiration date for different priorities
})
```

```javascript
EntrySchema = mongoose.Schema({
	journalId: {type: String, required: true},
	entryId: {type: String},
	title: {type: String},
	link: {type: String},
	image: {type: String},
	priority: {type: String, required: true},
	addDate: {type: Date, default: Date.now},
	expiry: {type: Date} //date the link entry is deleted
})
```

There are two REST APIs built to run this app - users and entries. Users hooks allows the application to perform basic crud applications on the user collection in the database and Entries hooks all the same but for the entry collection. On sign in, a session is initiated.


#### Session Management

##### Login
```javascript
app.post('/login', function handleLocalAuthentication(req, res, next) {
    passport.authenticate('local', function(err, user, info) {  
        if (err) return next(err);
        if (!user) {
            return res.status(403).json({
                message: "no user found"
            });
        }

        // Manually establish the session...
        req.login(user, function(err) {
            if (err) return next(err);
            res.send({redirect: '/journal'})
        });
    })(req, res, next);
});
```

##### Logout
```javascript
app.get('/logout', (req, res) => {
	req.logOut()
	return res.status(200).json({redirect: '/login', message: 'Log out successful'})

```

#### Users hook description

##### Get
```javascript
userRouter.get('/me', authorize, (req, res) => {
	res.json({user: req.user.userRepr()})
})
```
- This hook displays the profile information of the signed in user
- Requires user to be signed in
- Passes authorize middleware


##### Post
```javascript
userRouter.post('/email', (req, res) => {
	let {email} = req.body
	return Users
		.find({email})
		.count()
		.exec()
		.then(count => {
			if (count > 0){
				return res.json({message: 'Email has already been used to create an account'})
			}
			else {
				return res.json({message: 'Valid email'})
			}
		})
})
```
- Used to provide feedback to users when they are registering their new account or changing their email

```javascript
userRouter.post('/', (req, res) => {
	//control logic to ensure request body exists, possess a non-empty string for email and password
	if (!req.body){
		return res.status(400).json({message: 'No request body'})
	}
	
	if (!('email' in req.body)){
		return res.status(400).json({message: 'Missing field: email'})
	}

	let {user, email, password, joinDate, journalId, priorityExpiry} = req.body
	let {firstName, lastName} = req.body.user

	if (typeof email !== 'string'){
		return res.status(422).json({message: 'Incorrect field type: email'})
	}

	if (!(password)){
		return res.status(422).json({message: 'Missing field: password'})
	}

	if (typeof password !== 'string'){
		return res.status(422).json({message: 'Incorrect field type: password'})
	}


	password = password.trim()

	if (password === ''){
				return res.status(422).json({message: 'Incorrect field length: password'})
	}

	//ensures email is unique
	return Users
		.find({email})
		.count()
		.exec()
		.then(count => {
			if (count > 0){
				return res.status(422).json({message: 'Email has already been used to create an account'})
			}

			return Users.hashPassword(password)
		})
		//hashes password and actually creates the new user
		.then(hash => {
			return Users
				.create({
					user: {	firstName: firstName,
							lastName: lastName
						},
					email: email,
					password: hash,
					joinDate: joinDate || Date.now(),
					journalId: journalId || generateJournalId(), //the first option shouldn't be called except for testing
					priorityExpiry: priorityExpiry || {'high': 2, 'medium': 4, 'low': 7} //default is likely to change
				})
		})
		.then(user => {
			return res.status(201).json({redirect: '/login/index.html', user: user.userRepr()})
		})
		.catch(err => {
			res.status(500).json({message: 'Internal server error'})
		})
})
```
- Allows a user to create a profile
- Uses bcrypt to hash password
- Uses faker to create a random journal id that entries are built off of


##### Put
```javascript
userRouter.put('/:id', (req, res) => {
	if (!(req.params.id === req.body.id)){
		const message = (
		  `Request path id (${req.params.id}) and request body id ` +
		  `(${req.body.id}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}
	const toUpdate = {}
	const updatedableFields = ['user', 'email', 'password', "priorityExpiry"]

	updatedableFields.forEach(field =>{
		if (field in req.body){
			toUpdate[field] = req.body[field]
		}
	})

	if(toUpdate.password !== undefined){
		return Users
			.findById(req.params.id)
			.exec()
			.then((user) => {
				return Users.hashPassword(toUpdate.password)
			})
			//hashes password and actually creates the new user
			.then(hash => {
				toUpdate["password"] = hash
				return toUpdate
			})
			.then(() => {
				Users
					.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
					.exec()
					.then(updatedUser => res.status(200).json(updatedUser.userRepr()))
					.catch(err => res.status(500).json({message: 'Internal server'}))
			})
	}

	if(toUpdate.priorityExpiry !== undefined){
		Users
			.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
			.exec()
			.then(res => {
				return res.journalId
			})
			.then(journalId => {
				Entry
					.find({journalId: journalId})
					.exec()
					.then(res => {
						let journalId = res[0].journalId
						res.forEach(entry => {
							let priority = entry.priority
							let entryId = entry._id
							let addDate = new Date(entry.addDate)
							
							let priorityExpiry = toUpdate.priorityExpiry[priority]
							
							let expiry = addDays(addDate, priorityExpiry)

							toUpdate.expiry = new Date(expiry)

							Entry
								.findByIdAndUpdate(entryId, {$set: toUpdate}, {new: true})
								.exec()
							})
					})
				})
			.then(() => {
				Users
					.findById(req.params.id)
					.exec()
					.then(updatedUser => res.status(200).json(updatedUser.userRepr()))
					.catch(err => res.status(500).json({message: 'Internal server'}))
			})
			.catch(err => res.status(500).json({message: 'Internal server error'}))
	}

	else{
		Users
			.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
			.exec()
			.then(updatedUser => {
				res.status(201).json(updatedUser.userRepr())})
			.catch(err => res.status(500).json({message: 'Internal server error'}))
	}
})
```
- Allows for updates to first and last name, email, password, and priority Expiry
- When updating priority expiry, each entry in the user's journal is updated with a new expiration date depending on the new priority


##### Delete
```javascript
userRouter.delete('/:id', authorize, (req, res) => {
	Users
		.findById(req.params.id)
		.exec()
		.then(res => {
			return res.journalId
		})
		.then(journalId => {
				console.log(`Delete journal ${journalId}`)
				Entry
					.find({journalId: journalId})
					.remove()
					.exec()
		})
		.then(() => {
			Users
				.findByIdAndRemove(req.params.id)
				.exec()
		})
		.then(() => {
			console.log(`Deleted user ${req.params.id}`)
				res.status(204).end()
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}))
})
```
-Allows for user to be deleted
-subsequently deletes journal by call the Entries delete /journalId hook

#### Entries hook description

##### Get
```javascript
entryRouter.get('/', (req, res) => {
	Entry
		.find()
		.exec()
		.then(entries => {
			res.json({
				entries: entries.map(entry => entry.entryRepr())
			})
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})
```
- returns all entries in database

```javascript
entryRouter.get('/entries', authorize, (req, res) => {
	let user = req.user.userRepr()
	Entry
		.find({journalId: user.journalId})
		.exec()
		.then(entries => {
			if (entries.length == 0){
				res.status(200).json({message: 'You have no links saved'})
			}
			else {
				res.json({
					entries: entries.map(entry => entry.entryRepr())
				})
			}
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})
```
- Returns all user entries. This is determined by the journal id of the user.
- Requires user to be signed in


##### Post
```javascript
entryRouter.post('/', authorize, (req, res) => {
	const requiredFields = ['link', 'priority'];
	let priorityExpiryObject = {}
	let priority = req.body.priority
	let addDate = nowDate()
	let expiry;
	let	options = {
		    uri: req.body.link,
		    transform: function (body) {
		        return cheerio.load(body);
		    }
		}
	requiredFields.forEach((field) => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message)
			return res.status(400).send(message)
		}
	})


		Users
			.find({journalId: req.user.journalId})
			.exec()
			.then(res => {
				priorityExpiryObject = res[0].priorityExpiry
				expiry = addDays(addDate, priorityExpiryObject[priority])
				return expiry
			})
			.then(expiry => {
				if (req.body.title){
					Entry
					.create({
						title: req.body.title,
						link: req.body.link,
						journalId: req.user.journalId,
						priority: req.body.priority,
						addDate: addDate,
						expiry: expiry
					})
					.then(entry => res.status(201).json(entry.entryRepr()))				
				}
				else{
						//scrapes title from url
					rp(options)
						.then(($) => {
							let pageTitle = $('head title').html()

							title = pageTitle.split("-")[0].split('|')[0]
							
							if (title == null){
								linkArray = (url).split('/')
								title = linkArray[linkArray.length - 1]
							}
							return title
						})
						.then(title => {

							//scrapes image from url
							resolver.resolve(req.body.link, (result)=>{
								let image;

								if (result == null){
									image = '/resources/images/empty.jpg'
								}
								else {
									image = result.image
								}
								
								Entry
									.create({
										title: title,
										link: req.body.link,
										image: image,
										journalId: req.user.journalId,
										priority: req.body.priority,
										addDate: addDate,
										expiry: expiry
									})
									.then(entry => res.status(201).json(entry.entryRepr()))
									.catch(err => {
										console.error(err)
										return res.status(400).json({message: 'Internal server error'})
									})
								
							})
						})
					}
			})
})
```
- Allows user to post new entries to their journal
- Only requires a valid link, all other schema requirements are provided on the backend
- URL scraper grabs title and main image of link
- Expiry date is calculated based off of user priority expiry
- Requires user to be signed in

##### Put
```javascript
entryRouter.put('/:entryId', (req, res) => {

	if (!(req.params.entryId === req.body.entryId)){
		const message = (
		  `Request path entryId (${req.params.entryId}) and request body entryId ` +
		  `(${req.body.entryId}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}

	let toUpdate = {}
	const updateableFields = ['link', 'priority']
	let addDate;
	
	updateableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field]
		}
	})

	if (!("priority" in toUpdate)){
		Entry
			.findByIdAndUpdate(req.body.entryId, {$set: toUpdate}, {new: true})
			.then(updateEntry => res.status(201).json(updateEntry.entryRepr()))
	}

	else {
		let addDate;

		Entry
			.findById(req.body.entryId)
			.exec()
			.then(res => {
				let journalId = res.journalId
				addDate = new Date(res.addDate)
				return journalId
			})
			.then(journalId => {
				Users
					.find({journalId: journalId})
					.exec()
					.then(res => {
						let priorityExpiryObject = res[0].priorityExpiry
						return priorityExpiryObject
					})
					.then(object => {
						let priority = req.body.priority
						let priorityExpiry = object[priority]
						return priorityExpiry
					})
					.then(priorityExpiry => {
						expiry = addDays(addDate, priorityExpiry)
						return expiry 
					})
					.then(expiry => {
						toUpdate.expiry = new Date(expiry)
						Entry
							.findByIdAndUpdate(req.params.entryId, {$set: toUpdate}, {new: true})
							.then(updateEntry => res.status(201).json(updateEntry.entryRepr()))
							.catch(err => res.status(500).json({message: 'Internal server error'}))
					})
				
				})
		}
})
```
- allows user to update the link and priority of each post
- Updating priority requires that the expiration date be recalculated each time


##### Delete
```javascript
entryRouter.delete('/:entryId', (req, res) => {

	Entry
		.findByIdAndRemove(req.params.entryId)
		.then(() => {
			console.log(`Entry ${req.params.entryId} was deleted`)
			res.status(204).end()
		})
})
```
- deletes individual entry

```javascript
entryRouter.delete('/journal/:journalId', (req, res) => {
	Entry
		.find({journalId: req.params.journalId})
		.remove()
		.exec()
		.then(() => {
			console.log(`Journal ${req.params.journalId} was deleted`)
			res.status(204).end()
		})
})
```
- Deletes entire journal with all associated entries
