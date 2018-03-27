(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider
		.state('app.addresses', {
			url: "/addresses",
			views: {
				'menuContent' :{
					template: "<address-view></address-view>"
				}
			},
			data : { authenticate : true}
		});
	})
	.directive('addressView', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/account/address/addresses.html",
			controllerAs: 'addressView',
			controller: function ($scope, $reactive, $rootScope, $ionicModal, $ionicPopup, Countries, Toastr, $ionicSideMenuDelegate) {
				$reactive(this).attach($scope);
				$rootScope.header_title = "Addresses";
                $scope.$on('$ionicView.enter', function(ev) {
                    $ionicSideMenuDelegate.canDragContent(false);
                });
				this.subscribe('Addresses');
				var vm = this;
				vm.button_disable = false;
				if(Meteor.status().connected === false){
					vm.button_disable = true;
				}

				vm.countries = Countries.list;
				vm.address = {};

				this.helpers({
					addresses: () => {
						return Addresses.find({}).fetch();
					}
				});
				$scope.showSelectValue = function(mySelect) {
					console.log(mySelect);
				}
				$ionicModal.fromTemplateUrl('client/app/account/address/address-modal.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(modal) {
					vm.modal = modal;
				});

				vm.openModal = function(address) {
					vm.address = address || {};
					vm.modal.show();
				};

				vm.closeModal = function() {
					vm.modal.hide();
				};

				vm.saveAddress = function(addressForm){
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", "error");
					} else {
						if(addressForm.$valid){
							if(vm.address._id){
								Meteor.call('address.update', vm.address, function(error, result){
									if(error){
										Toastr.show(error.reason, 'error');
									}else{
										vm.closeModal();
									}
								});
							}else{
								vm.address.user_id = Meteor.userId();
								Meteor.call('address.add', vm.address, function(error, result){
									if(error){
										Toastr.show(error.reason, 'error');
									}else{
										vm.closeModal();
									}
								});
							}
						}
					}
				};

				vm.deleteAddress = function(){
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", "error");
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
										Meteor.call('address.remove', vm.address._id, function(error, result){
											if(error){
												Toastr.show(error.reason, 'error');
											}else{
												vm.closeModal();
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

				//Cleanup the modal when we're done with it!
				$rootScope.$on('$stateChangeStart', function () {
					$rootScope.show_edit_button = false;
				});
				$scope.$on('$destroy', function() {
					vm.modal.remove();

				});
			}
		}
	});
})();
