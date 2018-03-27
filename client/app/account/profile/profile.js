(function(){

	angular.module('atlas')
	.config(function($stateProvider){
		$stateProvider.
			state('app.profile', {
				url: "/profile",
				views: {
					'menuContent' :{
						template: "<profile-view></profile-view>"
					}
				},
				data : { authenticate : true}
			});
	})
        .directive('profileView', function() {
            return {
                restrict: 'E',
                templateUrl: "client/app/account/profile/profile.html",
                controllerAs: 'profile',
                controller: function($scope, $element, $reactive, $rootScope, $ionicModal, Auth, Toastr, $cordovaCamera, $ionicActionSheet, mylocalStorage, $ionicSideMenuDelegate) {
                    $reactive(this).attach($scope);
                    $rootScope.header_title = 'Profile';
                    $rootScope.show_edit_button = true;
                    $scope.$on('$ionicView.enter', function(ev) {
                        $ionicSideMenuDelegate.canDragContent(false);
                    });

                    var vm = this;
                    vm.ele = $element;
                    vm.original_user = angular.copy(Auth.user);
                    vm.user = angular.copy(Auth.user);

                    $scope.$on('editCallback', function() {
                        vm.openModal();
                    });

                    $ionicModal.fromTemplateUrl('client/app/account/profile/profile-modal.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function(modal) {
                        vm.modal = modal;
                    });

                    vm.openModal = function() {
                        vm.modal.show();
                    };

                    vm.closeModal = function() {
                        vm.modal.hide();
                    };

                    vm.mufun = function(event) {
                        if (event.which == 13)
                            vm.isEnter = true;
                        else
                            vm.isEnter = false;
                    }

                    vm.saveProfile = function(event, profileForm) {
                        if (vm.isEnter) {
                            vm.isEnter = false;
                            //(vm.ele).next('input').focus()
                            return;
                        }
                        if (Meteor.status().connected === false) {
                            Toastr.show("Network found error", "error");
                        } else {
                            if (profileForm.$valid) {
                                Meteor.call('profile.update', vm.original_user, function(error, result) {
                                    if (error) {
                                        Toastr.show(error.reason, 'error');
                                    } else {
                                        vm.user = angular.copy(vm.original_user);
                                        mylocalStorage.removeItem('user');
                                        Auth.user = vm.user;
                                        mylocalStorage.setItem('user', Auth.user);
                                        vm.closeModal();
                                    }
                                });
                            }
                        }
                    };

                    // Triggered on a button click, or some other target
                    vm.showActionSheet = function() {

                        // Show the action sheet
                        var hideSheet = $ionicActionSheet.show({
                            buttons: [
                                { text: '<b>Camera</b>' },
                                { text: '<b>Gallery</b>' }
                            ],
                            // destructiveText: 'Delete',
                            titleText: 'Upload your picture',
                            cancelText: 'Cancel',
                            cancel: function() {
                                // add cancel code..
                            },
                            buttonClicked: function(index) {
                                if (index == 1) {//gallery
                                    vm.getPhoto(false);
                                } else { //console.log('Camera');
                                    vm.getPhoto(true);
                                }
                                return true;
                            }
                        });

                        // // For example's sake, hide the sheet after two seconds
                        // $timeout(function() {
                        //   hideSheet();
                        // }, 2000);

                    };

                    //image upload
                    // $ionicModal.fromTemplateUrl('client/app/account/profile/profile-image-modal.html', {
                    //     scope: $scope,
                    //     animation: 'slide-in-up'
                    // }).then(function(modal) {
                    //     vm.image_modal = modal;
                    // });

                    // vm.openImageModal = function() {
                    //     vm.image_modal.show();
                    // };

                    // vm.closeImageModal = function() {
                    //     vm.image_modal.hide();
                    // };

                    var dataURItoBlob = function(dataURI) {
                        var binary = atob(dataURI.split(',')[1]);
                        var array = [];
                        for (var i = 0; i < binary.length; i++) {
                            array.push(binary.charCodeAt(i));
                        }
                        return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
                    };
                    var uploadImageToS3 = function(src) {
                        var file = dataURItoBlob(src);
                        file.name = (new Date).getTime() + Math.floor((Math.random() * 100) + 1) + ".jpg";

                        var uploader = new Slingshot.Upload("myFileUploads");

                        var error = uploader.validate(file);
                        if (error) {
                            console.error(error);
                        }

                        uploader.send(file, function(error, downloadUrl) {
                            if (error) {
                                // Log service detailed response
                                console.error('Error uploading', uploader.xhr.response);
                                alert(error);
                            }
                            else {
                                //Meteor.users.update(Meteor.userId(), {$push: {"profile.files": downloadUrl}});
                                console.log("File uploaded successfully.");
                                $scope.$apply(function() {
                                    vm.original_user.image_url = downloadUrl;
                                })
                            }
                        });
                    };

                    vm.getPhoto = function(is_camera) {
                        document.addEventListener("deviceready", function() {

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

                            $cordovaCamera.getPicture(options).then(function(imageData) {
                                var src = "data:image/jpeg;base64," + imageData;
                                //var image = document.getElementById('myImage');
                                //image.src = "data:image/jpeg;base64," + imageData;
                                //$scope.newPost.imageData=image.src;
                                /// Save image and update the vm.original_user.image_url;
                                uploadImageToS3(src);

                            }, function(err) {
                                // error
                            });
                        });
                    };

                    //Cleanup the modal when we're done with it!
                    $rootScope.$on('$stateChangeStart', function() {
                        $rootScope.show_edit_button = false;
                    });
                    $scope.$on('$destroy', function() {
                        vm.modal.remove();
                        //vm.image_modal.remove();
                    });
                }
            }
        });
})();
