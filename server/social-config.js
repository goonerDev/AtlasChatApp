Meteor.startup(function() {

	ServiceConfiguration.configurations.remove({
	    service: 'facebook'
	});


	// /*Zaka app id*/
	ServiceConfiguration.configurations.insert({
	    service: 'facebook',
	    appId: Meteor.settings.facebook.app_id,
	    version : Meteor.settings.facebook.version_num,
	    secret: Meteor.settings.facebook.secret_key
	});
});	

