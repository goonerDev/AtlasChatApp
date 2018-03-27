(function () {

  angular.module('atlas')
    .config(function ($stateProvider) {
      $stateProvider.
        state('app.chatsession', {
          //url: "/chatsession/:myParam",
          url: '/chatsession',
          params: { chat_param: null },
          views: {
            'menuContent': {
              template: "<chatsession-view></chatsession-view>"
            }
          },
          resolve: {
            //user: this.isAuthorized,
            chats() {
              return Meteor.subscribe('chats');
            }
          },
          data: { authenticate: true }
        });
    })
    .directive('chatsessionView', function () {
      return {
        restrict: 'E',
        templateUrl: "client/app/chat-session/chat-session.html",
        controllerAs: 'chatSessionCtrl',
        controller: function ($scope, $reactive, $location, $rootScope, Toastr, $ionicLoading, Auth, $state, $stateParams, $ionicScrollDelegate, $cordovaCamera, $ionicActionSheet, $ionicModal, $cordovaGeolocation, $timeout, $ionicSideMenuDelegate, $ionicPopup, MessageSendService) {
          $reactive(this).attach($scope);
          $scope.$on('$ionicView.enter', function (ev) {
            $ionicSideMenuDelegate.canDragContent(false);
            $ionicScrollDelegate.scrollBottom(true);
          });
          var vm = this;
          vm.chat_data = {
            //date : new Date(),
            user_name: null,
            user_email: null,
            user_id: null,
            livechat_session_ids: null,
            date: moment().subtract(2, 'hours').toDate(),
            chat_started: null,
            curr_secured_session_id: null,
            curr_visitor_id: null,
            message: null,
            message_added: null,
            chat_session_id: null,
            chat_message: null,
            chat_title: null,
            interval_start_chat: null,
            interval_pending_message: null,
            total_length_messages: 0,
            last_message_id: 0,
            curr_msg_arr: [],
            rem_msg_arr: [],
            events: [],
            default_message: null,
            default_message_for_agent: null,
            capture_image: null,
            curr_gm_location: null,
            curr_lat: null,
            curr_lng: null,
            user_type: null,
            curr_temp_mesg: null,
            chat_session_enable: true,
            unsent_messages: null,
            is_sent: false,
            is_sent_ico_status: '-1',
            licence_id: Meteor.settings.public.live_chat_licence_id,
            is_new_chat: false,
            button_disable: false,
            is_chat_closed: false,
            is_not_enter: false,
            get_cur_sec_sess_id: null,
            is_rec_running: false,
            is_rec_running_sent: false,
            is_default_message_show: false,
            close_chat: false,
            is_def_msg: false,
            isLoading: true,
            pre_defined_chats_headings: ['Buy Something', 'Order Food', 'Near By', 'Things To Do']
          };
          this.chat_session_id = null;

          //
          // $("textarea").keypress(function (event) {
          //   if (event.keyCode == 13 && !event.shiftKey) {
          //     //
          //     if (Meteor.status().connected === false) {
          //       //vm.chat_data.button_disable = true;
          //       if (!navigator.onLine)
          //         Toastr.show(Meteor.settings.public.network_not_found_error, 'error');
          //     } else {
          //       vm.sendChatMessage(vm.chat_data.message_added);
          //     }
          //     return false;
          //   }
          // });

          //ADD MESSAGE TO MONGO     
          vm.addMessageToMongoOffline = function (msg_type) {
            vm.message_data = {
              text: vm.chat_data.message,
              user_id: Auth.user.user_id,//vm.chat_data.user_id,
              user_type: vm.chat_data.user_type,
              lat: vm.chat_data.curr_lat,
              lng: vm.chat_data.curr_lng,
              chat_session_id: vm.chat_data.chat_session_id,
              type: msg_type,
              is_sent: vm.chat_data.is_sent,
              is_sent_ico_status: is_sent_ico_status,
              date: moment().format("MMM DD")
            };
            var ret_msg = ChatSessions.update({ _id: vm.message_data.chat_session_id }, {
              $set: {
                'last_message': vm.chat_data.message,
                'is_read': true,
              }
            });//{ 'name': name } 
            var mess_return = Messages.insert(vm.message_data);
            vm.chat_data.message = null;
            $ionicScrollDelegate.scrollBottom(true);
            // vm.chat_data.chat_session_id = result;
            return mess_return;
          };

          vm.add_chat_session_data = function () {
            var result = ChatSessions.insert(vm.chat_session_data);
            vm.chat_data.chat_session_id = result;
            Meteor.settings.public.curr_chat_db_id = vm.chat_data.chat_session_id;
            vm.chat_data.message = vm.chat_data.default_message;
            vm.chat_data.user_type = "agent";
            vm.chat_data.is_sent = false;
            vm.addMessageToMongoOffline("text");
          };

          if ($stateParams.chat_param) {
            $rootScope.header_title = $stateParams.chat_param.chat_session_name;
            vm.chat_data.chat_session_id = $stateParams.chat_param.chat_session_id;
            Meteor.settings.public.curr_chat_db_id = vm.chat_data.chat_session_id;
            if ($stateParams.chat_param.chat_visitor_id !== "" && $stateParams.chat_param.chat_visitor_id !== null) {
              vm.chat_data.curr_visitor_id = $stateParams.chat_param.chat_visitor_id;
              vm.chat_data.isLoading = false;
              if ($stateParams.chat_param.chat_is_read == false) {
                // START GETTING PENDING MESSAGES
                vm.chat_data_update_rec = {
                  _id: vm.chat_data.chat_session_id,
                  is_read: true
                };
                Meteor.call('chatSession.update', vm.chat_data_update_rec, function (error, resultChatUpdateRec) {
                  if (error) {
                    return false;
                  }
                });
              }
              vm.chat_data.is_new_chat = false;
              vm.chat_data.is_default_message_show = "";
              vm.chat_data.default_message = " ";
            } else {
              if ($stateParams.chat_param.chat_session_name == "Order Food") {
                vm.chat_data.is_default_message_show = true;
                vm.chat_data.default_message = "Let's get you fed: \n 1) What would you like to eat? \n 2) Where would you like it delivered?";
              } else if ($stateParams.chat_param.chat_session_name == "Buy Something") {
                vm.chat_data.is_default_message_show = true;
                vm.chat_data.default_message = "We'll help you buy anything and get it delivered to your door. What are you looking for today? \n -household goods (paper towels, toilet paper, etc.) \n -electronics \n -groceries  \n -flowers  \n -kitchenware  \n -tickets  \n-clothing  \n-home decor   \n-anything else…";
              } else if ($stateParams.chat_param.chat_session_name == "Things To Do") {
                vm.chat_data.is_default_message_show = true;
                vm.chat_data.default_message = "We tap our local networks to help you discover interesting, relevant events. Just point us in the right direction:  \n  1.  What are you interested in (date ideas, outdoor activities, nightlife, concerts,  museums, etc)? \n 2.  For when? ";
              } else if ($stateParams.chat_param.chat_session_name == "Nearby") {
                vm.chat_data.is_default_message_show = true;
                vm.chat_data.default_message = "Need something now? Send us your location, and we'll find what you're looking for:  \n -restaurants  \n-ATM  \n-cafe  \n-shopping  \n-post office  \n-hotel  \n-gym  \n-hospital  \n-bus/subway station ";
              } else {
                vm.chat_data.is_default_message_show = true;
                vm.chat_data.default_message = " We're on it! Give us a second to connect you with an operator who can help with that.";
                vm.chat_data.default_message_for_agent = $rootScope.header_title + " \n We're on it! Give us a second to connect you with an operator who can help with that.";
              }
              vm.chat_data.date = Date.now();
              vm.chat_data.curr_visitor_id = Date.now();
              if (Meteor.status().connected === false) {
                vm.chat_data.is_new_chat = true;
              }
            }
          } else {
            vm.chat_data.is_default_message_show = true;
            vm.chat_data.default_message = "What can we help you with today?";
            vm.chat_data.date = Date.now();
            var testX = moment().format("MMM DD @ HH:mm");
            $rootScope.header_title = 'New Task on ' + testX;
            vm.chat_data.curr_visitor_id = Date.now();
            if (Meteor.status().connected === false) {
              vm.chat_data.is_new_chat = true;
            }
          }
          vm.chat_data.chat_title = $rootScope.header_title;

          vm.chat_data.user_id = Auth.user._id;
          vm.chat_data.user_name = Auth.user.first_name + " " + Auth.user.last_name;
          vm.chat_data.user_email = Auth.user.email;
          //vm.chat_data.default_message = "Hello "+vm.chat_data.user_name+". What can we do for you??";
          //alert("inetenet status " + Meteor.status().connected); New Task on Feb 10 @ 5:20

          //USER CHAT SESSION DATA        
          vm.chat_session_data = {
            name: $rootScope.header_title,
            visitor_id: vm.chat_data.curr_visitor_id,
            user_id: Auth.user.user_id,
            livechat_session_ids: "null",
            ticket_id: "null",
            ticket_message_timestamp: "null",
            is_current_chat: true,
            curr_secured_session_id: null,
            is_read: true,
            archive: false
          };

          if (vm.chat_data.is_new_chat === true) {
            if (Meteor.status().connected === false) {
              vm.add_chat_session_data();
            }
          }

          if (Meteor.status().connected === false) {
            vm.chat_data.button_disable = true;
            Toastr.show(Meteor.settings.public.network_not_found_error, 'error');
          }

          vm.resendMsg = function (msg) {
            msg.is_sent_ico_status = '0';
            let curr_msg_val = msg.text, curr_msg_ad_id = msg._id;
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
              // template: '<input type="password" ng-model="data.wifi">',
              title: 'Resend Message',
              template: 'Are you sure you want to resend message?',
              scope: $scope,
              buttons: [
                {
                  text: 'Cancel',
                  onTap: function (e) {
                    msg.is_sent_ico_status = '-1';
                  }
                },
                {
                  text: '<b>Resend</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                    if (typeof vm.chat_data.get_cur_sec_sess_id === 'undefined' || vm.chat_data.get_cur_sec_sess_id === '') {
                      Meteor.call('chatSession.getChatSessionDetailById', vm.chat_data.chat_session_id, function (error, resultChatAdded) {
                        if (error) {
                          Toastr.show(error.reason + "", 'error');
                          return false;
                        }
                        if (resultChatAdded.length > 0) {
                          vm.chat_data.get_cur_sec_sess_id = resultChatAdded[0].curr_secured_session_id;
                          //SEND MESSAGE CALL STARTS
                          /////
                          if (Meteor.status().connected === false) {
                            //vm.chat_data.button_disable = true;
                            //if (!navigator.onLine)
                            Toastr.show(Meteor.settings.public.network_not_found_error, 'error');
                          } else {
                            vm.sendOldeMessage(curr_msg_val, curr_msg_ad_id);
                          }
                        }
                      });
                    }
                    else {
                      if (Meteor.status().connected === false) {
                        //vm.chat_data.button_disable = true;
                        //if (!navigator.onLine)
                          Toastr.show(Meteor.settings.public.network_not_found_error, 'error');
                      } else {
                        vm.sendOldeMessage(curr_msg_val, curr_msg_ad_id);
                      }
                    }
                  }
                },
              ]
            });
            myPopup.then(function (res) {
              console.log('Tapped!', res);
            });

          };

          vm.sendOldeMessage = function (curr_msg_val, curr_msg_ad_id) {
            Meteor.call("sendOldMessage", curr_msg_val, vm.chat_data.curr_visitor_id, vm.chat_data.get_cur_sec_sess_id, function (error, resultSendMessage) {
              if (error) {
                vm.updateNotSentMesagesToFalse(curr_msg_ad_id);
              } else {
                //IF API CALL TO SEND MESSAGE RESTURNS TRUE OR FALSE
                var result_send_message_val = JSON.parse(resultSendMessage.content);
                if (result_send_message_val.success === true) {
                  vm.updateNotSentMesagesToTrue(curr_msg_ad_id);
                } else {
                  vm.updateNotSentMesagesToFalse(curr_msg_ad_id);
                }
              }
            });
          }

          this.autoScroll = function () {
            let recentMessagesNum = this.messages.length;

            this.autorun(() => {
              const currMessagesNum = this.getCollectionReactively('messages').length;

              $ionicScrollDelegate.scrollBottom(true);
            });
          };
          //MESSAGE SHOWS FROM MONGO
          // this.subscribe('Messages');

          var chat_session_id = vm.chat_data.chat_session_id;
          vm.chat_data.events = null;
          if (Meteor.status().connected == true) {

            //MAKE CHAT SESSION COLLECTION STARTSSS
            if (!vm.chat_data.chat_session_id && vm.chat_data.chat_session_enable) {
              Meteor.call('chatSession.add', vm.chat_session_data, function (error, resultChatAdded) {
                if (error) {
                  Toastr.show(error.reason + "", 'error');
                  return false;
                } else {
                  vm.chat_data.chat_session_id = resultChatAdded;
                  vm.chat_data.isLoading = false;
                  Meteor.settings.public.curr_chat_db_id = vm.chat_data.chat_session_id;
                  vm.chat_data.message = vm.chat_data.default_message;
                  vm.chat_data.user_type = "agent";
                  vm.chat_data.is_sent = true;
                  vm.chat_data.is_sent_ico_status = '1';
                  var curr_msg_val = vm.chat_data.message;
                  vm.chat_data.is_def_msg = false;
                  console.log(vm.chat_data.chat_session_id);
                  vm.helpers({
                    messages() {
                      msglist = Messages.find({ chat_session_id: vm.chat_data.chat_session_id });
                      return msglist;
                    },
                    
                  });
                  
                  var last_msg_added_id = MessageSendService.addMessageToMongo("text", curr_msg_val, vm.chat_data.is_def_msg, vm).then((data) => {
                    vm.updateNotSentMesagesToTrue(data);
                  }, (error) => {
                    vm.updateNotSentMesagesToFalse(error);
                  });
                  return true;
                }
              });
            } 
            this.helpers({
                  messages() {
                    msglist = Messages.find({ chat_session_id: vm.chat_data.chat_session_id });
                    return msglist;
                  },

                });
            
          this.autoScroll();
            //MAKE CHAT SESSION COLLECTION ENDSSSS


            //START CHAT STARTSS
            Meteor.call("startChat", vm.chat_data, null, function (error, result) {
              if (error) {
                if (!vm.chat_data.chat_session_id && vm.chat_data.chat_session_enable) {

                } else {
                  $ionicLoading.hide();
                  //vm.displayChatMessages();
                  chat_session_id = vm.chat_data.chat_session_id;
                }
                vm.chat_data.chat_session_enable = false;
                $ionicLoading.hide();
                //Toastr.show(error.reason+ " line 89 ", 'error');
                //return false;
              } else {
                // ELSE
                var rslt_data_start_chat = JSON.parse(result.content);
                vm.chat_data.curr_secured_session_id = rslt_data_start_chat.secured_session_id;
                vm.chat_session_data.curr_secured_session_id = rslt_data_start_chat.secured_session_id;
                vm.chat_data.get_cur_sec_sess_id = rslt_data_start_chat.secured_session_id;

                if (vm.chat_data.curr_secured_session_id !== '') {
                  ///
                  Meteor.call("poolPendingMessagesOfChat", vm.chat_data, function (error, result) {
                    if (error) {
                    }
                  });
                  ///

                  var updateData = {
                    curr_secured_session_id: vm.chat_data.curr_secured_session_id,
                    visitor_id: vm.chat_data.curr_visitor_id,
                    _id: vm.chat_data.chat_session_id
                  }
                  //
                  Meteor.call('chatSession.update', updateData, function (error, result_famcs) {
                    if (error) {
                      Toastr.show(error.reason + " #448 ", 'error');
                      return false;
                    }
                  });
                }

                if (!vm.chat_data.chat_session_id && vm.chat_data.chat_session_enable) {
                  // });

                } else {
                  // START GETTING PENDING MESSAGES
                  Meteor.settings.public.curr_chat_db_id = vm.chat_data.chat_session_id;
                  var resp_result_data = JSON.parse(result.content);
                  var cur_sec_sess_id = resp_result_data.secured_session_id;
                  var z = 11;

                  vm.chat_data.curr_secured_session_id = resp_result_data.secured_session_id;
                  //if(z > 10) {
                  //SEND MESSAGES IF SESSION FOUND
                  Meteor.call('message.findAllTextMessagesByChatSession', vm.chat_data.chat_session_id, function (error, result) {
                    if (error) {
                      Toastr.show(error.reason + " #144 ", 'error');
                      return false;
                    } else {
                      //TEST
                      var tot_res = result.length;
                      var i = 0;
                      var sendRecursiveMsg = function () {
                        if (result.length > 0) {
                          vm.message_data_update = {
                            _id: result[i]._id,
                            is_sent: true,
                            is_sent_ico_status: '1'
                          };
                          var msg = result[i].text;
                          var user_curr_visitor_id = vm.chat_data.chat_session_id;
                          Meteor.call('sendOldMessage', msg, vm.chat_data.curr_visitor_id, cur_sec_sess_id, function (error, res) {
                            if (error) {
                              Toastr.show(error + "error");
                            } else {
                              var send_chat_result_data = JSON.parse(res.content);
                              if (send_chat_result_data.success === true) {
                                Meteor.call('message.update', vm.message_data_update, function (error, resultUpdate) {
                                  if (error) {
                                    return false;
                                  } else {
                                    i++;
                                    if (i < tot_res) {
                                      sendRecursiveMsg();
                                    }
                                  }
                                });
                              }
                            }
                          });
                        }
                      };
                      sendRecursiveMsg();
                    }
                  });
                  //}

                  $ionicLoading.hide();
                  chat_session_id = vm.chat_data.chat_session_id;
                }

                //API DATA FETCH STARTS
                var chatsession_user = null;
                var fetch_chat_start_data = function () { //removed this code later..
                  if (result != 'undefined') {
                    chatsession_user = result.statusCode;
                  }
                };
                if (chatsession_user != 200) {
                  fetch_chat_start_data();
                }
                $ionicLoading.hide();
                var result_data = JSON.parse(result.content);
                //START GETTING PENDING MESSAGES
                //vm.chat_data.curr_secured_session_id = result_data.secured_session_id;
                
              }
            });
          }

          this.openChatSession = function () {
          };


          //CHECH LIVE CHART SATRT AGAIN
          vm.startLiveChatSessionAGain = function () {
            //START CHAT STARTSS
            Meteor.call("startChat", vm.chat_data, null, function (errorStartLiveChatSessionAGain, resultStartLiveChatSessionAGain) {
              if (errorStartLiveChatSessionAGain) {
              }
            });
          }

          //ADD MESSAGES To MONGO COLLECtIONS
          //ADD MESSAGE TO MONGO    
        vm.addMessageToMongo = function(msg_type, curr_msg_val, is_def_msg) {

          vm.message_data = {
            text : vm.chat_data.message,      
            user_id : Auth.user.user_id,//vm.chat_data.user_id,
            user_type : vm.chat_data.user_type,
            lat : vm.chat_data.curr_lat,
            lng : vm.chat_data.curr_lng,
            chat_session_id : vm.chat_data.chat_session_id,
            type : msg_type,
            is_sent : vm.chat_data.is_sent,
            is_sent_ico_status : '0',
            date : moment().format("MMM DD")
          }; 
          
          if(!is_def_msg){
            vm.message_data.is_sent_ico_status = '1';
          }
          Meteor.call('message.add', vm.message_data, vm.chat_data.is_not_enter, function(error, resAddedMesg){
            if(error){
              vm.chat_data.is_sent = false;
              vm.chat_data.is_sent_ico_status = '-1';
              Toastr.show(error.reason + "", 'error');
              return "false";
            } else {
              vm.chat_data.message = null;
              var msg_ad_id = resAddedMesg;

                /////// TSRATSSSSSSSS
                var last_sent_message = vm.chat_data.message;
                vm.chat_data.curr_temp_mesg = vm.chat_data.message;
                //vm.chat_data.message_added = null;
                vm.chat_data.message = null;
                $ionicScrollDelegate.scrollBottom(true);
                //MESSAGE ADD IN MONGO ENDSSS


                // =======================================================
                //******************************
                if (typeof vm.chat_data.get_cur_sec_sess_id === 'undefined' || typeof vm.chat_data.curr_visitor_id === 'undefined' ||
                  vm.chat_data.get_cur_sec_sess_id === '' || vm.chat_data.curr_visitor_id === '') {
                  Meteor.call('chatSession.getChatSessionDetailById', vm.chat_data.chat_session_id, function (error, resultChatAdded) {
                    if (error) {
                      vm.chat_data.is_sent = false;
                      vm.chat_data.is_sent_ico_status = '-1';
                      Toastr.show(error.reason + "", 'error');
                      return false;
                    }
                    if (resultChatAdded.length > 0) {
                      vm.chat_data.get_cur_sec_sess_id = resultChatAdded[0].curr_secured_session_id;
                      vm.chat_data.curr_visitor_id = resultChatAdded[0].visitor_id;
                      vm.startLiveChatSessionAGain();
                    }
                  });
                }

                  //SEND MESSAGE CALL STARTS
                  if (is_def_msg && vm.chat_data.curr_visitor_id !== '' && vm.chat_data.get_cur_sec_sess_id !== '') {
                    Meteor.call("sendOldMessage", curr_msg_val, vm.chat_data.curr_visitor_id, vm.chat_data.get_cur_sec_sess_id, function (error, resultSendMessage) {
                      if (error) {
                        vm.chat_data.is_sent = false;
                        vm.chat_data.is_sent_ico_status = '-1';
                        //CALL MESSAGE STATUS OT FALSE FUNCTION
                        vm.updateNotSentMesagesToFalse(msg_ad_id);
                      } else {
                        //IF API CALL TO SEND MESSAGE RESTURNS TRUE OR FALSE
                        var result_send_message_val = JSON.parse(resultSendMessage.content);
                        if (result_send_message_val.success === true) {
                          vm.updateNotSentMesagesToTrue(msg_ad_id);
                        } else {
                          vm.updateNotSentMesagesToFalse(msg_ad_id);
                        }
                      }
                    });
                  } else {
                    if (vm.chat_data.curr_visitor_id === '' || vm.chat_data.get_cur_sec_sess_id === '' ){
                      Meteor.setTimeout(function(){
                        vm.sendOldeMessage(curr_msg_val, msg_ad_id);
                      }, 2 * 1000);                    
                    }
                  }
                //SEND MESSAGE CALL ENDS
                //******************************
                // =======================================================


                vm.getUnsentMessages = function () {
                  if (vm.chat_data.is_rec_running === false) {
                    var tot_lnth_all_msgs = 0;
                    //SEND MESSAGES IF SESSION FOUND
                    Meteor.call('message.findAllTextMessagesByChatSession', vm.chat_data.chat_session_id, function (error, result_famcs) {
                      if (error) {
                        Toastr.show(error.reason + " #448 ", 'error');
                        return false;
                      } else {
                        if (result_famcs.length == 0)
                          return;
                        var k = 0;
                        var temp_val = '';
                        var msg_arr_unsent = [];

                        for (var p = 0; p < result_famcs.length; p++) {
                          vm.chat_data.is_rec_running = true;
                          temp_val += result_famcs[p].text + '\n';
                          msg_arr_unsent.push(result_famcs[p]._id);
                          tot_lnth_all_msgs = parseInt(result_famcs.length) - 1;

                          var temp1 = vm.chat_data.curr_visitor_id;

                          if (p == parseInt(result_famcs.length) - 1) {
                            vm.message_data_updatez = {
                              is_sent: true,
                              is_sent_ico_status: '1'
                            };
                            if (typeof vm.chat_data.get_cur_sec_sess_id === 'undefined' || typeof vm.chat_data.get_cur_sec_sess_id === 'undefined' ||
                              vm.chat_data.get_cur_sec_sess_id === '' || vm.chat_data.curr_visitor_id === '') {
                              if (error) {
                                Toastr.show(error.reason + "", 'error');
                                return false;
                              }
                            }
                          }
                          //////////////// STARTS SEND OLD MESSAGES
                          Meteor.call('sendOldMessage', temp_val, vm.chat_data.curr_visitor_id, vm.chat_data.get_cur_sec_sess_id, function (error, res_solm) {
                            if (res_solm) {
                              //console.log(res_solm.content);
                              var send_chat_result_data = JSON.parse(res_solm.content);
                              if (send_chat_result_data.success === true) {
                                //UPDATE MESSAGES
                                Meteor.call('message.updateAllSentMessagesByMsgId', msg_arr_unsent, vm.message_data_updatez, function (error, resultUpdate_mu) {
                                  if (error) {
                                    Toastr.show(error.reason + " #509 ", 'error');
                                    vm.chat_data.button_disable = false;
                                    vm.chat_data.is_rec_running = false;
                                    return false;
                                  } else {
                                    if (resultUpdate_mu) {
                                      vm.chat_data.is_rec_running = false;
                                      vm.chat_data.button_disable = false;
                                      vm.chat_data.is_rec_running_sent = false;
                                    }
                                  }
                                });
                              } else {
                                $scope.$apply();
                                vm.chat_data.is_rec_running = false;
                              }
                            }
                          });
                          //////////////// ENDSSS SEND OLD MESSAGES
                        }
                      }
                    });
                  }
                };

                //vm.getUnsentMessages();
              }
            });

          };


          //UPDATE MESSAGE STATUS IF NOT SENT TOFLAG STATUS
          vm.updateNotSentMesagesToFalse = function (msg_ad_id) {
            console.log('updateNotSentMesagesToFalse');
            //START GETTING
            vm.message_data_update_rec = {
              _id: msg_ad_id,
              is_sent: false,
              is_sent_ico_status: '-1'
            };
            Meteor.call('message.update', vm.message_data_update_rec, function (error, resultUpdateRec) {
              if (error) {
                return false;
              }
            });
            vm.chat_data.message = null;
          };

          vm.updateNotSentMesagesToTrue = function (msg_ad_id) {
            console.log('updateNotSentMesagesToTrue');
            //START GETTING
            vm.message_data_update_rec = {
              _id: msg_ad_id,
              is_sent: true,
              is_sent_ico_status: '1'
            };
            Meteor.call('message.update', vm.message_data_update_rec, function (error, resultUpdateRec) {
              if (error) {
                return false;
              }
            });
            vm.chat_data.message = null;
          };

          isConnected = function () {
            if (Meteor.status().connected === false) {
              vm.chat_data.button_disable = true;
              Toastr.show(Meteor.settings.public.network_not_found_error, 'error');
              return false;
            }
            vm.chat_data.button_disable = false;
            return true;
          }

          // vm.sendMessage = function () {
          //   if (_.isEmpty(this.messageme)) return;
          //   var msg_ad_id = '';
          //   this.callMethod('newMessage', {
          //     text: this.messageme,
          //     user_id: Auth.user.user_id,//vm.chat_data.user_id,
          //     user_type: "visitor",   
          //     type: "text",
          //     lat: vm.chat_data.curr_lat,
          //     lng: vm.chat_data.curr_lng,
          //     chat_session_id: vm.chat_data.chat_session_id,
          //     is_sent: vm.chat_data.is_sent,
          //     is_sent_ico_status: '0',
          //     date: moment().format("MMM DD")
          //   },function(err, res){
          //     msg_ad_id = res;
          //     Meteor.call("sendOldMessage", this.messageme, vm.chat_data.curr_visitor_id, vm.chat_data.get_cur_sec_sess_id, function (error, resultSendMessage) {
          //       if (error) {
          //         vm.chat_data.is_sent = false;
          //         vm.chat_data.is_sent_ico_status = '-1';
          //       } else {
          //         //IF API CALL TO SEND MESSAGE RESTURNS TRUE OR FALSE
          //         var result_send_message_val = JSON.parse(resultSendMessage.content);
          //         if (result_send_message_val.success === true) {
          //           console.log(msg_ad_id);
          //           vm.updateNotSentMesagesToTrue(msg_ad_id);
          //         } else {
          //           console.log(msg_ad_id);
          //           vm.updateNotSentMesagesToFalse(msg_ad_id);
          //         }
          //       }
          //     });
          //   });
          //   delete this.messageme;
          // }

          vm.isTrackMessage = true;
          vm.sendChatMessage = function (sendMsgForm) {
            if (isConnected()) {
              if (vm.chat_data.message_added != null) {
                try {
                  if (vm.messages.length == 1) {
                      requestToGA('event', 'First Message', 'Chat', vm.chat_data.chat_title, null);
                      vm.isTrackMessage = false;
                  } else if (vm.messages.length > 1){
                      if(vm.isTrackMessage)
                        requestToGA('event', 'Message', 'Historical Chat', vm.chat_data.chat_title, null);
                      vm.isTrackMessage = false;
                  }
                  vm.chat_data.user_type = "visitor";
                  vm.chat_data.message = vm.chat_data.message_added;
                  var curr_msg_val = vm.chat_data.message_added;
                  vm.chat_data.message_added = null;
                  vm.chat_data.is_sent = false;
                  vm.chat_data.is_sent_ico_status = '-1';
                  vm.chat_data.is_def_msg = true;
                  var last_msg_added_id = MessageSendService.addMessageToMongo("text", curr_msg_val, vm.chat_data.is_def_msg, vm).then((data) => {
                    vm.updateNotSentMesagesToTrue(data);
                  }, (error) => {
                    vm.updateNotSentMesagesToFalse(error);
                  });
                  return true;
                } catch (ex) {
                  vm.chat_data.is_sent = false;
                  vm.chat_data.is_sent_ico_status = '-1';
                  console.log(ex);
                }
              }
            }
          };

          vm.getPhoto = function (is_camera) {
            document.addEventListener("deviceready", function () {

              var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: is_camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 500,
                targetHeight: 500,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
              };

              $cordovaCamera.getPicture(options).then(function (imageData) {
                var image_src = "data:image/jpeg;base64," + imageData;
                var dataURItoBlob = function (dataURI) {
                  var binary = atob(dataURI.split(',')[1]);
                  var array = [];
                  for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                  }
                  return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
                };
                var uploadImageToS3 = function () {
                  var file = dataURItoBlob(image_src);
                  file.name = (new Date).getTime() + Math.floor((Math.random() * 100) + 1) + ".jpg";

                  var uploader = new Slingshot.Upload("myFileUploads");

                  var error = uploader.validate(file);
                  if (error) {
                  }

                  uploader.send(file, function (error, downloadUrl) {
                    if (error) {
                      // Log service detailed response
                      //alert (error);
                    }
                    else {
                      //Meteor.users.update(Meteor.userId(), {$push: {"profile.files": downloadUrl}});
                      vm.chat_data.message = downloadUrl;
                      vm.chat_data.curr_temp_mesg = downloadUrl;
                      vm.chat_data.user_type = 'visitor';
                      var curr_msg_val = downloadUrl;
                      vm.chat_data.is_def_msg = true;
                      var msg_ad_id = vm.addMessageToMongo("image", curr_msg_val, vm.chat_data.is_def_msg);

                      var last_sent_message = "Image";
                      vm.show_sub_footer_overlay = false;
                      //MESSAGE ADD IN MONGO ENDSSS
                      Meteor.call("sendMessage", vm.chat_data, "Image", function (error, result) {
                        if (error) {
                          Toastr.show(error.reason + " ", 'error');
                          return false;
                        } else {
                          //START GETTING PENDING MESSAGES
                          //START GETTING PENDING MESSAGES
                          var send_chat_result_data = JSON.parse(result.content);
                          if (send_chat_result_data.success === true) {
                            vm.message_data_update_rec = {
                              _id: msg_ad_id,
                              is_sent: true,
                              is_sent_ico_status: '1'
                            };
                            Meteor.call('message.update', vm.message_data_update_rec, function (error, resultUpdateRec) {
                              if (error) {
                                return false;
                              }
                            });
                          }
                          vm.chat_data.message = null;
                        }
                      });
                    }
                  });
                };
                uploadImageToS3();

              }, function (err) {
                // error
              });
            });

          };


          // Triggered on a button click, or some other target
          vm.showQuickLaunchActionSheet = function () {

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
              buttons: [
                { text: '<b>Camera</b>' },
                { text: '<b>Gallery</b>' },
                { text: '<b>Maps</b>' }
              ],
              // destructiveText: 'Delete',
              titleText: 'Upload',
              cancelText: 'Cancel',
              cancel: function () {
                // add cancel code..
              },
              buttonClicked: function (index) {
                if (index == 0) {//Camera
                  vm.getPhoto(true);
                } else if (index == 1) { //Gellary
                  vm.getPhoto(false);
                } else {//map
                  vm.openMapModal();
                }
                return true;
              }
            });

          };

          //map code

          $ionicModal.fromTemplateUrl('client/app/chat-session/map-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function (modal) {
            vm.map_modal = modal;
          });

          vm.openMapModal = function () {
            vm.map_modal.show();
            Meteor.startup(function () {
              navigator.geolocation.getCurrentPosition(vm.drawMap, vm.handleError, vm.options);
            });

          };

          vm.closeMapModal = function () {
            vm.map_modal.hide();
          };

          vm.sendMapPosition = function () {

            var gm_location = 'http://www.google.com/maps/place/' + vm.marker.coords.latitude + ',' + vm.marker.coords.longitude;
            vm.chat_data.message = gm_location;
            vm.chat_data.curr_temp_mesg = gm_location;
            vm.chat_data.curr_lat = vm.marker.coords.latitude;
            vm.chat_data.curr_lng = vm.marker.coords.longitude;
            vm.chat_data.user_type = "visitor";
            var curr_msg_val = gm_location;
            //MESSAGE ADD IN MONGO FUNCTION CALLED
            vm.chat_data.is_def_msg = true;
            var msg_ad_id = vm.addMessageToMongo("map", curr_msg_val, vm.chat_data.is_def_msg);
            //
            var last_sent_message = "Map";
            vm.show_sub_footer_overlay = false;
            vm.closeMapModal();
            //MESSAGE ADD IN MONGO ENDSSS
            Meteor.call("sendMessage", vm.chat_data, "Map", function (error, result) {
              if (error) {
                Toastr.show(error.reason + " ", 'error');
                return false;
              } else {
                //START GETTING PENDING MESSAGES
                var send_chat_result_data = JSON.parse(result.content);
                if (send_chat_result_data.success === true) {
                  vm.message_data_update_rec = {
                    _id: msg_ad_id,
                    is_sent: true,
                    is_sent_ico_status: '1'
                  };
                  Meteor.call('message.update', vm.message_data_update_rec, function (error, resultUpdateRec) {
                    if (error) {
                      return false;
                    }
                  });
                }
                //START GETTING PENDING MESSAGES
                vm.chat_data.message = null;

              }
            });
            //
          };


          vm.myLocation = {
            lng: '',
            lat: ''
          };

          vm.options = {
            enableHighAccuracy: true,
            timeout: 50000,
            maximumAge: 0
          };
          vm.showMarkerPopup = function () {
            console.log('showMarkerPopup');
          };
          vm.hideMarkerPopup = function () {
            console.log('hideMarkerPopup');
          };


          vm.drawMap = function (position) {

            //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
            $scope.$apply(function () {
              vm.myLocation.lng = position.coords.longitude;
              vm.myLocation.lat = position.coords.latitude;

              vm.map = {
                center: {
                  latitude: vm.myLocation.lat,
                  longitude: vm.myLocation.lng
                },
                zoom: 14,
                pan: 1
              };

              vm.marker = {
                id: 0,
                coords: {
                  latitude: vm.myLocation.lat,
                  longitude: vm.myLocation.lng
                },
                events: {
                  dragend: function (marker, eventName, args) {
                    console.log('marker dragend');
                    var lat = marker.getPosition().lat();
                    var lon = marker.getPosition().lng();
                    // $log.log(lat);
                    // $log.log(lon);
                    //console.log("lat: " + vm.marker.coords.latitude + '<br/> ' + 'lon: ' + vm.marker.coords.longitude);

                    vm.marker.options = {
                      draggable: true,
                      // labelContent: "lat: " + vm.marker.coords.latitude + '<br/> ' + 'lon: ' + vm.marker.coords.longitude,                     
                      // labelAnchor: "80 120",
                      // labelClass: "marker-labels"
                    };
                  }
                }
              };

              vm.marker.options = {
                draggable: true,
                //labelContent: "lat: " + vm.marker.coords.latitude + '<br/> ' + 'lon: ' + vm.marker.coords.longitude,
                //labelAnchor: "80 120",test
                //labelClass: "marker-labels"
              };
            });
          };

          vm.handleError = function (error) {
            Toastr.show('ERROR(' + error.code + '): ' + error.message, 'error');
            // console.warn('ERROR(' + error.code + '): ' + error.message);
          };

          //DESTROY STARTS
          $scope.$on('$destroy', function () {
            //CLEAR INTERVAL POOLING PENDING MESSAGES
            vm.map_modal.remove();
            //clearInterval(vm.chat_data.interval_start_chat);
            // clearInterval(vm.chat_data.interval_pending_message);  
            Meteor.clearInterval(vm.chat_data.interval_pending_message);

            //START CLOSE CHAT
            Meteor.call("closeChat", vm.chat_data, function (error, result) {
              if (error) {
                vm.chat_data.curr_secured_session_id = null;
                Toastr.show(error.reason, 'error');
                return false;
              } else {
                vm.chat_data.curr_secured_session_id = null;
              }
            });
          });
        }
      };
    });

})();