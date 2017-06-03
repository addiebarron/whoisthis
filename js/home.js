appNameToID = 
    {
        'Messaging' : '#texting',
        'Mail' : '#mail',
        'To-Do List' : '#todo',
        'Notes' : '#notes',
        'Records' : '#records'
    };

appIDToLocation =
    {
        '#texting':[110, 123],
        '#mail': [220, 309],
        '#records': [110, 247]
    }

ENDGAME = false;

allNotifications = 
    [];
notiCounter = 0;
notificationsPossible = false;


openingFadeTime = 1000;

screenChangeTime = 200;
appChangeTime = 300

$(document).ready(function() {

    $('.home-app').click(function(){
        var appID = $(this).data('navigate');
        OpenApp(appID);
    });

    $('.close-app, .go-home').click(function(){
        CloseCurrentApp();
    });

    $('.back-screen').click(function(){
        ScreenBack();
    });
    $('.draw-test').click(function(){
        Get1Noti('#texting');
    });
});

$(document).on('appclosed', function(){

    // Ending - requires no open apps and ENDGAME condition
    if (($('.open-app').length == 0) && (ENDGAME)) {
        $('#endgameoverlay').fadeIn(5000, function(){
            $('body').children('div').not('body #endgameoverlay').remove();
            $(this).children('div').each(function(index) {
                $(this).delay(500*index).fadeIn('slow')
            }); // from https://stackoverflow.com/questions/12089709/sequential-animation-with-jquery-children
        });
    }
});

$(window).keydown(function(e) {
	// If escape is pressed, trigger the back button
	if (e.which == 27) { 
		ScreenBack();
	}
});

$(window).on('load resize', function() {
    DynamicResize();
});

function GetNotification(app, notiText, avoidable) {
    if (typeof(app)==='undefined') {app = 'Messaging';}
    if (typeof(notiText)==='undefined') {notiText = 'New Message from [sender]';}
    if (typeof(avoidable)==='undefined') {avoidable = true;}

    var thisPageID = $('open-app').attr('id');

    $('[data-role="page"]').css({position : ''});

	var $popup = 
	$('<div/>').popup({
		id : 'noti_popup_' + notiCounter.toString(),
		dismissible : false,
		theme : 'b',
		overlayTheme : 'none',
        positionTo : 'origin'
	}).on('popupafterclose', function(){ //run when the popup closes
        
        $(this).remove();

        if (!avoidable) {
            $(':mobile-pagecontainer').pagecontainer('change', appNameToID[app], {transition:'pop'});
        }
    });

    $('<div data-role="header"><h2>'+app+'</h2></div>').prependTo($popup);

    $('<p/>', {
    	text : notiText,
        width : $('body').width()/2.
    }).appendTo($popup);

    if (!avoidable) { // add go to app button
        $('<a>', {
            id : 'noti_goto',
            text : 'Go To App'
        }).buttonMarkup({
            icon : 'arrow-r',
            iconpos : 'right',
            mini : true,
            rel : 'back',
            theme : 'a'
        }).click(function(){
            $popup.popup('close');
        }).appendTo($popup);
    }

    if (avoidable) { // add dismiss button
        $('<a>', {
            id : 'noti_dismiss',
            text : 'Dismiss'
        }).buttonMarkup({
            icon : 'delete',
            iconpos : 'right',
            mini : true,
            rel : 'back',
            theme : 'b'
        }).click( function () {
            $popup.animate({
                top : 0, 
                opacity : 0
            }, 'fast', function(){
                $popup.popup('close');
            }); // when clicking the dismiss button, slide the popup out of frame then delete it. 
        }).appendTo($popup);

        setTimeout(function(){
            if ($popup.parent().hasClass('ui-popup-active')){
                $popup.popup('option', 'dismissible', true);
            }
        },1500); // IF it's an avoidable notification, make sure the popup can't be accidentally closed in the first 1.5 seconds
    }

    $popup.popup('open', {
            x : 0.5*$(window).width(), 
            y : 0*$(window).height()
        }).css({
            top : 0,
            opacity : 0
        }).animate({
            top : 50, 
            opacity : 0.90
        }, 'fast')
        .trigger('create');
   
    $newNotificationInList = $('<li><a href="'+appNameToID[app]+'""><h1 class="mail_subject">'+notiText+'</h1></a></li>');

    $newNotificationInList.appendTo('#notifications_list');

    if (thisPageID == '#notifications') {
        $('#notifications_list').listview('refresh');
    }
}

