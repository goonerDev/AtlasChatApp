// (function(){

//   Payments = new Mongo.Collection('payments');

//   // payment schema definition.. 
//   Payments.attachSchema( 
//     new SimpleSchema({
//       card_no : { type: Number },      
//       user_id: { type: String },      
//       created_at : {
//         type: Date,
//         autoValue: function() {
//           if (this.isInsert) {
//             return new Date();
//           } else if (this.isUpsert) {
//             return {$setOnInsert: new Date()};
//           } else {
//             this.unset();  // Prevent user from supplying their own value
//           }
//         }
//       },
//       updated_at : {
//         type: Date,
//         autoValue: function() {
//           if (this.isUpdate) {
//             return new Date();
//           }
//         },
//         denyInsert: true,
//         optional: true
//       }
//     })
//   );

//   //payment methods.. 
//   Meteor.methods({
//     'payment.add'(payment) {
//       checkIfAuthorized();      
//       return Payments.insert(payment);    //will return id of inserted item..
//     }, 
//     'payment.update'(payment) {
//         checkIfAuthorized();        
//         return Payments.update({_id : payment._id}, { $set : payment });//{ 'name': name }
//     }, 
//     'payment.remove'(payment){
//       checkIfAuthorized();
//       return Payments.remove(payment._id);
//     }
//   });   
//   var checkIfAuthorized = function (){
//     if (!Meteor.userId()) {
//       throw new Meteor.Error('not-logged-in',
//         'Must be logged in to update his name.');
//     }  
//   };
  
// })();

