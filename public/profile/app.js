const windowURL = window.location.origin

	// Static Display User Data
// *********************************** //

	function getUserData(callback){
		$.ajax({
			type: 'get',
			url: windowURL + '/users/me',
			success: function(data){
				callback(data)
			},
			error: function(err){
				window.location.href = windowURL + '/login'
			}
		})
	}

	function displayUserData(data){
	
		let catNumber = Math.floor(Math.random() * (Math.floor(25)-Math.ceil(1) + 1)) + Math.ceil(1)
		
		let formatDate = $.format.date(data.user.joinDate, "MMMM D, yyyy")

		let email = (data.user.status == 'demo') ? 'admin@tabbyadmin.com' : data.user.email

		$('#profileImage').append(`<img src="/resources/images/profileCat/cat-${catNumber}.jpg"></img>`)
		$("#name").append(`<p>${data.user.user.firstName} ${data.user.user.lastName}</p>`)
		$('#email').append(`<p>${email}</p>`)
		$('#joinDate').append(`<p>Joined: ${formatDate}</p>`)
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
		$('#logOutButton').click((event) => {
			if(confirm('Log out?')){
				$.ajax({
					type: 'get',
					url: windowURL + '/logout',
					success: function(data) {
						window.location.href = windowURL + data.redirect
					}
				})
			}
		})
	}

$(() => {
	getAndDisplayUserData()
	signout()
})