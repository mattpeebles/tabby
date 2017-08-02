const windowURL = window.location.origin

function format(){
	let elementArray = ['#currentPassword', '#newPassword', '#confirmNewPassword']

		elementArray.forEach(element => {
			if ($(element).val() == ''){
				let parent = $(element).parent()
				$(element).removeClass('valid')
				$(element).removeClass('error')
				$(parent).children('.feedback').remove()
				$(parent).removeClass('has-success')
				$(parent).removeClass('has-danger')

			}

			else if ($(element).hasClass('error')){
					let parent = $(element).parent()
					$(element).removeClass('valid')
					$(parent).children('.feedback').remove()
					$(parent).removeClass('has-success').addClass('has-danger')
			}
		}) 

}

function displayError(){
	$('input').on('keydown', () => {
		setTimeout(format, 100)
	})
}

function validateForm(){
	$('#changePassword').validate({
		rules: {
			currentPassword: "required",
			newPassword: {
				required: true,
				minlength: 8
			},
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
			newPassword: "Please enter a new password with 8 characters",
			confirmNewPassword: "Please enter a matching password"
		}
	})	         
}

function changePassword(){
	$("#submitButton").on('click', (event) => {
		event.preventDefault()
		let currentPassword = $('#currentPassword').val()
		let loginData;
		let newPasswordData;
		let id;

		$.ajax({
			type: 'get',
			url: windowURL + '/users/me',
			success: function(data){
				let email = data.user.email

				loginData = {
					email: email,
					password: currentPassword
				}

				id = data.user.id;

				newPasswordData = {
					id: id, 
					password: $('#newPassword').val()
				}

				$.ajax({
					type: 'get',
					url: windowURL + '/logout',
					success: function(){

						$.ajax({
							type: 'post',
							url: windowURL + '/login',
							data: JSON.stringify(loginData),
							contentType: 'application/json',
							success: function(data){

								$.ajax({
									type: 'put',
									url: windowURL + `/users/${id}`,
									data: JSON.stringify(newPasswordData),
									contentType: 'application/json',
									success: function(data){
										alert('Password successfully changed')
										window.location.href = windowURL + '/profile'
									}
								})
							},
							error: function(err){
								alert('You entered the wrong password. Please log in')
								window.location.href = windowURL + '/login'
							}
						})
					}
				})
			}
		})

	})
}


$(() => {
	validateForm()
	displayError()
	changePassword()
})