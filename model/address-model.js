(function(){

  Addresses = new Mongo.Collection('addresses');

  // Address schema definition.. 
  Addresses.attachSchema( 
    new SimpleSchema({
      location: { type: String, optional : true },
      address_1 : { type: String, optional : true},
      address_2 : { type: String, optional : true},
      address_3 : { type: String, optional : true},      
      city : { type: String, optional : true },
      state : { type: String, optional : true },
      postal_code : { type: Number, optional : true },      
      country : { type: String, optional : true },
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

  // address methods.. 
  Meteor.methods({
    'address.add'(address) {
      checkIfAuthorized();      
      return Addresses.insert(address);    //will return id of inserted item..
    }, 
    'address.update'(address) {
      checkIfAuthorized();        
        return Addresses.update({_id : address._id}, { $set : address });//{ 'name': name }
      }, 
      'address.remove'(address_id){
        checkIfAuthorized();
        return Addresses.remove(address_id);
      }/*,
      'address.getAddresses' () { 
        checkIfAuthorized();
        return Addresses.find({ user_id : Meteor.userId()}).fetch();                                
      }*/
    });   
  var checkIfAuthorized = function (){
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update his name.');
    }  
  };

if ( Meteor.isClient ) {
  Ground.methodResume([
      'address.add',
      'address.update',
      'address.remove'
  ]);
}

if (Meteor.isCordova) {
  Ground.Collection(Addresses);
}



})();

