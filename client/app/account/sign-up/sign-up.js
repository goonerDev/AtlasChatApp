(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider.
			state('app.signup', {
				url: "/signup",
				views: {
					'menuContent' :{
						template: '<sign-up-form></sign-up-form>'
					}
				},
				data : { authenticate : false}
			})
			.state('app.signup1', {
				url: "/signup1",
				views: {
					'menuContent' :{
						template: '<sign-up1-form></sign-up1-form>'
					}
				},
				data : { authenticate : false}
			})
			.state('app.signupfb', {
				url: "/signupfb",
				views: {
					'menuContent' :{
						template: '<sign-up-fb-form></sign-up-fb-form>'
					}
				}
			,
		data : { authenticate : false}
			});
	})
	.service('SignUpService', function($q){
		var user = {};
		this.getUser = function(){
			return user;
		};
		this.setUser = function(_user){
			angular.extend(user, _user);
		};
		this.clearUser = function(){
			user = {};
		};
		console.log("234234 FOR YOU ONLY")
		this.getUserInfo = function(){
			var deferred = $q.defer();
			Meteor.call("profile.getUserInfo", null, function(error, result){
				if(error){
					deferred.reject(error);
				} else {
					deferred.resolve(result);
				}
			});
			return deferred.promise;
		};
	})
	.directive('signUpForm', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/sign-up/sign-up.html",
			controllerAs: 'signupCtrl',
			controller: function ($scope, $reactive, SignUpService, $state, $ionicPopup, $ionicLoading, Auth, Toastr) {
				$reactive(this).attach($scope);
				var vm = this;
				var _user = SignUpService.getUser();
				vm.user = {
					email :  null,
					password : null
				};
				this.subscribe('userData');
				vm.signUp = function(singUpForm){
					if(singUpForm.$valid){
						//CHECK INTERNET CONNECTiON
			            if(Meteor.status().connected === true){ 
							Meteor.call("profile.isUserExist", vm.user.email, function(error, result){
								if(error){
									Toastr.show(error.reason, 'error');
								} else {
									if(result > 0) {
										Toastr.show('This email already exists.', 'error');
									}else{
	                                    requestToGA('event', 'Complete', 'Sign Up', 'Email/Password', null);
										SignUpService.setUser(vm.user);
										$state.go('app.signup1');
									}
								}
							});
						} else {
                			Toastr.show(Meteor.settings.public.network_not_found_error , 'error');
						}

					}
				};
				/*Sign up with FB*/
				this.signUpFacebook = function(){

					//CHECK INTERNET CONNECTiON
		            if(Meteor.status().connected === true){ 
						Meteor.loginWithFacebook({ requestPermissions: ['email', 'public_profile', 'user_friends', 'user_likes']}, function(err){
							if (err) {
								//throw new Meteor.Error("Facebook login failed");
								Toastr.show("Facebook login failed", 'error');
								return;
							}
	                        
							var user= Meteor.user();
							if (user.hasOwnProperty('services') && user.services.hasOwnProperty('facebook')) {
								Meteor.call("profile.isUserExist", user.services.facebook.email, function(error, result){
									if(error){
										return;
									} else {
										if(result < 1) {
											//Auth.authenticate();
											$state.go('app.signupfb');
										} else {
	                                        requestToGA('event', 'Complete', 'Facebook Sign Up', 'Name/Demographics/Password', null);
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
							}else{
								Toastr.show('User not get populated.');
							}
						});
					} else {
                			Toastr.show(Meteor.settings.public.network_not_found_error , 'error');
					}
				};
			}
		}
	})
	.directive('signUp1Form', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/sign-up/sign-up-detail1.html",
			controllerAs: 'signup1Ctrl',
			controller: function ($scope, $reactive, SignUpService, $state, $ionicPopup, Toastr, Auth) {
				$reactive(this).attach($scope);
				var vm = this;
				this.subscribe('userData');
				vm.user = {
					gender : null,
					first_name : null,
					last_name : null,
					date_of_birth : null
				};
				this.signUp = function(signUp1Form){
					if(signUp1Form.$valid){
						//CHECK INTERNET CONNECTiON
			            if(Meteor.status().connected === true){ 
							SignUpService.setUser(vm.user);
							var _user = SignUpService.getUser();
							Accounts.createUser({email : _user.email, password : _user.password}, function(error){
								if (error) {
									Toastr.show(error.reason, 'error');
								} else {
									// Success. Account has been created and the user
									// has logged in successfully.
									//SignUpService.setUser(vm.user);
									Meteor.call('profile.add', SignUpService.getUser(), function(error, result){
										if(error){
											Toastr.show(error.reason, 'error');
											return false;
										}
	                                    requestToGA('event', 'Complete', 'Sign Up', 'Name/Demographics', null);
										SignUpService.clearUser();
										SignUpService.getUserInfo().then(function(result){
											Auth.authenticate();
											Auth.user = result;
											$scope.$emit('authenticated');
											$state.go('app.dashboard');
										},
										function(error){
											Toastr.show(error.reason, 'error');
										});

									});

								}
							});
						} else {
                			Toastr.show(Meteor.settings.public.network_not_found_error , 'error');
						}
					}
				};
			}
		}
	})
	.directive('signUpFbForm', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/sign-up/sign-up-detail-fb.html",
			controllerAs: 'signupFbCtrl',
			controller: function ($scope, $reactive, SignUpService, $state, $ionicPopup, Toastr, Auth) {
				$reactive(this).attach($scope);
				var vm = this;
				var fb_user = null;
				var fb_user = Meteor.user().services.facebook;
				vm.user = {
					first_name : fb_user.first_name,
					last_name  : fb_user.last_name,
					email : fb_user.email,
					gender : fb_user.gender,
					date_of_birth : null,
					facebook_id : fb_user.id,
					image_url : "https://graph.facebook.com/"+fb_user.id+"/picture/?type=large",
					password : null
				};
				vm.signUpFacebook = function(signUpFbForm){
					if(signUpFbForm.$valid){
						//CHECK INTERNET CONNECTiON
			            if(Meteor.status().connected === true){

									// has logged in successfully.
									//SignUpService.setUser(vm.user);
									Meteor.call('profile.add', vm.user, function(error, result){
										if(error) {
											Toastr.show(error.reason, 'error');
											return false;
										}

										//update meteor user with the email and password.
										Meteor.call('account.updateFBUser', vm.user, function(error, result){
											if(error) {
												Toastr.show(error.reason, 'error'); return false;
											}
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
									});

						} else {
                			Toastr.show(Meteor.settings.public.network_not_found_error , 'error');
						}
					}
				};
			}
		}
	});
})();
