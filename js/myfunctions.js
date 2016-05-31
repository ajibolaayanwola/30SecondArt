var siteUrl = "http://tripleadesigns.net/30SecondArt/";
var ctx;
var screenWidth;
var screenHeight;

if (localStorage.user_id == null) {
	localStorage.user_id = createUserId();
}

$(document).on("pagebeforeshow", "#draw-page", function() {
	//clearCanvas();
});

$(document).on("pageshow", "#gallery-page", function() {
	getPosts();
});

$(document).one("pageshow", "#draw-page", function() {
	var canvasWidth = $("#draw-page .ui-content").width();
	var canvasHeight = $(window).height() - $("#draw-page .ui-header").outerHeight() - ($("#draw-page .ui-content").innerHeight() - $("#draw-page .ui-content").height()) - 50;
	$("#my_canvas").attr("width", canvasWidth);
	$("#my_canvas").attr("height", canvasHeight);
	//ctx.canvas.width = canvasWidth;
	//ctx.canvas.height = canvasHeight;
});

$(document).on("pageshow", "#draw-page", function() {
	$("#draw-page .timer").html("30");
	clearCanvas();
	$("#getready-popup").popup("open");
});

$(document).on("pagebeforehide", "#draw-page", function() {
	clearInterval(timerInterval);
});

window.addEventListener('load', function(event) {
	initCanvas();
	
	document.addEventListener("deviceready", onDeviceReady, false);
	
	$("#draw-page").on("touchmove", function(e) {
		e.preventDefault();
	});
});

$(document).ready(function() {
	$("#gallery-page .draw-button").click(function() {
		changePage("draw-page");
	});
	
	$("#draw-page .back-button, #getready-popup .back-button, #finished-popup .gallery-button").click(function() {
		changePage("gallery-page");
	});
	
	$("#draw-page .finished-button").click(function() {
		finished();
	});
	
	$("#getready-popup .start-button").click(function() {
		$("#getready-popup").popup("close");
		startTimer();
	});
	
	$("#finished-popup .redraw-button").click(function() {
		clearCanvas();
		$("#finished-popup").popup("close");
		startTimer();
	});
	
	$("#finished-popup .post-button").click(function() {
		$("#finished-popup").one("popupafterclose", function() {
			$("#post-popup").popup("open");
			//$("#post-popup .name").focus();
		});
		
		$("#post-popup .name").val("");
		$("#post-popup .form-error").html("");
		$("#post-popup .loading-indicator").hide();
		$("#post-popup .post-button").prop("disabled", false);
		
		$("#finished-popup").popup("close");
	});
	
	$("#post-popup").on("popupafterclose", function() {
		$("#finished-popup").popup("open");
	});
	
	$("#post-popup .name").focus(function() {
		/*
		var newTop = $("#post-popup-popup").offset().top * 0.3;
		$("#post-popup-popup").offset({top: newTop});
		*/
		$("#post-popup-popup").offset({top: 70});
	});
	
	$("#post-popup .name").blur(function() {
		/*
		var newTop = $("#post-popup-popup").offset().top / 0.3;
		$("#post-popup-popup").offset({top: newTop});
		*/
	});
	
	$("#post-popup .post-button").on("tap", function() {
		postImage();
	});
	
	$("input[maxlength]").keyup(function() {
		var maxLength = $(this).attr("maxlength");
		var input = $(this).val();
	
		if(input.length > maxLength) {
			var newVal = input.substring(0, maxLength);
			$(this).val(newVal);
		}
	});
	
	$(".loading-indicator").html("Loading...");
	/*
	$(window).scroll(function() {
		if ($("body").pagecontainer("getActivePage").attr('id') == "gallery-page") {
			if ($(window).scrollTop() + $(window).height() == $(document).height()) {
				alert("bottom!");
				//if there are more posts, get them else show 'No more posts.'
			}
		}
	});
	
	$(document).on("scrollstop", function() {
		if ($("body").pagecontainer("getActivePage").attr('id') == "gallery-page") {
			if ($(window).scrollTop() + $(window).height() == $(document).height()) {
				alert("bottom!");
				//if there are more posts, get them else show 'No more posts.'
			}
		}
	});*/
});

