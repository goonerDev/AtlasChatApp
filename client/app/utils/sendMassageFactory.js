(function () {

    angular.module('atlas').factory('MessageSendService', ['$q', 'Auth', function ($q, Auth) {
        startLiveChatSessionAGain = function (curr_msg_val, msg_ad_id, defer, vm) {
            //START CHAT STARTSS
            Meteor.call("startChat", vm.chat_data, null, function (errorStartLiveChatSessionAGain, resultStartLiveChatSessionAGain) {
                if (error) {
                    console.log(errorStartLiveChatSessionAGain);
                } else {
                    console.log(resultStartLiveChatSessionAGain);
                    sendOldMessageinFactory(curr_msg_val, msg_ad_id, defer, vm);
                }
            });
        }
        isConnected = function () {
            if (Meteor.status().connected === false) {
                vm.chat_data.button_disable = true;
                Toastr.show(Meteor.settings.public.network_not_found_error, 'error');
                return false;
            }
            vm.chat_data.button_disable = false;
            return true;
        }
        sendOldMessageinFactory = function (curr_msg_val, msg_ad_id, defer, vm) {
            Meteor.call("sendOldMessage", curr_msg_val, vm.chat_data.curr_visitor_id, vm.chat_data.get_cur_sec_sess_id, function (error, resultSendMessage) {
                
                if (error) {
                    vm.chat_data.is_sent = false;
                    vm.chat_data.is_sent_ico_status = '-1';
                    defer.reject();
                    //CALL MESSAGE STATUS OT FALSE FUNCTION
                } else {
                    //IF API CALL TO SEND MESSAGE RESTURNS TRUE OR FALSE
                    var result_send_message_val = JSON.parse(resultSendMessage.content);
                    if (result_send_message_val.success === true) {
                        defer.resolve(msg_ad_id);
                    } else {
                        defer.reject(msg_ad_id);
                    }
                }
            });
        }
        return {
            addMessageToMongo: function (msg_type, curr_msg_val, is_def_msg, vm) {
                var defer = $q.defer();
                vm.message_data = {
                    text: vm.chat_data.message,
                    user_id: Auth.user.user_id,//vm.chat_data.user_id,
                    user_type: vm.chat_data.user_type,
                    lat: vm.chat_data.curr_lat,
                    lng: vm.chat_data.curr_lng,
                    chat_session_id: vm.chat_data.chat_session_id,
                    type: msg_type,
                    is_sent: vm.chat_data.is_sent,
                    is_sent_ico_status: '0',
                    date: moment().format("MMM DD")
                };

                if (!is_def_msg) {
                    vm.message_data.is_sent_ico_status = '1';
                }

                    Meteor.call('message.add', vm.message_data, vm.chat_data.is_not_enter, function (error, resAddedMesg) {
                        if (error) {
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
                            // vm.chat_data.message_added = null;
                            vm.chat_data.message = null;
                            //$ionicScrollDelegate.scrollBottom(true);
                            //MESSAGE ADD IN MONGO ENDSSS


                            // =======================================================
                            //******************************
                            if (vm.chat_data.get_cur_sec_sess_id=== null || typeof vm.chat_data.get_cur_sec_sess_id === 'undefined' || typeof vm.chat_data.curr_visitor_id === 'undefined' ||
                                vm.chat_data.get_cur_sec_sess_id === '' || vm.chat_data.curr_visitor_id === '') {
                                Meteor.call('chatSession.getChatSessionDetailById', vm.chat_data.chat_session_id, function (error, resultChatAdded) {
                                    if (error) {
                                        vm.chat_data.is_sent = false;
                                        vm.chat_data.is_sent_ico_status = '-1';
                                        Toastr.show(error.reason + "", 'error');
                                        return false;
                                    }
                                    if (resultChatAdded.length > 0) {
                                        console.log(resultChatAdded[0]);
                                        vm.chat_data.get_cur_sec_sess_id = resultChatAdded[0].curr_secured_session_id;
                                        vm.chat_data.curr_visitor_id = resultChatAdded[0].visitor_id;
                                        //startLiveChatSessionAGain(curr_msg_val, msg_ad_id, defer, vm);
                                        sendOldMessageinFactory(curr_msg_val, msg_ad_id, defer, vm);
                                    }
                                });
                            }
                            else {
                                if (is_def_msg) {
                                    //SEND MESSAGE CALL STARTS
                                    sendOldMessageinFactory(curr_msg_val, msg_ad_id, defer, vm);
                                }
                            }
                        }
                    });
                return defer.promise;
            }
        }
    }])

})();