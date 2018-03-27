(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider.
		state('app.dashboard', {
			url: "/dashboard",
			views: {
				'menuContent' :{
					template: "<dashboard-view></dashboard-view>"					
				}
			},
			data : { authenticate : true}/*,
			resolve: {		        
		        ChatSessions() {
		          return Meteor.subscribe('ChatSessions');
		        }
		    }*/
		});
	})
	.directive('dashboardView', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/dashboard/dashboard.html",			
			controllerAs: 'dashboard',
			controller: function ($scope, $reactive, $ionicHistory, $rootScope, $state, $stateParams, Auth, $ionicPopup, Toastr, $ionicSideMenuDelegate, $location) {
				$reactive(this).attach($scope);
				$rootScope.header_title = '<span class="atlas-title-db">atlas</span>';
				$ionicHistory.clearHistory();
				$ionicSideMenuDelegate.canDragContent(true);
				var vm= this;
				vm.chat_dashboard_data = {
		 			chat_session_id : null,
		 			chat_name : null,
		 			chat_visitor_id : null,
		 			start_chat_text : null,
		 			is_network_found : true,
		 			button_disable : false,
		 			chat_session_id : null,
		 			total_chats : 0,
		 			testArr : [],
		 			is_not_enter : false,
					pre_defined_default_chats_messages : [
						'We are a team of local experts that acts as your virtual assistant. Send us a message and tell us what you need. A human operator will respond as soon as possible.', 
						'Here are few examples of things you can request: \n -Delivery services - food, grocery, and laundry \n -Online shopping \n -Travel bookings - planes, trains, car service, taxis \n -Restaurant reservations \n -SIM cards \n -Home cleaning, moving and repair services \n -Help with visa or bank issues \n -Place a phone call on your behalf \n -Translations and interpretations ',
						'This is your task feed. Click here to learn more!']
				}

				vm.chat_data = {
					last_message_id : 0,
					close_chat : true
				}

				/// START FEtCHING AGENT MESSAGES BY CALLING GET PENDING MESSAGES CALL
                Meteor.setTimeout(function(){
                	Meteor.settings.public.global_stop_pool_messages = '';
                	Meteor.settings.public.global_stop_pool_messages = true;
                  	///
					console.log("Meteor.settings.public.global_stop_pool_messages DASHBOARD ");
					console.log(Meteor.settings.public.global_stop_pool_messages);
                  Meteor.call("poolPendingMessagesOfChat", vm.chat_data, function(error, result){
                    if(error){
                      console.log("aaaaaa");
                    } else {
                      console.log("cccccc");
                    }
                  });
                  ///
                },  500);

				//////////////////////////////////// STARTSS  DEFAULT MESSAGES LOGS ////////////////////////////////////
				var i =0;
				//ADD MESSAGE TO MONGO	
				vm.addDefaultMessageToMongo = function(new_chat_session_id) {
					if(i < 3) {
							vm.chat_dashboard_data.is_not_enter = false;
						if(i == 2){
							vm.chat_dashboard_data.is_not_enter = true;
						}
						vm.message_data = {
							text : vm.chat_dashboard_data.pre_defined_default_chats_messages[i],      
							user_id : Auth.user.user_id,//vm.chat_data.user_id,
							user_type : 'agent',
							lat : null,
							lng : null,
							chat_session_id : new_chat_session_id,
							type : "text",
							is_sent : false,
							date : moment().format("MMM DD")
						};
						Meteor.call('message.add', vm.message_data, vm.chat_dashboard_data.is_not_enter, function(error, resAdded){
							if(error){
								Toastr.show(error.reason, 'error');
								return false;
							} else {
								Meteor.setTimeout(function(){									
									if( i < 3 ) {
										i++;
										vm.addDefaultMessageToMongo(vm.message_data.chat_session_id);									
									}
								}, 1000);
								return resAdded;
							}
						});
					}
				};

				var addChatDataForNewUser = function(){
					//if(i < 2) {
						var testX = moment().format("MMM-DD HH:mm");
						vm.chat_session_data = {
							name: 'Welcome to atlas',
							visitor_id : Date.now(),
							user_id : Auth.user.user_id,
							is_current_chat : false,
							livechat_session_ids: "null",
							ticket_id : "null",
							archive : false
						};
						Meteor.call('chatSession.add', vm.chat_session_data, function(error, result){
							if(error){
							console.log(error);
								Toastr.show(error.reason + "", 'error');
								return false;
							} else {
								Meteor.setTimeout(function(){
									vm.chat_data_update_rec = {
										_id: result,
										is_read: true
									};
								  	Meteor.call('chatSession.update', vm.chat_data_update_rec, function(error, resultChatUpdateRec){
										if(error){
											return false;
										}
										vm.addDefaultMessageToMongo(result);
										// if( i < 2 ){
										// 	i++;
										// 	addChatDataForNewUser();									
										// }
									});	
								}, 1000); 
							}
						});
					//}
				};
				Meteor.call('chatSession.getChatSessionCountByUserId', Auth.user.user_id, function(error, result){
					if(error){
						console.log(error);
						Toastr.show(error.reason + "", 'error');
						return false;
					}
					vm.total_chats = result;
					if(vm.total_chats == 0) {
						//console.log(123);
						addChatDataForNewUser();
					}

				});
				//////////////////////////////////// ENDSSSS ////////////////////////////////////

				this.subscribe('ChatSessions');
                this.helpers({
                    chat_sessions: () => {
                        return ChatSessions.find({ archive: false }, { sort: { updated_at: -1 } }).fetch().filter((chatSession) => {
                            // var msg_list = Messages.find({ chat_session_id: chatSession._id }, {
                            //     sort: { created_at: -1 },
                            //     limit: 1
                            // }).fetch();
                            // if (msg_list.length > 0) {
                            //     chatSession.last_message = msg_list[0].text;
							// }
							return (chatSession.created_at && chatSession.updated_at) && (chatSession.created_at.toString() != chatSession.updated_at.toString());
                        });
                    }
                });
				
				this.openChatSession = function(chat_session_id, chat_name, chat_visitor_id, chat_is_read){
					if(Meteor.status().connected === false && chat_visitor_id == ''){
						Toastr.show("Network found error", 'error');
					} else {    
                        requestToGA('event', 'clicked', 'Home Feed', chat_name, null);
						$state.go('app.chatsession', {chat_param: {chat_session_id: chat_session_id, chat_session_name: chat_name, chat_visitor_id : chat_visitor_id, chat_is_read : chat_is_read}});
					}
				};
                
                this.startNewChatSession = function(){
                    var chat_name = moment().format("MMM DD @ HH:mm");
                    $rootScope.header_title = 'New Task on '+ chat_name;
                    requestToGA('event', 'clicked, message sent', 'New Chat', chat_name, null);
                    $state.go('app.chatsession');    
                };

				this.chatStartFunc = function(chatStartForm){
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", 'error');
					} else {
						$state.go('app.chatsession', {
							chat_param: {chat_session_id: vm.chat_dashboard_data.chat_session_id, 
							chat_session_name: vm.chat_dashboard_data.start_chat_text, 
							chat_visitor_id : null,
							chat_is_read : null
						}});
					}
				};
		
				this.removeChatSession = function(chat_session_id){
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", 'error');
					} else {
						// An elaborate, custom popup
					   var myPopup = $ionicPopup.show({
					     // template: '<input type="password" ng-model="data.wifi">',
					     title: 'Confirm',
					     template: 'Are you sure you want to delete?',
					     scope: $scope,
					     buttons: [
					       { text: 'Cancel' },
					       {
					         text: '<b>Delete</b>',
					         type: 'button-assertive',
					         onTap: function(e) {
					           Meteor.call('chatSession.archive', chat_session_id, function(error, result){
						       		if(error){
						       			Toastr.show(error.reason, 'error');
						       			return false;
						       		}
						       	});
					         }
					       },
					     ]
					   });
					   myPopup.then(function(res) {
					     console.log('Tapped!', res);
					   });							
					}
				};
			}
		}
	});
	
})();
