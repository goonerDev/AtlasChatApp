(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider
		.state('app.payments', {
			url: "/payments",
			views: {
				'menuContent' :{
					template: "<payment-view></payment-view>"								
				}
			},
      		data : { authenticate : true}
		});
	})

	.directive('paymentView', function () {
		return {
			restrict: 'E',
			templateUrl: "client/app/payment/payments.html",			
			controllerAs: 'paymentView',
			controller: function ($scope, $reactive, $rootScope, $ionicModal, Toastr, Auth, $ionicPopup, $ionicSideMenuDelegate) {
				$reactive(this).attach($scope);
				$rootScope.header_title = 'Payments';
                $scope.$on('$ionicView.enter', function(ev) {
                    $ionicSideMenuDelegate.canDragContent(false);
                });
				var vm = this;	
				var email = Auth.user.email;
				vm.show_loader = true;								
				vm.cards = [];
				vm.payments = [];
				Stripe.setPublishableKey(Meteor.settings.public.livePublishKey);
				vm.default_card_id = Auth.user.default_card_id;

				var showLoader = function(){
					vm.show_loader = true;
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				};
				var hideLoader = function(){
					vm.show_loader = false;
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				};

				var getCustomerCards = function(){
					if(Auth.user.stripe_id){
						Meteor.call('stripe.listCards', Auth.user.stripe_id, function(error, result){
							if(error){
								Toastr.show(error.reason, 'error');
							}else{
								vm.cards = result.data;
								
								
							}
							hideLoader();
						});
						Meteor.call('stripe.charges', Auth.user.stripe_id, function(error, result){
							if(error){
								Toastr.show(error.reason, 'error');
							}else{
								vm.payments = result.data;								
								if (!$scope.$$phase) {
									$scope.$apply();
								}
							}							
						});						
					}else{
						hideLoader();
					}
				};	

				getCustomerCards();

				vm.deleteCard = function(card){
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
					           showLoader();
								Meteor.call('stripe.deleteCard', Auth.user.stripe_id, card.id, function(error, result){
									if(error){
										Toastr.show(error.reason, 'error');
									}else{
										vm.cards.splice(vm.cards.indexOf(card), 1); 
										if (!$scope.$$phase) {
											$scope.$apply();
										}							
									}
									hideLoader();
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

				var createStripeCustomer = function(){
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", "error");
					} else {
						showLoader();
						Meteor.call('stripe.createCustomer', email, function(error, result){
							if(error){
										Toastr.show(error.reason + "666", 'error');
							}else{
								//do something
								var stripe_id = result.id;

								Meteor.call('profile.updateStripe', {_id : Auth.user._id, stripe_id : stripe_id}, function(error, result){
									if(error){
										Toastr.show(error.reason + "777", 'error');
									}else{
										Auth.user.stripe_id = stripe_id;
										vm.modal.show();
									}
								});							
							}
							hideLoader();
						});
					}
				};			
					
				$ionicModal.fromTemplateUrl('client/app/payment/payment-modal.html', {
				    scope: $scope,
				    animation: 'slide-in-up'
				}).then(function(modal) {
				    vm.modal = modal;
				});

				vm.openModal = function(card) {
					if(Auth.user.stripe_id){
						vm.modal.show();				
					}else{
				    	createStripeCustomer();
				    }
				    vm.card = {
				    	card_number : null, 
				    	cvc : null, 
				    	exp_month : null,
				    	exp_year : null,
				    	postal : null, 
				    	is_default : false
				    };
				    if (card){
				    	angular.extend(vm.card, { 
				    		id : card.id,
				    		card_number : '************' + card.last4, 
							cvc : '***', 
							exp_month : card.exp_month, 
							exp_year : card.exp_year,
							is_default : vm.default_card_id === card.id
						});
				    }
				};

				vm.closeModal = function() {
				    vm.modal.hide();
				};

				vm.show_modal_loader = false;
				vm.savePayment = function(paymentForm){
					if(Meteor.status().connected === false){
						Toastr.show("Network found error", "error");
					} else {
						if(paymentForm.$valid){
							vm.show_modal_loader = true;
							if(!vm.card.id){//update token
								
								Stripe.card.createToken({
								    number: vm.card.card_number,
								    cvc: vm.card.cvc,
								    exp_month: vm.card.exp_month,
								    exp_year: vm.card.exp_year,
								}, function(status, response) {
								    //stripeToken = response.id;
								    //Meteor.call('chargeCard', stripeToken);
								    if(status === 200 && response){							    
								    	
								    	Meteor.call('stripe.createCard', Auth.user.stripe_id, response.id, function(err, res){
								    		if(err){
								    			Toastr.show(err.reason, 'error');
								    			vm.show_modal_loader = false;
										    	if (!$scope.$$phase) {
													$scope.$apply();
												}
								    		}else{
								    			angular.extend(vm.card, res);
								    			//vm.card = res;
								    			setDefault(vm.card);							    			
								    			vm.cards.push(res);							    		
								    			vm.closeModal();
								    		}
								    		vm.show_modal_loader = false;
								    	});
								    }else{
								    	Toastr.show(response.error.message, 'error');
								    	vm.show_modal_loader = false;
								    	if (!$scope.$$phase) {
											$scope.$apply();
										}
								    }
								});
							}else{

								Meteor.call('stripe.updateCard', Auth.user.stripe_id, vm.card.id, {exp_year : vm.card.exp_year, exp_month : vm.card.exp_month}, function(err, res){
						    		if(err){
						    			Toastr.show(err.reason, 'error');
						    		}else{
						    			setDefault(vm.card);
						    			var _card = _.where(vm.cards, {id : vm.card.id})[0];
						    			vm.cards.splice(vm.cards.indexOf(_card), 1, res);					    									    		
						    			vm.show_modal_loader = false;
						    			vm.closeModal();
						    		}
						    		vm.show_modal_loader = false;
						    	});

							}										
						}
					}
				};

				var setDefault = function(card){
					if((vm.cards.length && card.is_default) || !vm.cards.length){
						Meteor.call('stripe.updateCustomer', Auth.user.stripe_id, {default_source : card.id}, function(err, res){
				    		if(err){
				    			Toastr.show(err.reason, 'error');
				    		}else{
				    			Meteor.call('profile.update', {_id : Auth.user._id, default_card_id : card.id}, function(error, result){
									if(error){
										Toastr.show(error.reason, 'error');
									}else{
										//Auth.user.stripe_id = card.id;
										Auth.user.default_card_id= card.id;
										vm.default_card_id = Auth.user.default_card_id;
										// vm.modal.show();
									}
									if (!$scope.$$phase) {
										$scope.$apply();
									}
								});
				    		}
				    	});
					}	
				}
				
				$scope.$on('$destroy', function() {
				    vm.modal.remove();				    
				});				
			}
		}
	});

})();
