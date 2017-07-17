function addDays(startDate, numberOfDays){
	var returnDate = new Date(
							startDate.getFullYear(),
							startDate.getMonth(),
							startDate.getDate() + numberOfDays,
							startDate.getHours(),
							startDate.getMinutes(),
							startDate.getSeconds());
	return returnDate;
}


module.exports = {addDays}