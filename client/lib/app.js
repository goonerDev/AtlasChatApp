(function(){

  var app = angular.module('atlas', [
    'angular-meteor',
    'ui.router',
    'ngAnimate',
    'ngMessages',
    'uiGmapgoogle-maps',
    'ionic',
    'ngCordova',
    'accounts.ui'
    ]);

  function onReady() {
    angular.bootstrap(document, ['atlas']);
    if(window.StatusBar) {
      //org.apache.cordova.statusbar required
      //StatusBar.styleDefault();
    }
    if (Meteor.isCordova){
      cordova.plugins.Keyboard.disableScroll(true);
      //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      //StatusBar.overlaysWebView(true);
      //StatusBar.styleLightContent();
    }
  } 

  if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
  }
  else {
    angular.element(document).ready(onReady);
  }

  app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $ionicConfigProvider, mylocalStorageProvider) {
     //$locationProvider.html5Mode(true);
     
     $ionicConfigProvider.views.swipeBackEnabled(false);
     $ionicConfigProvider.views.maxCache(0);

     $stateProvider
     .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "client/templates/menu.html"
    })
     .state('app.starter', {
      url: "/starter",
      views: {
        'menuContent' :{
          templateUrl: "client/templates/splash.html",
          controller : 'StarterCtrl'
        }
      },
      data : { authenticate : false}
    })
    .state('app.waiting', {
      url: "/waiting",
      views: {
        'menuContent' :{
          templateUrl: "client/templates/waiting.html",
          controller : 'WaitingCtrl'
        }
      },
      data : { authenticate : false}
    })
     .state('app.help', {
      url: "/help",
      views: {
        'menuContent' :{
          templateUrl: "client/templates/help.html",
          controller : function($scope, $rootScope, $ionicSideMenuDelegate){
            $rootScope.header_title = "Help";
            $scope.$on('$ionicView.enter', function(ev) {
                    $ionicSideMenuDelegate.canDragContent(false);
                });
          }
        }
      },
      data : { authenticate : true}
    })     
     .state('app.about', {
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "client/templates/about.html",
          controller : function($scope, $rootScope, $ionicSideMenuDelegate){
            $rootScope.header_title = "About";
            $scope.$on('$ionicView.enter', function(ev) {
                    $ionicSideMenuDelegate.canDragContent(false);
                });
          }
        }
      },
      data : { authenticate : true}
    });
    
    //$urlRouterProvider.otherwise("/app/starter");         
    if(mylocalStorageProvider.getItem('user')){
       $urlRouterProvider.otherwise("/app/dashboard");     
    }else{
       $urlRouterProvider.otherwise("/app/starter");         
    }
     
   })
  
  .run(function run($ionicPlatform, $cordovaSplashscreen, $rootScope, $state, Auth, mylocalStorage) {
    
    // $ionicPlatform.ready(function() {
    //     setTimeout(function() {
    //       $cordovaSplashscreen.hide();
    //     }, 500);
    // }); 

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, error) {
      // We can catch the error thrown when the $requireUser promise is rejected
      // and redirect the user back to the main page
      if (toState.data.authenticate && !Auth.isAuthenticated()) {//user is not authorized redirect to login page.
        event.preventDefault();        
        //$state.go('app.starter');
        if(mylocalStorage.getItem('user')){
           $state.go('app.starter');
        }else{
           $state.go('app.starter');
        }
      }
      if(!toState.data.authenticate && Auth.isAuthenticated()){
        event.preventDefault();
      }      
    });
  })

  .controller('AppCtrl', function($scope, $reactive, $ionicSideMenuDelegate, $ionicPopup, Auth, $state, $rootScope, Toastr,  $ionicHistory, $timeout, mylocalStorage) {
    $scope.is_authenticated = false;
    $rootScope.header_title = '';
    $reactive(this).attach($scope);
    this.subscribe('userData');
    $scope.user = null;    
    $rootScope.show_edit_button = false;
    $scope.editButtonCallback = function(){
      $scope.$broadcast('editCallback');
    };        

    $scope.$on('authenticated', function(){    
      $scope.is_authenticated = true;
      $scope.user = Auth.user;
      mylocalStorage.setItem('user', Auth.user);
      ///////
      Meteor.call("checkLiveChatInterval", function(error, result){
        if(error){
              Toastr.show(error.reason, 'error');
              return false;
        } else { 
          //
        }
      });
      ///////
    });

    $scope.showBackButton = function(){
      return $ionicHistory.backView() !== null;
    };
    
    //Asim update for textarea Start 
    $scope.expandText = function(){
      var element = document.getElementById("txtnotes");
      element.style.height =  element.scrollHeight + "px";
    }
    //Asim update for textarea End

    $scope.goBack = function() {
        if ($ionicHistory.currentView().index > 1)
            $ionicHistory.goBack();
        else
            $state.go('app.dashboard');
    };

   $rootScope.logout = function(){  

     // An elaborate, custom popup
     var myPopup = $ionicPopup.show({
       // template: '<input type="password" ng-model="data.wifi">',
       title: 'Confirm Logout',
       template: 'Are you sure you want to logout?',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Logout</b>',
           type: 'button-positive',
           onTap: function(e) {
              $scope.user = null;
              $scope.is_authenticated = false;
              Auth.deAuthenticate();   
              mylocalStorage.removeItem('user');
              $ionicHistory.clearCache();
              $ionicHistory.clearHistory();
              $state.go('app.starter');  
           }
         },
       ]
     });
     myPopup.then(function(res) {
       console.log('Tapped!', res);
     });         
            
    };

    $rootScope.toggleSlideMenu = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };
  })
  .controller('WaitingCtrl', function($scope, $reactive, Auth, $state, $rootScope, Toastr, mylocalStorage){
    $reactive(this).attach($scope);
    this.subscribe('userData');
    if(!mylocalStorage.getItem('user')){
      $state.go('app.starter'); 
    }else{

      Auth.user = mylocalStorage.getItem('user');
      Auth.authenticate();
      $state.go('app.dashboard');
      $scope.$emit('authenticated');   
            
      // Meteor.call("profile.getUserInfo", null, function(error, result){
      //     if(error){                      
      //       Toastr.show(error.reason, 'error');                       
      //       $state.go('app.starter');                   
      //     } else {      
      //       Auth.user = mylocalStorage.getItem('user');
      //       Auth.authenticate();
      //       $state.go('app.dashboard');
      //       $scope.$emit('authenticated');                                            
      //    }
      // });
    }
    
  })
  .controller('StarterCtrl', function($scope, $reactive, Auth, $state, $rootScope, Toastr, mylocalStorage){
    $reactive(this).attach($scope);
    this.subscribe('userData');
    if(!mylocalStorage.getItem('user')){
      $state.go('app.starter'); 
    }else{

      Auth.user = mylocalStorage.getItem('user');
      Auth.authenticate();
      $state.go('app.dashboard');
      $scope.$emit('authenticated');   
            
      // Meteor.call("profile.getUserInfo", null, function(error, result){
      //     if(error){                      
      //       Toastr.show(error.reason, 'error');                       
      //       $state.go('app.starter');                   
      //     } else {      
      //       Auth.user = mylocalStorage.getItem('user');
      //       Auth.authenticate();
      //       $state.go('app.dashboard');
      //       $scope.$emit('authenticated');                                            
      //    }
      // });
    }
    
  });

  //return app;
  
})();

