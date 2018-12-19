import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
import { NativeAudio } from '@ionic-native/native-audio';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { MyApp } from './app.component';
import { IntroPage } from '../pages/intro/intro';
import { WalkingPage } from '../pages/walking/walking';
import { RestRouteProvider } from '../providers/rest-route/rest-route';
import { LottieAnimationViewModule } from 'ng-lottie';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    IntroPage,
    WalkingPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    EmbedVideo.forRoot(),
    LottieAnimationViewModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    IntroPage,
    WalkingPage
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
    RestRouteProvider,
    NativeAudio
  ]
})
export class AppModule {}