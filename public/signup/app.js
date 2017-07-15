function validateForm(){
	$('#signUpForm').validate({
		rules: {
			password: "required",
			confirmPassword: {
				equalTo: "#password"
			},
			email: {
				required: true,
				email: true
			},

		},

		// changes success messages
		success: function(label){
    		label.addClass("valid").text("Ok!");                        
		},
		// changes error messages
		messages: {
			password: "Please enter a password",
			confirmPassword: "Please enter a matching password"
		}
	})
}

let MOCK_USER_DATA = {"users": []};

const MOCK_JOURNAL_ENTRIES = {
	"journalEntries": [
		{
			'id': '111111',
			'title': 'cool page',
			'priority': 'high',
			'link': 'https://www.google.com',
			'user': 'john doe',
			'date': Date.now
		},
		{
			'id': '222222',
			'title': 'not so cool page',
			'priority': 'low',
			'link': 'https://www.bing.com',
			'user': 'john doe',
			'date': Date.now
		},
		{
			'id': '333333',
			'title': 'really really cool page',
			'priority': 'high',
			'link': 'https://www.yahoo.com',
			'user': 'john doe',
			'date': Date.now
		},
		{
			'id': '444444',
			'title': 'look at later',
			'priority': 'medium',
			'link': 'https://www.chess.com',
			'user': 'john doe',
			'date': Date.now
		},
	]
}

function submitForm(){
	$("#signUp").on('click', (event) => {
		event.preventDefault()
		var data = $('#signUpForm').serializeArray().reduce((obj, item) => {
   		 if(item.name === "password"){
   		 	obj[item.name] = "pseudohashedpassword" //this will need to be changed to bcrypt hashed password for production
   		 }
   		 else if(item.name !== "confirmPassword"){
   		 	obj[item.name] = item.value;

   		 }
   		 return obj;
		}, {});

		data.MOCK_JOURNAL_ENTRIES = MOCK_JOURNAL_ENTRIES.journalEntries;
		
		MOCK_USER_DATA['users'].push(data)

		console.log(MOCK_USER_DATA)

	})
}


$(() => {
	validateForm()
	submitForm()
})