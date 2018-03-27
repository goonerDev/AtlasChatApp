(function(){

  ChatSessions = new Mongo.Collection('chat_sessions');

  // ChatSession schema definition..
  ChatSessions.attachSchema( 
    new SimpleSchema({
      name: { type: String },
      visitor_id : { type: String },      
//      livechat_session_ids:{ type: [String], optional : true },      
      livechat_session_ids:{ type: String, optional : true },      
      ticket_id : {type: String, optional : true},    
      last_message : {type: String, optional : true},
      curr_secured_session_id : {type: String, optional : true},
      is_read : { type : Boolean , optional : true},
      archive : { type : Boolean , optional : true},
      is_current_chat : { type : Boolean , optional : true},
      ticket_message_timestamp : { type : String , optional : true},
      user_id : {
        type : String, 
        autoValue : function(){
          if (this.isInsert && checkIfAuthorized()) {            
              return Meteor.userId();            
          }          
        }
      },
      created_at : {
        type: Date,
        autoValue: function() {
          if (this.isInsert) {
            return new Date();
          } else if (this.isUpsert) {
            return {$setOnInsert: new Date()};
          } else {
            this.unset();  // Prevent user from supplying their own value
          }
        }
      },
      updated_at : {
        type: Date,
        autoValue: function() {
          if (this.isUpdate) {
            return new Date();
          }
        },
        denyInsert: true,
        optional: true
      }
    })
  );

  // ChatSession methods.. 
  Meteor.methods({
    'chatSession.add'(chat_session_data) {
      //checkIfAuthorized(); 
      return ChatSessions.insert(chat_session_data);    // will return id of inserted item.
    },
    'chatSession.update'(session) {
        //checkIfAuthorized();
        return ChatSessions.update({_id : session._id}, { $set : session });//{ 'name': name }
    }, 
    'chatSession.updateAllChats'() {
        //checkIfAuthorized();
        return ChatSessions.update({user_id : Meteor.userId()}, { $set : { 'is_current_chat': false } },  {multi: true});//{ 'name': name }
    }, 
    'chatSession.remove'(chat_session_id){
      //checkIfAuthorized();
      return ChatSessions.remove(chat_session_id);
    }, 
    'chatSession.archive'(chat_session_id){
      //checkIfAuthorized();
      return ChatSessions.update({_id : chat_session_id}, { $set : { 'archive': true } }); //{ 'archive': archive }
    },
    'chatSession.getChatSessionDetailById'(chat_session_id){
      if (Meteor.isServer) {
        //checkIfAuthorized();
        console.log("chat_session_id chat_session_id chat_session_id chat_session_id");
        console.log(chat_session_id);
        return ChatSessions.find({ _id : chat_session_id  }).fetch();
      }
    },
    'chatSession.getChatSessionCountByUserId'(chat_curr_user_id){
      if (Meteor.isServer) {
        console.log(Meteor.userId());
        //checkIfAuthorized();
        return ChatSessions.find({ user_id : chat_curr_user_id}).count();
      }
    }
  });   

  var checkIfAuthorized = function (){
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update his name.');
    }  
  };

  if ( Meteor.isClient ) {
    Ground.methodResume([
        'chatSession.add',
        'chatSession.update',
        'chatSession.remove',
        'chatSession.archive',
        'chatSession.getChatSessionDetailById'
    ]);
  }

  if (Meteor.isCordova) {
    Ground.Collection(ChatSessions);
  }


})();