const DATABASE_URL = 'http://localhost:3030'
const btoa = require('btoa')


function signIn(){
	console.log('hi')
	$('#logIn').on('click', (event) => {
		event.preventDefault()
		let data = $('#signInForm').serializeArray().reduce((obj, item) => {
				obj[item.name] = item.value

			return obj
		}, {})

		console.log(JSON.stringify(data))

		$.ajax({
			type: 'POST',
			url: DATABASE_URL + '/login',
			data: JSON.stringify(data),
			contentType: 'application/json',
			beforeSend: function(xhr){
				xhr.setRequestHeader('Authorization', 'Basic ' + btoa($('#email').val() + ':' + $('#password').val()))
			},
			success: function(){alert(`i signed in user`)}
		})
	})
}


$(() => {
	signIn()
})