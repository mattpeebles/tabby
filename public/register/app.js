const DATABASE_URL = 'http://localhost:3030/users'


function formatError(){
	let elementArray = ['#firstName', '#lastName', '#email', '#password', '#confirmPassword']

		elementArray.forEach(element => {
			console.log(element + $(element).hasClass('error'))
			if ($(element).hasClass('error')){
					console.log('me')
					let failureHtml =   
						  `<span class="glyphicon glyphicon-remove form-control-feedback feedback error" aria-hidden="true"></span>` +
						  `<span id="inputError2Status" class="sr-only feedback">(error)</span>`

					let parent = $(element).parent()
					$(element).removeClass('valid')
					$(parent).removeClass('has-success').addClass('has-danger')
					$(parent).append(failureHtml)  
			}
		}) 
}

function displayError(){
	$('input').on('keydown', () => {
		setTimeout(formatError, 100)
	})
}

function validateForm(){
	$('#registerForm').validate({
		rules: {
			firstName: "required",
			lastName: "required",
			password: "required",
			confirmPassword: {
				equalTo: "#password"
			},
			email: {
				required: true,
				email: true,
			},

		},

		// changes success messages
		success: function(label){
    		let successHtml =   
	    		`<span class="glyphicon glyphicon-ok form-control-feedback feedback" aria-hidden="true"></span>` +
	  			`<span id="inputSuccess2Status" class="sr-only feedback">(success)</span>`

    		if (label[0].htmlFor === 'email'){
			    
			    let data = {
					email: $('#email').val()
				}

				$.ajax({
					type: 'post',
					url: DATABASE_URL + '/email',
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: function(data){
						if (data.message === 'Email has already been used to create an account'){
							   console.log('me')
							   let parent = $('#email').parent()
			    				$(parent).removeClass('has-success')
			    				$(parent).children('.feedback').remove()

								$('#email').removeClass('valid').addClass('error')
								$('#email-error').text(data.message)
						}
						else{
							console.log('me')
				    		let parent = $(label).parent()
				    		$(parent).removeClass('has-danger').addClass('has-success')
				    		$(parent).children('.feedback').remove()
				    		$(parent).append(successHtml)
				    		$(label).remove()
						}
					}
				})
    		}

    		else{
    			console.log('yo')
	    		let parent = $(label).parent()
	    		$(parent).removeClass('has-danger').addClass('has-success')
	    		$(parent).children('.feedback').remove()
	    		$(parent).append(successHtml)
	    		$(label).remove()
    		}
       
		},
		// changes error messages
		messages: {
			password: "Please enter a password",
			confirmPassword: "Please enter a matching password"
		}
	})	         
}

function register(){
	$("#register").on('click', (event) => {
		event.preventDefault()
		let user = {} 
		
			//serializes array into object
			//adds firstName and lastName keys to user object
			//to meet database expectations for user field
		let data = $('#registerForm').serializeArray().reduce((obj, item) => {
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
	displayError()
})