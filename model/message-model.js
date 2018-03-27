(function(){

  Messages = new Mongo.Collection('messages');

  // message schema definition.. 
  Messages.attachSchema( 
    new SimpleSchema({
      text : { type: String },              
      user_type : { type : String},
      chat_session_id : { type : String },
      type : { type : String },
      lat : { type : String , optional : true},
      lng : { type : String , optional : true},
      temp_chat_session_id : { type : String , optional : true},
      date : { type : String },
      is_sent : { type : Boolean , optional : true},
      is_sent_ico_status : { type : String , optional : true},
      user_id : {        type : String      },
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

  //message methods.. 
  Meteor.methods({
    'message.add'(message, is_defauult_enter) {
      // console.log('>>>> ' +is_defauult_enter+ "  <<<<<" );
      var last_message = null;
      if(message.type == "text"){
        last_message = message.text;
      } else if(message.type == "image"){
        last_message = "Image";
      } else if(message.type == "map"){
        last_message = "Map";
      }
      checkIfAuthorized();  
      // console.log(">>>>> " + message.text);
      ChatSessions.update({_id : message.chat_session_id}, { $set : { 
        'last_message': last_message,
        'is_read': true,
      } });//{ 'name': name }  
      if(is_defauult_enter != true) {
        return Messages.insert(message);    //will return id of inserted item..
      } else {
        return true;
      }
    }, 
  //   newMessage(message) {

  //   // message.timestamp = new Date();
  //   // message.userId = this.userId;
    
  //   console.log(message);

  //   const messageId = Messages.insert(message);

  //   return messageId;
  // },     
    'message.update'(message) {
      //console.log(message);
        checkIfAuthorized();        
        return Messages.update({_id : message._id}, { $set : message });//{ 'name': name }
    }, 
    'message.remove'(message){
      checkIfAuthorized();
      return Messages.remove(message._id);
    },
    'message.findMessagesByChatSession'(chat_session_id){
      if (Meteor.isServer) {
        //checkIfAuthorized();
        return Messages.find({ chat_session_id : chat_session_id }).count();
      }
    },
    'message.findAllMessagesByChatSession'(chat_session_id){
      //if (Meteor.isServer) {
        //checkIfAuthorized();
        return Messages.find({ chat_session_id : chat_session_id , is_sent : false  },{skip: 0, limit: 1}).fetch();
      //}
    },
    'message.findAllTextMessagesByChatSession'(chat_session_id){
      //if (Meteor.isServer) {
        //checkIfAuthorized();
        return Messages.find({ chat_session_id : chat_session_id , is_sent : false  },{fields: { text : 1} }).fetch();
      //}
    },
    'message.updateAllSentMessagesByMsgId'(msg_arr_unsent, var_message_data_updatez){
      //if (Meteor.isServer) {
        //checkIfAuthorized();
        return Messages.update({_id : {$in : msg_arr_unsent} }, { $set : var_message_data_updatez }, {multi: true});//{ 'name': name } 
      //}
    },
    'message.updateChatSessionId'(temp_chat_session_id, new_chat_session_id) {
        console.log(temp_chat_session_id + " __-__-___ " + new_chat_session_id);
        checkIfAuthorized();        
        return Messages.update({temp_chat_session_id : temp_chat_session_id}, { $set : {"chat_session_id" : new_chat_session_id} }); //{ 'name': name }
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
        'message.add',
        'message.update',
        'message.remove'
    ]);
  }

  if (Meteor.isCordova) {
    Ground.Collection(Messages);
  }

})();

