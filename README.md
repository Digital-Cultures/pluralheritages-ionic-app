---
title: Soaking in the history
description: Audio player based on compass direction
---

# cordova-plugin-device-orientation

------

## Description

------

## Notes:
The [deviceorientationabsolute](http://w3c.github.io/deviceorientation/spec-source-orientation.html#deviceorientationabsolute
See: https://developers.google.com/web/updates/2016/03/device-orientation-changes) dosn't seem to work on my android phone and deviceorientation didnt give a true north, so used the [cordova-plugin-device-orientation] (https://github.com/apache/cordova-plugin-device-orientation) and this seemed to work.

------
## Google Play Store update app:

$ ionic cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk apptest

~/Library/Android/sdk/build-tools/28.0.2/zipalign -v 4 /Users/danfostersmith/Documents/GitHub/soakinginhistory/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk testApp.apk

