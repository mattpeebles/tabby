function equalHeight () {
    var heights = $(".moreInfo").map(function() {
        return $(this).height();
    }).get(),

    maxHeight = Math.max.apply(null, heights);

    $(".moreInfo").height(maxHeight);
};


function resize(){
	$('window').resize(() => {
		equalHeight()
	})
}


$(() => {
	equalHeight()
	resize()
})