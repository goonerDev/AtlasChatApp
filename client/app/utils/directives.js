(function() {
    angular.module('atlas')
        .directive("compareTo", function() {
            return {
                require: "ngModel",
                scope: {
                    otherModelValue: "=compareTo"
                },
                link: function(scope, element, attributes, ngModel) {

                    ngModel.$validators.compareTo = function(modelValue) {
                        return modelValue == scope.otherModelValue;
                    };

                    scope.$watch("otherModelValue", function() {
                        ngModel.$validate();
                    });
                }
            };
        })

        .directive('restrictNumbers', [function() {
            /*this directive restrice an input form element to only take number's as a string
             * **/
            return function(scope, element, attrs) {
                element.bind("keypress", function(evt) {
                    var charCode = null;
                    if (evt.which) {
                        charCode = evt.which;
                    } else {
                        charCode = event.keyCode;
                    }
                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                        return false;
                    }
                    return true;
                });
            };
        }])

        .directive('errorMessages', function() {
            /* This directive uses the ng-message module and display the 
            **message by using the $error key/value object. Usage syntax.
            *<error-messages ng-show="(signUpForm.$submitted || signUpForm.confirm_password.$touched)" 
            *                     ng-messages="signUpForm.confirm_password.$error"></error-messages>
            */
            return {
                restrict: 'E',
                link: function() {

                },
                templateUrl: 'client/templates/messages.html'
            }
        })
        .directive('validateEmail', function() {
            var EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            return {
                require: 'ngModel',
                restrict: '',
                link: function(scope, elm, attrs, ctrl) {
                    // only apply the validator if ngModel is present and Angular has added the email validator
                    if (ctrl && ctrl.$validators.email) {

                        // this will overwrite the default Angular email validator
                        ctrl.$validators.email = function(modelValue) {
                            return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                        };
                    }
                }
            };
        })
        .directive('profileData', ['Auth', function(Auth) {
            return {
                restrict: 'EA',
                template: '<div class="header-holder-sidebar"><span ng-if="user" class="sidebar-profile-img"><img ng-if="user.image_url" ng-src="{{user.image_url}}" alt="No Image"/><img ng-if="!user.image_url" src="/imgs/user-profile-image.svg" alt="No Image"/></span>' +
                '<span class="sidebar-profile-title"> {{user.first_name + " "+ user.last_name }} </span> </div>',
                link: function(scope, elm, attrs, ctrl) {
                    scope.$watch(function() {
                        return scope.user = Auth.user;
                    });
                }
            };
        }])

        .directive('renderMap', function() {
            return {
                scope: {
                    msg: '=renderMap'
                },
                link: function(scope, elm, attr) {

                    scope.map = {
                        center: {
                            latitude: scope.msg.lat,
                            longitude: scope.msg.lng
                        },
                        zoom: 14,
                        pan: 1,
                        options: {
                            draggable: false,
                            disableDefaultUI: false,
                            disableDoubleClickZoom: true,
                            draggableCursor: false,
                            mapTypeControl: false,
                            zoomControl: false
                        }
                    };

                    scope.options = {
                        enableHighAccuracy: true,
                        timeout: 50000,
                        maximumAge: 0
                    };
                    scope.marker = {
                        id: 0,
                        coords: {
                            latitude: scope.msg.lat,
                            longitude: scope.msg.lng
                        }
                    };
                },
                template: '<div data-tap-disabled="true" class="msg-map"><div id="map_canvas"></div>' +
                '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="map.options" dragging="fasle">' +
          						'<ui-gmap-marker coords="marker.coords" idkey="$index + marker.id">' +
          						'</ui-gmap-marker>' +
                '</ui-gmap-google-map>' +
                '</div>'
            }
        });
})();


// (function(){
// 	// define custom submit directive
// 	angular.module('atlas')
// 	.directive('rcSubmit', ['$parse', function ($parse) {
//         /* this code is taken from to check fields validity on submit...
//             ///http://code.realcrowd.com/on-the-bleeding-edge-advanced-angularjs-form-validation/
//          */

//         return {
//             restrict: 'A',
//             require: ['rcSubmit', '?form'],
//             controller: ['$scope', function ($scope) {
//                 this.attempted = false;

//                 var formController = null;

//                 this.setAttempted = function() {
//                     this.attempted = true;
//                 };

//                 this.setFormController = function(controller) {
//                   formController = controller;
//                 };

//                 this.needsAttention = function (fieldModelController) {
//                     if (!formController){
//                         return false;
//                     }

//                     if (fieldModelController) {
//                         return fieldModelController.$invalid && (fieldModelController.$dirty || this.attempted);
//                     } else {
//                         return formController && formController.$invalid && (formController.$dirty || this.attempted);
//                     }
//                 };
//             }],
//             compile: function(cElement, cAttributes, transclude) {
//                 return {
//                     pre: function(scope, formElement, attributes, controllers) {

//                         var submitController = controllers[0];
//                         var formController = (controllers.length > 1) ? controllers[1] : null;

//                         submitController.setFormController(formController);

//                         scope.rc = scope.rc || {};
//                         scope.rc[attributes.name] = submitController;
//                     },
//                     post: function(scope, formElement, attributes, controllers) {

//                         var submitController = controllers[0];
//                         var formController = (controllers.length > 1) ? controllers[1] : null;
//                         var fn = $parse(attributes.rcSubmit);

//                         formElement.bind('submit', function (event) {
//                             submitController.setAttempted();
//                             if (!scope.$$phase){
//                                 scope.$apply();
//                             }

//                             if (!formController.$valid){
//                                 return false;
//                             }

//                             scope.$apply(function() {
//                                 fn(scope, {$event:event});
//                             });
//                         });
//                     }
//               };
//             }
//         };    
// 	}]);
// })();