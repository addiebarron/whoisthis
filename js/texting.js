// FOR MESSAGING APP
msgsData = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'json/story.json',
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

contactsArray = ['Mom','Hawthorne','Linnea'];
//contactsArray=contactsArray.sort(); // alphabetize

allMsgs = {};
lastMsgs = {};
msgActiveResponses = {};
counterArray = {};

for(var i=0; i < contactsArray.length; i++) {
	allMsgs[contactsArray[i]] = '';
	lastMsgs[contactsArray[i]] = '';
	msgActiveResponses[contactsArray[i]] = [];
	counterArray[contactsArray[i]] = 0;
}

$(document).ready(function() {

    $('#contacts_header h2').text('Contacts ('+contactsArray.length.toString()+')') // set up header with number of contacts
    
    for (var i=0; i<contactsArray.length; i++) // loop through contacts and create the contacts screen
    {
    	$('<li><div id="contact-'+contactsArray[i]+'"><h1 style="display:inline">'+contactsArray[i]+'</h1><pre class="lastmsg">'+lastMsgs[contactsArray[i]]+'</pre></div></li>')
    			.appendTo('#contacts_list')
    			.click(SetupMessageScreen(contactsArray[i]));
    }
    
    $('#sendbtn').click( function(){
    	if ($('#msg_input').val() != '') {
			SendMsg($('#msg_header h2').text(), $('#msg_input').val(), '10:00AM', false);
			$('#msg_response_options').html('');
			$('#msg_list').listview('refresh');
		}
	}); 
});


function ReceiveMsg(sender, msgID, timeout) {

	if (typeof(timeout)==='undefined') {timeout = 3000}

	// initialization / variables

	var msg = msgsData[sender][msgID];
	var msgText = msg.text;
	var msgArray = msgText.split('//');
	var msgResponses = msg.responses;

	setTimeout(function(){
		PrintMsg(sender, msgArray, msgResponses);
	},timeout);
}

function PrintMsg(sender, msgArray, msgResponses) {

	var thisPageID = $.mobile.pageContainer.pagecontainer('getActivePage').attr('id');

	var msgText = msgArray.shift();

	if (msgArray.length > 0) {
		msgActiveResponses[sender] = {};
	}
	else if (msgArray.length == 0) {
		msgActiveResponses[sender] = msgResponses;
	}

	var newMsgHtml = '<li class="response"><div class="responsetext">'+msgText+'</div></li>'; // define new message in html form

	allMsgs[sender] = allMsgs[sender].concat(newMsgHtml); // update allMsgs array to include new message

	lastMsgs[sender] = $(allMsgs[sender]).children().last().text(); // update lastMsgs array to include new message text

	$('#contacts_list').find('.lastmsg').each( function(i) {
		if (lastMsgs[contactsArray[i]] != undefined) 
		{
			$(this).text('   ' + lastMsgs[contactsArray[i]]);
		}
	});	// update all of the last messages in the contacts screen

	if (thisPageID != 'msging')
	{
		$('#msg_list').html(''); // clear the message screen if we are not on the message screen
	}

	// make sure everything is styled and displayed correctly

	if (thisPageID == 'msging') { 
		SetupMessageScreen(sender)();
		$('#msg_list').listview('refresh');
		scrollToBottom();
	} // if we are already on the messaging screen, set up the messaging screen immediately.  otherwise, wait until the relevant contact is clicked

	if (msgArray.length > 0) {
		//run gif until timeout is over
		var timeout = msgArray[0].length*75;
		setTimeout(function(){
			PrintMsg(sender, msgArray, msgResponses);
		},timeout);
	}
	else {
		var response = Object.keys(msgResponses)[0];
		if (response == 'notification') {

			$('#msg_response_navbar').remove();
			setTimeout(function(){
				var noti = msgActiveResponses[sender][response];
				if (noti.type == 'email') {
					getNotification('Mail', 'New email from '+noti.sender, true);
					ReceiveMail(noti.id);
				}
				else if (noti.type == 'message') {
					getNotification('Messaging', 'New message from '+noti.sender, true);
					ReceiveMsg(noti.sender, noti.id);
				}
			}, 20000);
		} 
	}
}

function SendMsg(contact, messageText)
{
	var msgID = msgActiveResponses[contact][messageText];
	//Fires when you click the Send button (or press Enter).  Prints what you typed onto the screen.  If the message is "hi", starts countdown to a response.  Then empties the input box and updates the array of messages. 
	$('#msg_list')
		.append('<li class="msg"><div style="white-space:normal" class="msgtext">'+messageText+'</div></li>')
		.listview('refresh');

	$('#msg_input').val(''); //empty the input box
	
	allMsgs[contact] = $('#msg_list').html(); //store all the current messages in the variable allMsgs (in html format)
	
	lastMsgs[contact] = $('#msg_list').children().last().text(); //store the last message as a string in lastMsgs
	
	$('#contacts_list').find('.lastmsg').each( function(i) {
		$(this).text('  ' + lastMsgs[contactsArray[i]]);
	});	// add the last message to the contacts screen under the right contact

	scrollToBottom();

	ReceiveMsg(contact, msgID);
}

function SetupMessageScreen(contact){
	return function(){
		$('#messages .header h2').text(contact);
		$('#msg_list').html(allMsgs[contact]);

		var responses = Object.keys(msgActiveResponses[contact]);

		if (responses.length==0 || responses[0]=='notification') {
			var $responseTable = $('#messages .footer .responses .table-row');
			$responseTable.empty();
			$('<div>', {'class': 'table-cell cell-1'})
				.text('Error: no responses could be generated')
				.appendTo($responseTable);
		} else {
			for (var i = 0; i < responses.length; i++) {
				var $responseTable = $('#messages .footer .responses .table-row');
				$responseTable.empty();
				var response = responses[i];
				$('<div>', {'class': 'floating table-cell cell-'+parseInt(i)})
					.text(response)
					.appendTo($responseTable)
					.click(OnMsgResponseClick(contact,response));
			}
		}

		ScreenTo('#messages');
	}
}

function OnMsgResponseClick(contact, response){
	return function(){
		SendMsg(contact, response);
		$('#msg_response_options').html('');
		$('#msg_list').listview('refresh');
	}
}