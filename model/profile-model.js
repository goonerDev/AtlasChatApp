(function(){

  Profiles = new Mongo.Collection('profiles');

  // Profile schema definition.. 
  Profiles.attachSchema( 
    new SimpleSchema({
      email: { type: String },
      first_name : { type: String},
      last_name : { type: String},
      password : { type: String, optional:true },
      gender : { type: String, optional : true },      
      phone : { type: String, optional : true  },
      date_of_birth : { type: Date, optional : true  },
      image_url : {type:String, optional:true},
      facebook_id : {type:String, optional:true},
      stripe_id : {type:String, optional:true},
      default_card_id : { type:String, optional:true},
      secret_key : { type:String, optional:true},
      user_id : {
        type : String, 
        autoValue : function(){
          if (this.isInsert && checkIfAuthorized()) {            
              return Meteor.userId();            
          }          
        }
      },
      created_at : {
        type: Date,
        autoValue: function() {
          if (this.isInsert) {
            return new Date();
          } else if (this.isUpsert) {
            return {$setOnInsert: new Date()};
          } else {
            this.unset();  // Prevent user from supplying their own value
          }
        }
      },
      updated_at : {
        type: Date,
        autoValue: function() {
          if (this.isUpdate) {
            return new Date();
          }
        },
        denyInsert: true,
        optional: true
      }
    })
  );

  Profiles.public_fields = { _id : 1, first_name : 1, last_name: 1, email : 1, image_url : 1, user_id : 1, phone : 1, gender : 1, date_of_birth : 1, stripe_id : 1, default_card_id : 1 };

  // profile methods.. 
  Meteor.methods({
    'profile.add'(profile) {      
      checkIfAuthorized();      
      return Profiles.insert(profile);    //will return id of inserted item..
    }, 
    'profile.update'( profile, isfacebook ) {
        checkIfAuthorized();     
        console.log(Meteor.user());   
        //currently forcing users to have only one email address 

        if(Meteor.user().emails !== undefined){
          var current_email = Meteor.user().emails[0].address; 
        } else {
          var current_email = Meteor.user().services.facebook.email; 
        }
        
        if(profile.email !== current_email){
          var updated = Meteor.users.update({_id : profile.user_id}, {$set: {'emails.0.address': profile.email, 'services.email.verificationTokens.0.address' : profile.email }});
          console.log(updated);
        }

        return Profiles.update({_id : profile._id}, { $set : profile });//{ 'name': name }
      }, 
    'profile.updateStripe'(profile) {
        checkIfAuthorized();
        //var updated = Meteor.users.update({_id : profile.user_id}, {$set: {'emails.0.address': profile.email, 'services.email.verificationTokens.0.address' : profile.email }});
        return Profiles.update({_id : profile._id}, { $set : profile });//{ 'name': name }
      }, 
    'profile.setPasswordToken'(profile) {
        return Profiles.update({email : profile.email}, { $set : profile });//{ 'name': name }
      }, 
    'profile.setNewPasswordByToken'(profile) {
        return Profiles.update({secret_key : profile.secret_key}, { $set : { 'password': profile.password , 'secret_key' : null } });//{ 'name': name }
      },
      'profile.remove'(profile){
        checkIfAuthorized();
        return Profiles.remove(profile._id);
      },
      'profile.isValidLogin' (profile){                
        return Profiles.find({ email:profile.email, password:profile.password}).count();        
      },      
      'profile.isUserExist' (email) {        
        return Profiles.find({ email:email}).count();                
      }, 
      'profile.getUserInfo' () { 
        checkIfAuthorized();
        return Profiles.findOne({ user_id : Meteor.userId()}, {fields: Profiles.public_fields});                        
        //return Profiles.findOne({ email : email}, {fields: Profiles.public_fields});        
      }, 
      'profile.getUserInfoByUserId' (user_email) {
        return Profiles.find({ email : user_email  }).fetch();
        //return Profiles.findOne({ email : email}, {fields: Profiles.public_fields});        
      },
      'profile.getUserInfoBySecretKey' (secret_key) {
        return Profiles.find({ secret_key : secret_key  }).fetch();
        //return Profiles.findOne({ email : email}, {fields: Profiles.public_fields});        
      }/*,
      'account.updateFBUser' (user){
        if(Meteor.isServer){
          checkIfAuthorized();        
          var email_added = Accounts.addEmail(Meteor.userId(), user.email, true);
          return Accounts.setPassword(Meteor.userId(), user.password) 
        }
      }*/
    });   

  var checkIfAuthorized = function (){
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to perform this action.');
    }  
    return true;
  };


  if ( Meteor.isClient ) {
  Ground.methodResume([
      'profile.add',
      'profile.update',
      'profile.remove'
  ]);
}

if (Meteor.isCordova) {
  Ground.Collection(Profiles);
}

})();