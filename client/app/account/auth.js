(function(){
  angular.module('atlas')
  .service('Auth', function(){
    var authenticated = false;
    this.user = null;
    this.isAuthenticated = function(){
      return authenticated;
    };
    this.authenticate = function(){
      authenticated = true;
      //this.user = Meteor.user();
    };
    this.deAuthenticate = function(){
      authenticated = false;
      Meteor.logout();
      this.user = null;
    };
  });
})();
