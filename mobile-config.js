App.info({
  name: 'Chat App',
  description: 'your local assistant',
  version: '0.0.2',
  author: 'Zaka'
});

App.icons({
  // iOS
  'iphone': 'public/resources/ios/icon/icon-60.png',
  'iphone_2x': 'public/resources/ios/icon/icon-60@2x.png',
  'iphone_3x': 'public/resources/ios/icon/icon-60@3x.png',
  'ipad': 'public/resources/ios/icon/icon-76.png',
  'ipad_2x': 'public/resources/ios/icon/icon-76@2x.png',

  // Android
  'android_ldpi': 'public/resources/android/icon/drawable-ldpi-icon.png',//icon-36x36.png',
  'android_mdpi': 'public/resources/android/icon/drawable-mdpi-icon.png',
  'android_hdpi': 'public/resources/android/icon/drawable-hdpi-icon.png',
  'android_xhdpi': 'public/resources/android/icon/drawable-xhdpi-icon.png'
});

App.launchScreens({
  // iOS
  'iphone': 'public/resources/ios/splash/Default~iphone.png',
  'iphone_2x': 'public/resources/ios/splash/Default@2x~iphone.png',
  'iphone5': 'public/resources/ios/splash/Default-568h@2x~iphone.png',
  'iphone6': 'public/resources/ios/splash/Default-667h.png',
  'iphone6p_portrait': 'public/resources/ios/splash/Default-736h.png',
  'iphone6p_landscape': 'public/resources/ios/splash/Default-Landscape-736h.png',

  'ipad_portrait': 'public/resources/ios/splash/Default-Portrait~ipad.png',
  'ipad_portrait_2x': 'public/resources/ios/splash/Default-Portrait@2x~ipad.png',
  'ipad_landscape': 'public/resources/ios/splash/Default-Landscape~ipad.png',
  'ipad_landscape_2x': 'public/resources/ios/splash/Default-Landscape@2x~ipad.png',

  // Android
  'android_ldpi_portrait': 'public/resources/android/splash/drawable-port-ldpi-screen.png',
  'android_ldpi_landscape': 'public/resources/android/splash/drawable-land-ldpi-screen.png',
  'android_mdpi_portrait': 'public/resources/android/splash/drawable-port-mdpi-screen.png',
  'android_mdpi_landscape': 'public/resources/android/splash/drawable-land-mdpi-screen.png',
  'android_hdpi_portrait': 'public/resources/android/splash/drawable-port-hdpi-screen.png',
  'android_hdpi_landscape': 'public/resources/android/splash/drawable-land-hdpi-screen.png',
  'android_xhdpi_portrait': 'public/resources/android/splash/drawable-port-xhdpi-screen.png',
  'android_xhdpi_landscape': 'public/resources/android/splash/drawable-land-xhdpi-screen.png'
});

App.accessRule('*');
App.accessRule('*.google-analytics.com/*');
App.setPreference('AutoHideSplashScreen' ,'true');
App.setPreference('KeyboardDisplayRequiresUserAction' ,'true');
App.setPreference('Orientation', 'sensorPortrait', 'android');
App.setPreference('HideKeyboardFormAccessoryBar', 'true');