function onDeviceReady() {
	adSetter();
	document.addEventListener("backbutton", onBackKeyDown, false);
}

function initCanvas() {
	ctx = document.getElementById('my_canvas').getContext('2d');
	
	ctx.canvas.addEventListener('touchstart', touchStart);
	ctx.canvas.addEventListener('touchmove', touchMove);
}

function touchStart(event) {
	var touchX = event.changedTouches[0].clientX - ctx.canvas.offsetLeft;
	var touchY = event.changedTouches[0].clientY - ctx.canvas.offsetTop;
	
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.fillStyle = "black";
	
	ctx.beginPath();
	ctx.arc(touchX, touchY, ctx.lineWidth/2, 0, 2 * Math.PI);
	ctx.fill();
	
	ctx.beginPath();
	//ctx.strokeStyle = "red";
	ctx.moveTo(touchX, touchY);
}

function touchMove(event) {
	var touchX = event.changedTouches[0].clientX - ctx.canvas.offsetLeft;
	var touchY = event.changedTouches[0].clientY - ctx.canvas.offsetTop;
	
	ctx.lineTo(touchX, touchY);
	ctx.stroke();
}

function clearCanvas() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function notify(message) {
	var notificationId = new Date().getTime();
	$("body").append('<p id="notification-'+notificationId+'" class="notification">'+message+'</p>');
	setTimeout(function(){ $("#notification-"+notificationId).remove(); }, 3000);
}

var timerInterval;
var timer;

function startTimer() {
	timer = 30;
	$("#draw-page .timer").html(timer);
	timerInterval = setInterval(function(){ decrementTimer(); }, 1000);
}

function decrementTimer() {
	timer -= 1;
	$("#draw-page .timer").html(timer);
	
	if (timer == 0) {
		finished();
	}
}

var imageData;

function finished() {
	clearInterval(timerInterval);
	
	imageData = ctx.canvas.toDataURL("image/jpeg");
	$("#finished-popup .artwork").attr("src", imageData);
	
	$("#finished-popup").popup("open");
}

function onBackKeyDown() {
	var currentPageId = $("body").pagecontainer("getActivePage").attr('id');
	
	if (currentPageId == "draw-page") {
		if ($("#post-popup-popup").hasClass("ui-popup-active")) {
			$("#post-popup").popup("close");
		} else {
			changePage("gallery-page");
		}
	} else if (currentPageId == "gallery-page") {
		if ($("#enlarge-popup-popup").hasClass("ui-popup-active")) {
			$("#enlarge-popup").popup("close");
		} else {
			navigator.app.exitApp();
		}
	} else {
		//window.history.back();
	}
}

function changePage(pageId) {
	$("body").pagecontainer("change", "#"+pageId, null);
}

function postImage() {
	$("#post-popup .form-error").html("");
	var name = $("#post-popup .name").val().trim();
	/*
	if (name == "") {
		$("#post-popup .name").focus();
		$("#post-popup .form-error").html("Please enter your name.");
		return;
	}
	*/
	$("#post-popup .post-button").prop("disabled", true);
	$("#post-popup .loading-indicator").show();
	
	$.post(siteUrl+"post_image.php", {
		user_id : localStorage.user_id,
		name : name,
		image_data : imageData
	}, function(data, status) {
		$("#post-popup .loading-indicator").hide();
		$("#post-popup .post-button").prop("disabled", false);
		
		if (data == "success") {
			notify("Image posted.");
			$("#post-popup").popup("close");
		} else {
			$("#post-popup .form-error").html(data);
		}
	});
}

function createUserId() {
	var a = new Date().getTime();
	var b = Math.floor((Math.random() * 100) + 1);
	return a + "" + b;
}

