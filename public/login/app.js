const windowURL = window.location.origin

function signIn(){
	$('#logIn').on('click', (event) => {
		event.preventDefault()
		
			//serializes array into an object that can be converted to json
		let data = $('#signInForm').serializeArray().reduce((obj, item) => {
				obj[item.name] = item.value

			return obj
		}, {})

		$.ajax({
			type: 'POST',
			url: windowURL + '/login',
			data: JSON.stringify(data),
			contentType: 'application/json',
			success: function(data){
				window.location.href = windowURL + data.redirect //redirects browser to user journal entries
			},
			error: function(err){
				$('#password').val('').focus()
				$('.alert').removeClass('hidden')
				setTimeout(() => $('.alert').slideUp(), 5000)
			}	
		})
	})
}


$(() => {
	signIn()
})