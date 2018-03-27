/*
 ** Remove the check package later on.
 */

(function(){

  var Stripe = null;

  Meteor.publish(
    "userData",
    function () {
      if (this.userId) {
        return Meteor.users.find(
          {
            _id : this.userId
          },
          {
            fields: {
              'profile': 1,
              'services.facebook': 1
            }
          });
      } else {
        this.ready();
      }
    });

    Accounts.config({
      sendVerificationEmail: true
    });

    // profile methods
    Meteor.methods({
      'account.updateFBUser': function(user){
        if (!Meteor.userId()) {
          throw new Meteor.Error('not-logged-in',
                                 'Must be logged in to perform this action.');
        }

        return Accounts.setPassword(Meteor.userId(), user.password, {logout: false});
        var email_added = Accounts.addEmail(Meteor.userId(), user.email, true);
      },

      'stripe.createCustomer': function(email) {
        // var Stripe = StripeAPI(Meteor.settings.Stripe.testSecretKey);
        //console.log('I m here!');
        return Stripe.customers.create({
          email: email
        }, function(err, customer) {
        });
      },
      'stripe.updateCustomer': function(customer_id, customer_info){ //customer_info will be an object like = { default_source : card_id}
        return Stripe.customers.update(customer_id, customer_info, function(err, result) {
        });
      },
      'stripe.listCards': function(customer_id){
        return Stripe.customers.listCards(customer_id, function(err, result) {
        });
      },
      'stripe.createCard': function(customer_id, token_id){
        return Stripe.customers.createSource(customer_id, {source : token_id}, function(err, result) {
        });
      },
      'stripe.updateCard': function(customer_id, card_id, card_info){//card_info will be an object.
        return Stripe.customers.updateCard(customer_id, card_id, card_info, function(err, result) {
        });
      },
      'stripe.deleteCard': function(customer_id, card_id){
        return Stripe.customers.deleteCard(customer_id, card_id, function(err, result) {
        });
      },
      'stripe.charges': function(customer_id){
        return Stripe.charges.list({customer : customer_id, limit : 10}, function(err, result) {
        });
      }
    });

    Meteor.startup(function() {


      process.env.MAIL_URL = 'smtp://' + smtp.username + ':' + smtp.password + '@' + smtp.server + ':' + smtp.port;

      Accounts.emailTemplates.verifyEmail.subject = function (user) {
          return "Welcome to Atlas ";
      };      
      Accounts.emailTemplates.resetPassword.subject = function (user) {
          return "Reset Your Password ";
      };

      Accounts.emailTemplates.resetPassword.text = function(user, url)
      {
        Accounts.emailTemplates.resetPassword.subject = function (user) {
            return "Reset Your Password here ";
        };
        var curr_user_resetpass_emails = user.emails[0].address;
        var token = url.substring(url.lastIndexOf('/')+1, url.length);
        var newUrl = Meteor.absoluteUrl('#/app/resetPassword/' + token);
        var str = 'Hello,\n\n';
            str+= 'To reset your password, please copy the code below and go to forgot password section of the app.\n\n';
            str+= token;
        //update details
        Meteor.call('profile.setPasswordToken', {email : curr_user_resetpass_emails, secret_key : token}, function(error, result){
          if(error){
          }else{
          }
        });
        return str;
      }
      //

      if (Meteor.isCordova) {
        cordova.plugins.Keyboard.disableScroll(true);
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        document.addEventListener("deviceready", function() {
          StatusBar.overlaysWebView(true);
          StatusBar.styleLightContent();
        }, false);
      }

      //Image upload directive
      Slingshot.createDirective("myFileUploads", Slingshot.S3Storage, {
        bucket: Meteor.settings.AWSBucket,
        region: Meteor.settings.AWSRegion,
        AWSAccessKeyId: Meteor.settings.AWSAccessKeyId,
        AWSSecretAccessKey: Meteor.settings.AWSSecretAccessKey,
        acl: "public-read",

        authorize: function () {
          //Deny uploads if user is not logged in.
          if (!this.userId) {
            var message = "Please login before posting files";
            throw new Meteor.Error("Login Required", message);
          }
          return true;
        },

        key: function (file) {
          //Store file into a directory by the user's username.
          var user = Meteor.users.findOne(this.userId);
          return user._id + "/" + file.name;
        }
      });

      Stripe = StripeAPI(Meteor.settings.Stripe.liveSecretKey);

      var trusted = [
        '*.cloudflare.com',
        '*.livechatinc.com',
        '*.facebook.com',
        '*.stripe.com',
        '*.google-analytics.com',
        '*.googleapis.com',
        '*.gstatic.com',
        '*.akamaihd.net'
      ];

      _.each(trusted, function(origin) {
        origin = "https://" + origin;
        BrowserPolicy.content.allowOriginForAll(origin);
      });

      BrowserPolicy.content.allowEval('https://facebook.com');

    // METEOR SERVER SETUP
    Router.map(function() {
      // Your other routes go here

      // TICKET HOOK CREATION
      this.route('ticket_creation_hook', {
        path: '/ticket_creation_hook',
        where: 'server',
        action: function() {


          // Watch the Meteor log to see this output
          this.response.writeHead(200, {'Content-Type': 'text/html'});
          this.response.write("You wrote: " + this.request.body.message);
          this.response.write("\n");
          // console.log( "Token4 TICKET idd in ticket ==>> " + this.request.body.ticket.id   );    //will return id of inserted item..
          // console.log( "Token4 CHAT TICKET idd in ticket ==>> " + this.request.body.ticket.source.id   );    //will return id of inserted item..
          // console.log(this.request.body  );    //will return id of inserted item..
          // GET TICKET ID
          var curr_chat_ticket_id = this.request.body.ticket.id;
          var curr_live_chat_id   = this.request.body.ticket.source.id;
          var curr_chat_updated_name = this.request.body.ticket.subject;

          console.log(curr_chat_ticket_id);
          console.log(curr_live_chat_id);
          //UPDATE CHAT SESSION BY LIVE CHAT ID

          //GETTING VISITOR ID
          Meteor.call("getVisitorIdByChatId", curr_live_chat_id, function(error, result){
            if(error){
              console.log("ERROR POST getVisitorIdByChatId func ==>> " + error);
              return false;
            } else {
              var str = result.data.visitor_id;
              var res = str.split(".");
              var chat_curr_visitor_id = res[1];
              //UPDATING CHAT DAta OR TQASK DATA ON VISITOR ID BASE
              var res_query = ChatSessions.update({
                visitor_id : chat_curr_visitor_id
              }, {
                $set : {
                  'livechat_session_ids': curr_live_chat_id,
                  'ticket_id': curr_chat_ticket_id,
                  'name': curr_chat_updated_name
                }
              });
              //GET VISITOR DETAILS
            }
          });
          this.response.end('Success!\n');

        }
      });

      //CHAT STARTED HOOK

      this.route('hook', {
        path: '/hook',
        where: 'server',
        action: function() {

          this.response.writeHead(200, {'Content-Type': 'text/html'});
          this.response.write("You wrote: " + this.request.body);
          this.response.write("\n");

          //START SEND CUSTOMER DETAIL CHAT
          Meteor.call("sendCustomerDetails", this.request.body, function(error, result){
            if(error){
              //console.log( error);
              return false;
            } else {
              //console.log( result);
            }
          });

          this.response.end('Success!\n');

        }
      });
    });

    });
})();