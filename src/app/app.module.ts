import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; 
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { DeviceOrientation } from '@ionic-native/device-orientation';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps } from "@ionic-native/google-maps";
import { Vibration } from "@ionic-native/vibration";
import { EmbedVideo } from 'ngx-embed-video';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { DemoAppPage } from '../pages/demoApp/demoApp';
import { IntroPage } from '../pages/intro/intro';
import { WalkingPage } from '../pages/walking/walking';
import { CompassPage } from '../pages/compass/compass';
import { VideoPage } from '../pages/video/video';
import { RestRouteProvider } from '../providers/rest-route/rest-route';
import { LottieAnimationViewModule } from 'ng-lottie';

@NgModule({
  declarations: [
    MyApp,
    DemoAppPage,
    IntroPage,
    WalkingPage,
    CompassPage,
    VideoPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    EmbedVideo.forRoot(),
    LottieAnimationViewModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    DemoAppPage,
    IntroPage,
    WalkingPage,
    CompassPage,
    VideoPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DeviceOrientation,
    ScreenOrientation,
    Geolocation,
    GoogleMaps,
    Vibration,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    RestRouteProvider
  ]
})
export class AppModule {}