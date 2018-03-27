/*Meteor.publishComposite('ChatSessions', function () {
  return {
    find(user_id) {
      return ChatSessions.find({});
    }
  };
});*/


Meteor.publish("ChatSessions", function () {
    return ChatSessions.find({ user_id : this.userId, archive : false });    
});

Meteor.publish("Addresses", function () {
    return Addresses.find({ user_id : this.userId });    
});

// Meteor.publish("Messages", function () {
//     return Messages.find({ user_id : this.userId });    
// });

Meteor.publishComposite('chats', function() {
  if (!this.userId) return;

  return {
    find() {
      return ChatSessions.find({ user_id: this.userId });
    },
    children: [
      {
        find(chat) {
          return  Messages.find({ chat_session_id: chat._id });
        }
      }
    ]
  };
});

// Meteor.publish("Messages", function () {
//     return Messages.find({user_id : this.userId}, {
//     limit: 25,
//     sort: { created_at: -1 }
//   });    
// });

///THSI IS TEST AGAINS

/*Meteor.publishComposite("Addresses", function () {
  return {
    find() { 
       return Addresses.find({ user_id : this.userId });
    }
  };
});*/

// Meteor.publishComposite('Messages', function () {
//   return {
//     find(chat_session_id) { 
//       return Messages.find({});
//     }
//   };
// });

// Meteor.publishComposite('Testres', function () {
//   return {
//     find() { 
//       return Testres.find();
//     }
//   };
// });