## Getting Started
After cloning the repo you may run the following to start the server.

```
meteor run --settings settings.json
```

## Deployment
Mupx is used for server deployments 
https://github.com/arunoda/meteor-up/tree/mupx

The config file for the respective environment needs to be provided with the deploy statement otherwise the default mup.json and settings.json files are used.
```
mupx deploy --config=mup-dev.json
```

## Creating a build for the Google Playstore (Android)

```
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore atlas.jks release-unsigned.apk atlas
jarsigner -verify -verbose -certs release-unsigned.apk
./zipalign -v 4 ~/android/release-unsigned.apk ~/atlas-android/atlas.apk

```

## Creating a Development/Debug Release

```
meteor build ~/android --server=https://dev.goodatlas.com --debug
```

## Meteor Packages

### Base Packages
```
meteor add check (Remove this package later if used the simple-schema)
meteor add reywood:publish-composite
meteor add aldeed:simple-schema (Using simple schema for our Mongo DB collections.);
meteor add aldeed:collection2 (used with simple-schema)
meteor add angular:angular-messages (https://libraries.io/meteor/angular:angular-messages)
meteor add netanelgilad:ng-cordova
meteor add iron:router
```

### Cordova Plugins
To add any cordova package run the command like this: https://www.codetutorial.io/meteor-ionic-and-cordova-basic-tutorial/

```
meteor add cordova:cordova-plugin-camera@1.2.0
meteor add angularui:angular-google-maps
meteor add cordova:cordova-plugin-geolocation@1.0.0
meteor add browser-policy
meteor add cordova:cordova-plugin-whitelist@1.2.1 meteor add edgee:slingshot
<!-- meteor add cordova:cordova-plugin-geolocation@0.3.12-->
<!-- meteor add cordova:ionic-plugin-keyboard@1.0.8 -->
```

### Push Notification Plugins
Useful Links
* https://atmospherejs.com/raix/push
* https://github.com/raix/push/
* https://github.com/raix/push/blob/master/docs/ADVANCED.md https://github.com/raix/push/issues/132

```
meteor add raix:push
```

For Android Settings, first create the app on google developer console. With the server key and add this apiKey in the config.push.json file.
* http://stached.io/standalone/fBLmRhsAuPSxKBSgM

### Stripe Plugins
Useful Links
* https://github.com/tyler-johnson/stripe-meteor/
* https://atmospherejs.com/mrgalaxy/stripe
* https://stripe.com/docs/api/node##customers
* https://dashboard.stripe.com/test/

### Stripe Meteor Packages

```
meteor add mrgalaxy:stripe
```

