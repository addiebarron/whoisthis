appNameToID = 
    {
        'Messaging' : '#contacts',
        'Mail' : '#mail_nav',
        'To-Do List' : '#todo',
        'Notes' : '#notes_nav',
        'Records' : '#records_nav'
    };

allNotifications = 
    [];

openingFadeTime = 1000; 

notiCounter = 0;
notificationsPossible = false;

$(document).ready(function() {
    
}); // close $(document).ready()

function getNotification(app, notiText, time, avoidable) {
    if (typeof(app)==='undefined') app = 'Messaging';
    if (typeof(notiText)==='undefined') notiText = 'New Message from [sender]';
    if (typeof(time)==='undefined') time = '10:00AM';
    if (typeof(avoidable)==='undefined') avoidable = true;

    var thisPageID = $.mobile.pageContainer.pagecontainer('getActivePage').attr('id');

	var $popup = 
	$('<div/>').popup({
		id : 'noti_popup_' + notiCounter.toString(),
		dismissible : false,
		theme : 'b',
		overlayTheme : 'none',
        positionTo : 'origin'
	}).on('popupafterclose', function(){ //run when the popup closes
        $(this).remove();

        $('[data-role="page"]').css({position : ''})
        if (!avoidable){
            $(':mobile-pagecontainer').pagecontainer('change', appNameToID[app], {transition:'pop'});
        }
    });

    $('<div data-role="header"><h2>'+app+'</h2></div>')
    .prependTo($popup);

    $('<p/>', {
    	text : notiText,
        width : $(window).width()/2.
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
    /*if (thisPageID != "home") {
        $('#home_svg').hide();
    }*/
   
    $newNotificationInList = $('<li><a href="'+appNameToID[app]+'""><h1 class="mail_subject">'+notiText+'</h1><p class="mail_time ui-li-aside"><strong>'+time+'</strong></p></a></li>');

    $newNotificationInList.appendTo('#notifications_list');

    if (thisPageID == '#notifications') {
        $('#notifications_list').listview('refresh');
    }

    notiCounter = notiCounter + 1
}

function scrollToBottom()
{
    $(document).scrollTop(10000000);
}

(function ($) { //allows us to use "show" and "hide" as events.
      $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
          this.trigger(ev);
          return el.apply(this, arguments);
        };
      });
    })(jQuery);