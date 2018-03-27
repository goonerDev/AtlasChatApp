Push.debug = true;

 Push.allow({
    send: function(userId, notification) {
    console.log("notificationnotificationnotification");
    console.log(userId);
    console.log(notification);
        return true; // Allow all users to send
    }
});

Push.addListener('token', function(token) {
        console.log('Token: ' + JSON.stringify(token));
      });

 Meteor.methods({
    serverNotification: function(text,title, numberId) {
        var badge = 1
        Push.send({
            from: 'push',
            title: title,
            text: text,
            badge: badge,
            icon : 'pushicon',
            sound: 'default',//'airhorn.caf'
            payload: {
                title: title,
                text:text,
                historyId: "123"
            },
            query: {
                // this will send to all users
            },
            notId: numberId
        });
    },
    basicSend : function(){
        Push.send({
          from: 'Test',
          title: 'Hello',
          text: 'World',
          badge: 12,
          query: {}
        });
    },
    userNotification: function(text, title, user_id) {
        var badge = 5;
        Push.send({
            from: 'push',
            title: title,
            text: text,
            //badge: badge,
            sound: 'airhorn.caf',
            payload: {
                title: title,
                historyId: "123"
            },
            query: {
                userId: user_id //this will send to a specific Meteor.user()._id 
           // }
            // },
            // payload: { 
            //     gotoView: 'app.chatsession', { chat_param: {chat_session_id: notification_chat_id, chat_session_name: title,  chat_visitor_id : null
            //             }}
            }
        });
    },
 });

/*
$state.go('app.chatsession', {
                            chat_param: {chat_session_id: vm.chat_dashboard_data.chat_session_id, 
                            chat_session_name: vm.chat_dashboard_data.start_chat_text, 
                            chat_visitor_id : null
                        }});
*/