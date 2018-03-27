(function(){
  /*
  *Generic methods..
  */

  Meteor.methods({  
    getFacebookUserData (user) {
      Meteor.user().services.facebook;
    },
    checkLiveChatInterval () {
      var curr_user_logged_id = this.userId;

      if (Meteor.isServer) {
        /////// TESTING CRON JOB CALING STARTSSSSS
        SyncedCron.config({
          collectionName: 'Messages'
        });

        ////// TESTING CRON JOB CALLING NEDSSSSSSS
        var interval_check = false;
        Meteor.setInterval((function () {
          
          var service_response = null;
          var response_event_length = 0;
          var j  = 0;
          var res_data_chat_session = ChatSessions.find({ user_id : curr_user_logged_id, archive : false   }).fetch();
          //NOW LOOP TO CHECK IF THERE IS ANY UPDATE FROM THE TICKET OR NOT AGAINST TIME STAMP

          var checkEachChatsTicket = function() {
                  if(res_data_chat_session.length > 0 && j < res_data_chat_session.length && res_data_chat_session.length != null) {
                    var i  = 0;

                    //NULL IS STRING BELOW
                    //  console.log(res_data_chat_session.length);
                    if(res_data_chat_session[j].ticket_id != "null" && res_data_chat_session[j].ticket_id != null){
                      var req_body_ticket_name = res_data_chat_session[j].name;
                      var req_body_ticket_visitor_id = res_data_chat_session[j].visitor_id;
                      var req_body_ticket_webhook = res_data_chat_session[j].ticket_id;
                      var curr_chat_session_id_in_interval = res_data_chat_session[j]._id;
                      var curr_chat_session_last_updated = res_data_chat_session[j].updated_at;
                      var curr_chat_session_last_updated_by = res_data_chat_session[j].updated_at;
                      var last_chat_session_message_timestamp = new Date(res_data_chat_session[j].updated_at).getTime();
                      var last_chat_ticket_message_timestamp = res_data_chat_session[j].ticket_message_timestamp;
                      if(last_chat_ticket_message_timestamp == undefined || last_chat_ticket_message_timestamp == "null" ) {
                        last_chat_ticket_message_timestamp = new Date(res_data_chat_session[j].updated_at).getTime() - 120 * 1000;
                      }

                      if(req_body_ticket_webhook != null || req_body_ticket_webhook != "" ) {
                        Meteor.call("getTicketDetail", req_body_ticket_webhook, function(error, result) {
                        if(error){
                              return false;
                        } else { 
                          service_response = JSON.parse(result.content);
                          response_event_length = service_response.events.length;

                          ///////STARTS RECURSIVE

                          var checkAgentNewMessage = function(){
                            if(response_event_length > 0 && i < response_event_length && service_response.status != "spam" && service_response.status != "solved") {
                              if(i > 0){
                                var last_ticket_message_timestamp = new Date(service_response.events[i].date).getTime();                               
                                var res_data_messages = Messages.find({ chat_session_id : curr_chat_session_id_in_interval, user_type : "agent"  }, {sort: {$natural : -1}, limit: 1 }).fetch();
                                if(res_data_messages.length > 0) {
                                  if(res_data_messages[0].user_type == "agent" ){
                                    var last_chat_message_timestamp = new Date(res_data_messages[0].created_at).getTime();
                                  }  
                                  if (last_ticket_message_timestamp > last_chat_ticket_message_timestamp && service_response.events[i].message != null && service_response.events[i].message != ''){
                                    ////
                                    //SEND NOTIFICATIONS
                                    if (Meteor.settings.public.push_notifications_enable === true){
                                      Meteor.call('userNotification', service_response.events[i].message, req_body_ticket_name, curr_user_logged_id);
                                    }
                                    ChatSessions.update({_id : curr_chat_session_id_in_interval}, { 
                                      $set : { 
                                        'last_message': service_response.events[i].message,  
                                        'ticket_message_timestamp' : last_ticket_message_timestamp,
                                        'is_read': false,
                                        'archive': false,
                                      } 
                                    });
                                    message_data = {
                                      text : service_response.events[i].message,      
                                      user_id : curr_user_logged_id,//vm.chat_data.user_id,
                                      user_type : 'agent',
                                      lat : '',
                                      lng : '',
                                      chat_session_id : curr_chat_session_id_in_interval,
                                      type : 'text',
                                      is_sent : true,
                                      date : moment().format("MMM DD")
                                    };
                                    // console.log("Message added");
                                    var ret_added_resp = Messages.insert(message_data);
                                    ////
                                  }
                                }
                              }
                              if (i < response_event_length) {
                                i++;
                                checkAgentNewMessage();
                                }
                              }  else if( service_response.status === "solved" || service_response.status === "spam" ) {
                                    ChatSessions.update({_id : curr_chat_session_id_in_interval}, { $set : { 'archive': true } });
                              }
                          };
                          //var i = 0;
                          checkAgentNewMessage();
                          interval_check = true;
                        }
                        });
                      }
                    }
                      j++;
                      checkEachChatsTicket();
                  }
                };
                checkEachChatsTicket();

          var send_unsent_messages = function() {
          }
        }), 10 * 1000);
      }
    },
    startChat (user_data) {
      if(user_data.curr_secured_session_id == null) {
        if (Meteor.isServer) {
          if(user_data.default_message_for_agent != null){
            user_data.default_message = user_data.user_name + " : "+user_data.default_message_for_agent;
          }
          var url = "https://api.livechatinc.com/visitors/"+user_data.curr_visitor_id+"/chat/start";
          return HTTP.call("POST", url,
            {
              data: {
              licence_id: user_data.licence_id,
              welcome_message: user_data.default_message,
              email : user_data.user_email,
              nick : user_data.user_name
            },
            headers : {
              'X-API-VERSION' : 2
            }
          });
        }
      }
    },
    getPendingMessagesData (user_data) {
      if (Meteor.isServer) {
        if(user_data.curr_secured_session_id) {
          
          var url = "https://api.livechatinc.com/visitors/"+user_data.curr_visitor_id+"/chat/get_pending_messages";
          return HTTP.call("GET", url,
            {
              data: {
              licence_id: user_data.licence_id,
              secured_session_id: user_data.curr_secured_session_id,
              last_message_id : user_data.last_message_id
            },
            headers : {
              'X-API-VERSION' : 2
            }
          });
        }
      }
    },
    sendMessage (user_data, msg) {
      if (Meteor.isServer) {
        if(user_data.curr_secured_session_id) {
          var url = "https://api.livechatinc.com/visitors/"+user_data.curr_visitor_id+"/chat/send_message";
          return HTTP.call("POST", url,
            {
              data: {
                licence_id: user_data.licence_id,
                secured_session_id: user_data.curr_secured_session_id,
                group : 0,
                message : user_data.curr_temp_mesg
              },
              headers : {
                'X-API-VERSION' : 2
              }
          });
        }
      }
    },
    sendOldMessage (msgOld, user_curr_visitor_id, user_curr_secured_session_id) {
      if (Meteor.isServer) {
        if(user_curr_visitor_id) {
          var url = "https://api.livechatinc.com/visitors/"+user_curr_visitor_id+"/chat/send_message";
          return HTTP.call("POST", url,
            {
              data: {
                licence_id: Meteor.settings.public.live_chat_licence_id,
                secured_session_id: user_curr_secured_session_id,
                group : 0,
                message : msgOld
              },
              headers : {
                'X-API-VERSION' : 2
              }
          });
        }
      }
    },
    getTicketDetail (ticket_data) {
      if (Meteor.isServer) {
        //if(user_curr_visitor_id) {
          var url = "https://api.livechatinc.com/v2/tickets/"+ticket_data;
          return HTTP.call("GET", url,
            {
              headers : {
                'X-API-VERSION' : 2,
                'Authorization' : Meteor.settings.public.live_chat_Auth_token,
              }
          });
        //}
      }
    },
    closeChat (user_data) {
      if (Meteor.isServer) {
        if(user_data.get_cur_sec_sess_id) {
          var url = "https://api.livechatinc.com/visitors/"+user_data.curr_visitor_id+"/chat/close";
          return HTTP.call("POST", url,
            {
              data: {
                licence_id: user_data.licence_id,
                secured_session_id: user_data.get_cur_sec_sess_id
              },
              headers : {
                'X-API-VERSION' : 2
              }
          });
        }
      }
    },
    sendCustomerDetails (user_data) {
      if (Meteor.isServer) {

        Meteor.call('profile.getUserInfoByUserId', user_data.visitor.email, function(error, responseRec) {
          if(error){
            return false;
          } else {
            var data_arr_var = [];
            var gender_val = null;
            var date_of_birth_val = null;

            if (typeof responseRec[0].date_of_birth !== 'undefined' && responseRec[0].date_of_birth !== null) {
              var date_of_birth_val = new Date(responseRec[0].date_of_birth);
              var mn = date_of_birth_val.getMonth()+1;     // 11
              var dt = date_of_birth_val.getDate()+1;      // 29
              var yr = date_of_birth_val.getFullYear();  
              date_of_birth_val =  dt+"-"+mn+"-"+yr;          
            }
            if(responseRec[0].gender != 'undefined') {
              gender_val = responseRec[0].gender;
            }

            data_arr_var.push({ name: 'Gender', value: gender_val });
            if(date_of_birth_val)
                data_arr_var.push({ name: 'Date-Of-Birth', value: date_of_birth_val });

            if(responseRec) {
              var url = "https://api.livechatinc.com/visitors/"+user_data.visitor.id+"/details";
              return HTTP.call("POST", url,
              {
                data: 
                {
                  license_id : Meteor.settings.public.live_chat_licence_id,
                  token: user_data.token,
                  id : "Vf Atlas Chat App",
                  "fields":data_arr_var
                },
                headers : {
                    'X-API-VERSION' : 2
                }
              });
            }
          }
        });        
      }
    },
    getVisitorIdByChatId (current_live_chat_id) {
      if (Meteor.isServer) {
        var url = "https://api.livechatinc.com/chats/"+current_live_chat_id;
        return HTTP.call("GET", url,
          {
            headers : {
              'X-API-VERSION' : 2,
              'Authorization' : Meteor.settings.public.live_chat_Auth_token,
            }
        });
      }
    },
    poolPendingMessagesOfChat (vm_chat_data) {
      var curr_user_msg_logged_id = this.userId;
      if (Meteor.isServer) {

        ///////----------------------------------------------------------------------------////
        ///////----------------------------------------------------------------------------////
        //API DATA FETCH STARTSSSSSSSS

        var q = 0;
        var iterate_pending_message_data = function() {
          var p = 0;
          var k = 0;
          var url = "https://api.livechatinc.com/visitors/"+vm_chat_data.curr_visitor_id+"/chat/get_pending_messages";
          HTTP.call("GET", url,
            {
              data: {
              licence_id: vm_chat_data.licence_id,
              secured_session_id: vm_chat_data.curr_secured_session_id,
              last_message_id : vm_chat_data.last_message_id
            },
            headers : {
              'X-API-VERSION' : 2
            }
          }, function (error, result) {
            if (error) {
            } else {
              vm_chat_data.curr_msg_arr = [];
              var chat_result_data = JSON.parse(result.content);
              vm_chat_data.curr_msg_arr = chat_result_data.events;
              var curr_total_messages_len = vm_chat_data.curr_msg_arr.length;

                ///////STARTS RECURSIVE
              var iterate_chat_data = function() {
                if(curr_total_messages_len > 0 ) {
                  if( p < curr_total_messages_len ) {
                    if(vm_chat_data.curr_msg_arr[p].text != undefined && vm_chat_data.curr_msg_arr[p].user_type == 'agent' && vm_chat_data.curr_msg_arr[p].type == "message"  ) {
                      vm_chat_data.message = vm_chat_data.curr_msg_arr[p].text;
                      vm_chat_data.user_type = vm_chat_data.curr_msg_arr[p].user_type;
                      vm_chat_data.is_sent = true;
                      vm_message_data = {
                        text : vm_chat_data.message,      
                        user_id : curr_user_msg_logged_id,//vm.chat_data.user_id,
                        user_type : "agent",
                        lat : null,
                        lng : null,
                        chat_session_id : vm_chat_data.chat_session_id,
                        type : "text",
                        is_sent : true,
                        date : moment().format("MMM DD")
                      };
                      //UPDATE LAST MESSAGE
                      ChatSessions.update({_id : vm_chat_data.chat_session_id}, { $set : { 'last_message': vm_chat_data.message, 'is_read': true } });
                      //INSERT IN MESSAGE COLLECTION 
                      var res_msg = Messages.insert(vm_message_data);
                      
                      vm_chat_data.last_message_id = vm_chat_data.curr_msg_arr[p].message_id;
                      p++;
                      iterate_chat_data();

                    } else if (vm_chat_data.curr_msg_arr[p].type == "chat_closed") {
                        return;
                    } else {
                      vm_chat_data.last_message_id = vm_chat_data.curr_msg_arr[p].message_id;
                      p++;
                      iterate_chat_data();                      
                    }
                  }   
                }
              };
              if(p < 1) {
                iterate_chat_data();
                q++;
              }
              vm_chat_data.interval_pending_message = Meteor.setTimeout(function(){
                if(p <= curr_total_messages_len ){
                  //console.log(Meteor.settings.public.global_stop_pool_messages);
                  iterate_pending_message_data();
                }
              }, 1 * 1000);
            }
          });
        };

        if(q < 1) {
          vm_chat_data.interval_pending_message = Meteor.setTimeout(function(){
            iterate_pending_message_data();
          }, 1 * 1000);
        }
        //API DATA FETCH ENDSSS
        ///////----------------------------------------------------------------------------////
        ///////----------------------------------------------------------------------------////


      }
    }
  });  


  Slingshot.fileRestrictions("myFileUploads", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
  });

   /*
  * Global methods.
  */
  
})();