function OpenApp(id) {
    var $app = $(id);
    
    $app
    .addClass('trans-app')
    .css( 'top', $(window).height() )
    .animate({
        top : 0,
        opacity : 1
    }, appChangeTime, function(){
        // callback, triggered at the end of the animation
        $(this)
        .addClass('open-app')
        .removeClass('trans-app')
	        .children('.current-screen')
	        .removeClass('trans-screen');
    })
    .children('.current-screen')
    .addClass('trans-screen');
}

function CloseCurrentApp(callback, args) {
    callback = callback || DoNothing;
    args = args || 0;

    var $currentApp = $('.open-app');

    if ($currentApp.exists()) {
        $currentApp
        .removeClass('open-app')
        .addClass('trans-app')
        .animate({
            top : $(window).height(), 
            opacity : 0
        }, appChangeTime, function(){
            $(this)
            .removeClass('trans-app')
            .children('.current-screen')
    		.removeClass('trans-screen');
            callback(args);
        })
        .children('.current-screen')
    	.addClass('trans-screen');
    }
}

function GoHome() {
    CloseCurrentApp();
}

function ChangeApps(id) {
    CloseCurrentApp(OpenApp, id);
}

function ScreenTo(id) {
    var $currentApp = $('.open-app');

    if ($currentApp.exists()) {
        var $currentScreen = $currentApp.children('.current-screen');
        var $targetScreen = $(id);

        if ($targetScreen.exists() && $currentScreen.exists()) {

            $currentScreen
            .removeClass('current-screen')
            .addClass('trans-screen')
            .animate({
                left : '-100%',
            }, screenChangeTime, function(){
                $(this).removeClass('trans-screen').addClass('last-screen');
            });

            $targetScreen
            .addClass('trans-screen')
            .css('left', '100%')
            .animate({
                left : 0, 
            }, screenChangeTime, function(){
                $(this).removeClass('trans-screen').addClass('current-screen');
            });
        }
    }
}
function ScreenBack() {
    var $currentApp = $('.open-app');

    if ($currentApp.exists()) { // If there is an app open,
    	console.log('There is an app open.');
        var $currentScreen = $currentApp.children('.current-screen');
        var $lastScreen = $currentApp.children('.last-screen')
        
        if ($lastScreen.exists() && $currentScreen.exists()) { // AND there is a "last screen" to go to,
        	console.log('We are in a nested screen. Going back one screen');
            $currentScreen
            .removeClass('current-screen')
            .addClass('trans-screen')
            .animate({
                left : '100%'
            }, screenChangeTime, function(){
                $(this).removeClass('trans-screen');
            });
            $lastScreen
            .removeClass('last-screen')
            .addClass('trans-screen')
            .css('left', '-100%')
            .animate({
                left : 0, 
            }, screenChangeTime, function(){
                $(this).removeClass('trans-screen').addClass('current-screen');
            });
        } else if (!$lastScreen.exists() && $currentScreen.exists() ) { // Otherwise, we are in the main screen. Just close the app.
        	console.log('We are in the main screen. Going to the home screen.');
        	GoHome();
        } else if (!$lastScreen.exists() && !$currentScreen.exists() ) { // This would only happen if I forgot to put an '.app-screen' in an '.app'. There should always at least be a '.current-screen' if an '.app' is open.
        	console.log('There is no screen open. Doing nothing. This should only happen if I forgot to put an .app-screen or a .current-app in an .app. There should always at least be a .current-screen if an .app is open.');
        	DoNothing();
        }
    } else {
    	console.log('There is no app open. Doing nothing.');
        DoNothing();
    }
}

function ClearNotifications() {
    c = $('#noti-canvas');
    ct = c[0].getContext('2d');
    ct.clearRect(0, 0, c.width(), c.height());
}

function Get1Noti(id) {
    var $canvas = $('#noti-canvas');
    var ctx = $canvas[0].getContext('2d');

    ClearNotifications();

    //draw circle
    ctx.beginPath();
        ctx.arc.apply(ctx, appIDToLocation[id].concat([10,0,2*Math.PI]));
        ctx.fillStyle = 'rgba(220,20,20,0.9)';
        ctx.strokeStyle = 'rgba(150,20,20,0.9)';
        ctx.stroke();
        ctx.fill();
    ctx.closePath();

    //draw number
    ctx.beginPath();
        ctx.font = '15px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText.apply(ctx,['1'].concat(appIDToLocation[id]));
    ctx.closePath();

}

function DynamicResize() {
    w = $(window).width();
    h = $(window).height();
    $('#noti-canvas').attr('width',0.6*h).attr('height',h);
}
function DoNothing(x){
}

$.fn.exists = function () {
    return this.length > 0;
}
