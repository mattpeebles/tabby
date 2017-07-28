const DATABASE_URL = 'http://localhost:3030/users'


function formatError(){
	let elementArray = ['#confirmNewPassword']

		elementArray.forEach(element => {
			if ($(element).hasClass('error')){
					console.log('test')
					let failureHtml =   
						  `<span class="glyphicon glyphicon-remove form-control-feedback feedback error" aria-hidden="true"></span>` +
						  `<span id="inputError2Status" class="sr-only feedback">(error)</span>`

					let parent = $(element).parent()
					$(element).removeClass('valid')
					$(parent).children('.feedback').remove()
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
	$('#changePassword').validate({
		rules: {
			currentPassword: "required",
			newPassword: "required",
			confirmNewPassword: {
				equalTo: "#newPassword"
			}
		},

		// changes success messages
		success: function(label){
    		let successHtml =   
	    		`<span class="glyphicon glyphicon-ok form-control-feedback feedback" aria-hidden="true"></span>` +
	  			`<span id="inputSuccess2Status" class="sr-only feedback">(success)</span>`


	    		let parent = $(label).parent()
	    		$(parent).removeClass('has-danger').addClass('has-success')
	    		$(parent).children('.feedback').remove()
	    		$(parent).append(successHtml)
	    		$(label).remove()
       
		},
		// changes error messages
		messages: {
			currentPassword: "Please enter your current password",
			newPassword: "Please enter a new password",
			confirmNewPassword: "Please enter a matching password"
		}
	})	         
}

function register(){
	$("#submit").on('click', () => {
		console.log('registering')
		
		let user = {} 
		
		let currentPassword = $('#currentPassword').val()

		console.log(data)

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
	displayError()

})