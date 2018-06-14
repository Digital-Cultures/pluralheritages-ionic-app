import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { DemoAppPage } from '../pages/demoApp/demoApp';
import { CompassPage } from '../pages/compass/compass';
import { VideoPage } from '../pages/video/video';
import { RestRouteProvider } from '../providers/rest-route/rest-route';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;  // <<< Do not set the root page until the platform.ready()
                  //      This avoids to face the plugin loading error.

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public restRouteProvider: RestRouteProvider) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'App', component: DemoAppPage },
      { title: 'Compass', component: CompassPage },
      { title: 'Video', component: VideoPage }
    ]
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.rootPage = HomePage;
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  openPage(page) {
    this.nav.setRoot(page.component);
  }

  radioChecked(value){
    this.restRouteProvider.setRoute(value);
  }
}

