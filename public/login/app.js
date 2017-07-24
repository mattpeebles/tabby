const DATABASE_URL = 'http://localhost:3030'


function signIn(){
	$('#logIn').on('click', (event) => {
		event.preventDefault()
		let data = $('#signInForm').serializeArray().reduce((obj, item) => {
				obj[item.name] = item.value

			return obj
		}, {})

		$.ajax({
			type: 'POST',
			url: DATABASE_URL + '/login',
			data: JSON.stringify(data),
			contentType: 'application/json',
			success: function(data){
				window.location.href = data.redirect
			}
		})
	})
}


$(() => {
	signIn()
})