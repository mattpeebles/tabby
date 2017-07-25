const DATABASE_URL = 'http://localhost:3030/users'


	//ensures user inputs accurate data
	//password is consistent and email is entered
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

function register(){
	$("#signUp").on('click', (event) => {
		event.preventDefault()
		let user = {} 
		
			//serializes array into object
			//adds firstName and lastName keys to user object
			//to meet database expectations for user field
		let data = $('#signUpForm').serializeArray().reduce((obj, item) => {
   		 if(item.name === "firstName" || item.name === "lastName"){
   		 	user[item.name] = item.value
   		 }
   		 else if (item.name !== 'confirmPassword'){
   		 	obj[item.name] = item.value
   		 }
   		 obj["user"] = user
   		 return obj;
		}, {});

		$.ajax({
			type: 'post',
			url: DATABASE_URL,
			data: JSON.stringify(data),
			contentType: 'application/json', 
			success: function(data){
				window.location.href = data.redirect
			}
		})

	})
}


$(() => {
	validateForm()
	register()
})