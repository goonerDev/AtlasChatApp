(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider.
			state('app.resetPasswordKey', {
				url: "/resetPasswordKey",
				params: {chat_param: null},
				views: {
					'menuContent' :{
						template: '<resetpasswordkey-view></resetpasswordkey-view>'
					}
				},
				data : {authenticate : false}
			})
			.state('app.resetNewPassword', {
				url: "/resetNewPassword",
				params: {chat_param: null},
				views: {
					'menuContent' :{
						template: '<resetnewpassword-view></resetnewpassword-view>'
					}
				},
				data : {authenticate : false}
			})
		;

	})

	.directive('resetpasswordkeyView', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/sign-in/reset-password-key.html",
			controllerAs: 'resetpasswordkeyCtrl',
			controller: function ($scope, $reactive, $state, $ionicPopup, $ionicLoading, Auth, Toastr, SignUpService, $ionicModal, $stateParams) {
				$reactive(this).attach($scope);
				var vm= this;
				var test = 0;
				vm.rp_user = {
					secret_key : null,
					password : null
				};

				vm.resetPasswordKey = function(rpForm){
					if(rpForm.$valid){
						//CHECK INTERNET CONNECTIVITY
						if(Meteor.status().connected == true) {
							//GET PROFILE USER INFO details
							var user_sec_key_enter = vm.rp_user.secret_key;
					        Meteor.call('profile.getUserInfoBySecretKey', user_sec_key_enter , function(error, result){
					          if(error){
					            Toastr.show(error.reason + " 777");
					          }else{
					            if(result[0] != undefined){
					            	$state.go('app.resetNewPassword', {chat_param: user_sec_key_enter });
					            } else {
									Toastr.show("Sorry, No key found", 'error');
					            }
					          }
					        });
				    	} else {
							Toastr.show( Meteor.settings.public.network_not_found_error , 'error');
				    	}
						//
					}
				};
				vm.closeModal = function() {
					vm.modal.hide();
				};
			}
		}
	})
	.directive('resetnewpasswordView', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/sign-in/reset-new-password.html",
			controllerAs: 'resetnewpasswordCtrl',
			controller: function ($scope, $reactive, $state, $ionicPopup, $ionicLoading, Auth, Toastr, SignUpService, $ionicModal, $stateParams) {
				$reactive(this).attach($scope);
				var vm= this;
				var test = 0;
				vm.rnp_user = {
					secret_key : null,
					new_password : null,
					confirm_password : null
				};

				vm.rnp_user.secret_key = $stateParams.chat_param;

				if($stateParams.chat_param != null && $stateParams.chat_param != ''){
					///
					vm.resetNewPassword = function(rpForm){
						if(rpForm.$valid){
						//CHECK INTERNET CONNECTIVITY
						if(Meteor.status().connected == true) {
							//GET PROFILE USER INFO details
					        Accounts.resetPassword(vm.rnp_user.secret_key, vm.rnp_user.new_password, function(err) {
						        if (err) {
						          console.log('We are sorry but something went wrong.');
						        } else {
					        		//////////////////////////////////////////////////////////////////////////////////////////////////////
					        		//update details
							        Meteor.call('profile.setNewPasswordByToken', {secret_key : vm.rnp_user.secret_key, password : vm.rnp_user.new_password}, function(error, result){
							          if(error){
							            console.log(error.reason + " 777");
							          }else{
							            console.log("secret key has  been updated");
							            console.log(result);
							          }
							        });
									//////////////////////////////////////////////////////////////////////////////////////////////////////
									console.log('Your password has been changed. Welcome back!');
									Session.set('resetPassword', null);
									$state.go('app.signin');
						        }
						    }); 
						} else {
							Toastr.show( Meteor.settings.public.network_not_found_error , 'error');
						}
							//
						}
					};
					vm.closeModal = function() {
						vm.modal.hide();
					};

					///
				} else {
					Toastr.show("Sorry, No key found", 'error');
					$state.go('app.resetPasswordKey');
				}
			}
		}
	});
})();

