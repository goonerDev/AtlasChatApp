//User = new Mongo.Collection("user");
//ChatSession = new Mongo.Collection('chat_session');
//Message = new Mongo.Collection('message');
//Payment = new Mongo.Collection('payment');
//Address = new Mongo.Collection('address');
// Profile = new Mongo.Collection("profile");

if(Meteor.isServer){
	Houston.add_collection(Meteor.users);
	Houston.add_collection(Houston._admins);
}




// (function(){

// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// //                                                                                                     //
// // packages/btafel_accounts-facebook-cordova/facebook.js                                               //
// //                                                                                                     //
// /////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                        //
// Accounts.oauth.registerService('facebook');                                                            // 1
//                                                                                                        // 2
// if (Meteor.isClient) {                                                                                 // 3
//                                                                                                        // 4
//   Meteor.loginWithFacebook = function(options, callback) {                                             // 5
//     // support a callback without options                                                              // 6
//     if (! callback && typeof options === "function") {                                                 // 7
//       callback = options;                                                                              // 8
//       options = null;                                                                                  // 9
//     }                                                                                                  // 10
//                                                                                                        // 11
//     var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
//                                                                                                        // 13
//     var fbLoginSuccess = function (data) {                                                             // 14
//       data.cordova = true;                                                                             // 15
//                                                                                                        // 16
//       Accounts.callLoginMethod({                                                                       // 17
//         methodArguments: [data],                                                                       // 18
//         userCallback: callback                                                                         // 19
//       });                                                                                              // 20
//     }                                                                                                  // 21
//                                                                                                        // 22
//     if (typeof facebookConnectPlugin != "undefined" && Meteor.settings) {                              // 23
//       facebookConnectPlugin.getLoginStatus(                                                            // 24
//         function (response) {                                                                          // 25
//           if (response.status != "connected") {                                                        // 26
//             facebookConnectPlugin.login(Meteor.settings.public.facebook.permissions,                   // 27
//                 fbLoginSuccess,                                                                        // 28
//                 function (error) { console.log("" + error) }                                           // 29
//             );                                                                                         // 30
//           } else {                                                                                     // 31
//             fbLoginSuccess(response);                                                                  // 32
//           }                                                                                            // 33
//         },                                                                                             // 34
//         function (error) { console.log("" + error) }                                                   // 35
//       );                                                                                               // 36
//     } else {                                                                                           // 37
//       Facebook.requestCredential(options, credentialRequestCompleteCallback);                          // 38
//     }                                                                                                  // 39
//   };                                                                                                   // 40
//                                                                                                        // 41
// } else {                                                                                               // 42
//                                                                                                        // 43
//   if (Meteor.settings &&                                                                               // 44
//       Meteor.settings.facebook &&                                                                      // 45
//       Meteor.settings.facebook.appId &&                                                                // 46
//       Meteor.settings.facebook.secret) {                                                               // 47
//                                                                                                        // 48
//     ServiceConfiguration.configurations.remove({                                                       // 49
//       service: "facebook"                                                                              // 50
//     });                                                                                                // 51
//                                                                                                        // 52
//     ServiceConfiguration.configurations.insert({                                                       // 53
//       service: "facebook",                                                                             // 54
//       appId: Meteor.settings.facebook.appId,                                                           // 55
//       secret: Meteor.settings.facebook.secret                                                          // 56
//     });                                                                                                // 57
//                                                                                                        // 58
//     Accounts.addAutopublishFields({                                                                    // 59
//       // publish all fields including access token, which can legitimately                             // 60
//       // be used from the client (if transmitted over ssl or on                                        // 61
//       // localhost). https://developers.facebook.com/docs/concepts/login/access-tokens-and-types/,     // 62
//       // "Sharing of Access Tokens"                                                                    // 63
//       forLoggedInUser: ['services.facebook'],                                                          // 64
//       forOtherUsers: [                                                                                 // 65
//         // https://www.facebook.com/help/167709519956542                                               // 66
//         'services.facebook.id', 'services.facebook.username', 'services.facebook.gender'               // 67
//       ]                                                                                                // 68
//     });                                                                                                // 69
//                                                                                                        // 70
//   } else {                                                                                             // 71
//     console.log("Meteor settings for accounts-facebook-cordova not configured correctly.")             // 72
//   }                                                                                                    // 73
// }                                                                                                      // 74
//                                                                                                        // 75
// /////////////////////////////////////////////////////////////////////////////////////////////////////////

// }).call(this);

