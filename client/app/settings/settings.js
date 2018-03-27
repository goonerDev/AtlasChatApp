(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider.
		state('app.settings', {
			url: "/settings",
			views: {
				'menuContent' :{
					template: "<settings-view></settings-view>"					
				}
			},
			data : { authenticate : true}			
		}).
		state('app.changepassword', {
			url: "/changepassword",
			views: {
				'menuContent' :{
					template: "<change-password></change-password>"					
				}
			},
			data : { authenticate : true}			
		});		
	})
	.directive('settingsView', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/settings/settings.html",			
			controllerAs: 'settings',
			controller: function ($scope, $reactive, $ionicHistory, $rootScope, $state, Auth, $ionicSideMenuDelegate) {
				$reactive(this).attach($scope);			
				$rootScope.header_title = 'Settings';
				var vm = this;
				vm.push_notifications_enable = Meteor.settings.public.push_notifications_enable;
                
                $scope.$on('$ionicView.enter', function(ev) {
                    $ionicSideMenuDelegate.canDragContent(false);
                });

				$scope.pushNotificationChange = function() {
					if($scope.pushNotification.checked === true) {
						Meteor.settings.public.push_notifications_enable = true;
					} else if ($scope.pushNotification.checked === false){
						Meteor.settings.public.push_notifications_enable = false;
					}
				};
				$scope.pushNotification = { checked: true };
			}
		}
	})
	.directive('changePassword', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/settings/change-password.html",			
			controllerAs: 'cp',
			controller: function ($scope, $reactive, $ionicHistory, $rootScope, $state, Auth, Toastr, $ionicSideMenuDelegate) {
				$reactive(this).attach($scope);			
				$rootScope.header_title = 'Change Password';
                 $scope.$on('$ionicView.enter', function(ev) {
                    $ionicSideMenuDelegate.canDragContent(false);
                });
				var vm = this;

				this.user = {
					old_password : null, 
					new_password : null, 
					confirm_password : null
				};
				this.changePassword = function(cpForm){	
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", "error");
					} else {				
						if(cpForm.$valid){					
							Accounts.changePassword(vm.user.old_password, vm.user.new_password, function(error){
								if(error){
									Toastr.show(error.reason, 'error');
								}else{
									Meteor.call('profile.update', {_id : Auth.user._id, password : vm.user.new_password}, function(error, result){
										if(error){
											Toastr.show(error.reason, 'error');								
										}else{
											Toastr.show('Password updated successfully.');
											$state.go('app.dashboard');
										}
									});								
								}							
							});
						}
					}
				};
			}
		}
	})
	.directive('forgotPassword', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/settings/forgot-password.html",			
			controllerAs: 'fp',
			controller: function ($scope, $reactive, $ionicHistory, $rootScope, $state, Auth, Toastr) {
				$reactive(this).attach($scope);			
				$rootScope.header_title = 'Change Password';
				var vm = this;

				this.user = {
					email : null					
				};
				this.forgotPassword = function(fpForm){		
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", "error");
					} else {		
						if(fpForm.$valid){
							Accounts.forgotPassword(vm.user.email, function(error){
								if(error){
									Toastr.show(error.reason, 'error');
								}else{
									/*Meteor.call('profile.update', {_id : Auth.user._id, password : vm.user.new_password}, function(error, result){
										if(error){
											Toastr.show(error.reason, 'error');								
										}else{
											Toastr.show('Password updated successfully.');
										}
									});*/								
								}							
							});
						}
					}
				};
			}
		}
	});
	
})();
