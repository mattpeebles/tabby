const randomCat = require('random-cat')
const DATABASE_URL = "http://localhost:3030"



	// Static Display User Data
// *********************************** //

	function getUserData(callback){
		$.ajax({
			type: 'get',
			url: DATABASE_URL + '/users/me',
			success: function(data){
				callback(data)
			},
			error: function(err){
				alert('please log in')
				window.location.href = DATABASE_URL + '/login'
			}
		})
	}

	function displayUserData(data){
		

		let catPhoto = randomCat.get({
			width: 300,
			height: 300,

		})
		let formatDate = $.format.date(data.user.joinDate, "MMMM D, yyyy")

		$('#profileImage').append(`<img src="${catPhoto}"></img>`)
		$("#name").append(`<p>${data.user.user.firstName} ${data.user.user.lastName}</p>`)
		$('#email').append(`<p>${data.user.email}</p>`)
		$('#joinDate').append(`<p>${formatDate}</p>`)
		$('#highExpiry').append(`<p>${data.user.priorityExpiry.high} days</p>`)
		$('#medExpiry').append(`<p>${data.user.priorityExpiry.medium} days</p>`)
		$('#lowExpiry').append(`<p>${data.user.priorityExpiry.low} days</p>`)
	}

	function getAndDisplayUserData(){
		getUserData(displayUserData)
	}
// *********************************** //

	// Signout
// *********************************** //
	function signout(){
		console.log('yo')
		$('#logOutButton').click((event) => {
			console.log('hello')
			if(confirm('Log out?')){
				$.ajax({
					type: 'get',
					url: 'http://localhost:3030/logout',
					success: function(data) {
						alert(data.message)
						window.location.href = data.redirect
					}
				})
			}
		})
	}

$(() => {
	getAndDisplayUserData()
	signout()
})