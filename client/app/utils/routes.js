if (Meteor.isClient) { 
	Tracker.autorun(function () {
	  Meteor.subscribe('ChatSessions');
	  Meteor.subscribe('Messages');
	  Meteor.subscribe('Addresses');
	  Meteor.subscribe('Profiles');
	});
  }