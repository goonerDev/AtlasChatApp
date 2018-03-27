(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider.
			state('app.signin', {
				url: "/signin",
				views: {
					'menuContent' :{
						template: '<sign-in-form></sign-in-form>'
					}
				},
				data : {authenticate : false}
			});

	})

	.directive('signInForm', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/sign-in/sign-in.html",
			controllerAs: 'signinCtrl',
			controller: function ($scope, $reactive, $state, $ionicPopup, $ionicLoading, Auth, Toastr, SignUpService, $ionicModal) {
                
				$reactive(this).attach($scope);
				var vm= this;
				var test = 0;
				vm.user = {
					email : null,
					password : null
				};
				this.subscribe('userData');

				vm.signIn = function(signInForm){
					if(signInForm.$valid){
						//CHECK INTERNET CONNECTIVITY
						if(Meteor.status().connected == true) {
							Meteor.loginWithPassword(vm.user.email, vm.user.password, function(error){
								if(error){
									Toastr.show(error.reason + "", 'error');
									return false;
								}
	                            requestToGA('event', 'Complete', 'Login', 'Login', null);
								SignUpService.getUserInfo().then(function(result){
									Auth.user = result;
									Auth.authenticate();
									$scope.$emit('authenticated');
									$state.go('app.dashboard');
								},
								function(error){
									Toastr.show(error.reason, 'error');
								});

							});
						} else {
								Toastr.show( Meteor.settings.public.network_not_found_error , 'error');
						}
					}
				};

				this.signInFacebook = function(){

					//CHECK INTERNET CONNECTIVITY
					if(Meteor.status().connected == true) {
						Meteor.loginWithFacebook({requestPermissions: ['email', 'public_profile', 'user_friends', 'user_likes']},  function(err){
							if (err) {
								//throw new Meteor.Error("Facebook login failed");
								Toastr.show("Facebook login failed", 'error');
								return;
							}
							var user= Meteor.user();
							if (user.hasOwnProperty('services') && user.services.hasOwnProperty('facebook')) {
								Meteor.call("profile.isUserExist", user.services.facebook.email, function(error, result){
									if(error){
										Toastr.show(error.reason, 'error');
										return;
									} else {
										if(result < 1) {
											//Auth.authenticate();
											$state.go('app.signupfb');
										} else {
	                                        requestToGA('event', 'Complete', 'Facebook Login', 'Name/Demographics/Password', null);
											//Session.set('curr_user_email', vm.user.email);
											SignUpService.getUserInfo().then(function(result){
												Auth.user = result;
												Auth.authenticate();
												$state.go('app.dashboard');
												$scope.$emit('authenticated');
											},
											function(error){
												Toastr.show(error.reason, 'error');

											});
										}
									}

								});
							}
						});
					
					} else {
						Toastr.show( Meteor.settings.public.network_not_found_error , 'error');
					}
				};


				//forgot password
				vm.fp_user = {
					email : null
				};

				$ionicModal.fromTemplateUrl('client/app/account/sign-in/forgot-password.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(modal) {
					vm.modal = modal;
				});

				vm.openModal = function() {
					vm.modal.show();
					vm.fp_user = {
						email : null
					};
				};

				vm.closeModal = function() {
					vm.modal.hide();
				};

				vm.forgotPassword = function(fpForm){
					if(fpForm.$valid){
						//CHECK INTERNET CONNECTIVITY
						if(Meteor.status().connected == true) {
							Accounts.forgotPassword({ 'email' : vm.fp_user.email }, function(error){
								if(error){
									Toastr.show(error.reason, 'error');
								}else{
									var email = vm.fp_user.email;
									vm.modal.hide();
									$state.go('app.resetPasswordKey');
								}
							});
						} else {
							Toastr.show( Meteor.settings.public.network_not_found_error , 'error');
						}
					}
				};
			}
		}
	});
})();