function getPosts(lastPostId) {
	if (lastPostId == null) {
		lastPostId = "";
		$("#gallery-page .posts").html("");
		$("#gallery-page .no-more-posts").hide();
	}
	
	$("#gallery-page .loading-indicator").show();
	
	$.get(siteUrl + "get_posts.php", {
		last_post_id : lastPostId
	}, function(data, status) {
		$("#gallery-page .loading-indicator").hide();
		
		var response = JSON.parse(data);
		var posts = response.posts;
		var listItems = "";
		
		for (var i = 0; i < posts.length; i++) {
			var post = posts[i];
			
			var content = '<img src="' + siteUrl + post.image_path + '" alt="Artwork" class="artwork">';
			content += '<h2>Uploaded by ' + post.name + '</h2>';
			content += '<p class="date-and-time">' + getTimePassed(post.seconds_passed) + '</p>';
			listItems += '<li onclick="enlargeArtwork(\''+ siteUrl + post.image_path +'\');">' + content + '</li>';
		}
		
		$("#gallery-page .posts").append(listItems);
		$("#gallery-page .posts").listview("refresh");
		
		if (response.more_posts) {
			lastPostId = posts[posts.length - 1].id;
			
			$(document).on("scrollstop", function() {
				if ($("body").pagecontainer("getActivePage").attr('id') == "gallery-page") {
					if ($(window).scrollTop() + $(window).height() == $(document).height()) {
						console.log("bottom!");
						$(document).off("scrollstop");
						getPosts(lastPostId);
					}
				}
			});
			//$("#feed-page .load-more-button").off().click(function() {getFeed(lastPostId);});
			//$("#feed-page .load-more-button").show();
		} else {
			$("#gallery-page .no-more-posts").show();
		}
	});
}

function enlargeArtwork(url) {
	$("#enlarge-popup .artwork").attr("src", "");
	$("#enlarge-popup .artwork").attr("src", url);
	$("#enlarge-popup .artwork").attr("width", $(window).width());
	$("#enlarge-popup").popup("open");
}

function getTimePassed(secondsPassed) {
	if (secondsPassed < 60) {//minute
		return secondsPassed + " second" + addSToTimePassed(secondsPassed);
	} else if (secondsPassed < 3600) {//hour
		var minutesPassed = Math.floor(secondsPassed / 60);
		return minutesPassed + " minute" + addSToTimePassed(minutesPassed);
	} else if (secondsPassed < 86400) {//day
		var hoursPassed = Math.floor(secondsPassed / 3600);
		return hoursPassed + " hour" + addSToTimePassed(hoursPassed);
	} else if (secondsPassed < 172800) {
		return "Yesterday";
	} else if (secondsPassed < 604800) {//week
		var daysPassed = Math.floor(secondsPassed / 86400);
		return daysPassed + " day" + addSToTimePassed(daysPassed);
	} else if (secondsPassed < 2629743.83) {//month
		var weeksPassed = Math.floor(secondsPassed / 604800);
		return weeksPassed + " week" + addSToTimePassed(weeksPassed);
	} else if (secondsPassed < 31556926) {//year
		var monthsPassed = Math.floor(secondsPassed / 2629743.83);
		return monthsPassed + " month" + addSToTimePassed(monthsPassed);
	} else {
		var yearsPassed = Math.floor(secondsPassed / 31556926);
		return yearsPassed + " year" + addSToTimePassed(yearsPassed);
	}
}

function addSToTimePassed(value) {
	return ((value != 1) ? "s ago" : " ago");
}

function adSetter() {
	var admobid = {};
	// select the right Ad Id according to platform
	if (/(android)/i.test(navigator.userAgent)) {
		admobid = {// for Android
			banner : 'ca-app-pub-9124771327241907/6592520273'
		};
	} else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
		admobid = {// for iOS
			banner : 'ca-app-pub-9124771327241907/6592520273'
		};
	} else {
		admobid = {// for Windows Phone
			banner : 'ca-app-pub-9124771327241907/6592520273'
		};
	}

	if (typeof AdMob !== "undefined") {
		AdMob.createBanner({
			adId : admobid.banner,
			adSize : "CUSTOM", width : $(window).width(), height : 50,
			overlap : true,
			position : AdMob.AD_POSITION.BOTTOM_CENTER,
			autoShow : true
		});
	}
}


