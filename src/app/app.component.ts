import { Component, ViewChild, Injectable } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { timer } from 'rxjs/observable/timer';
import { TranslateService } from '@ngx-translate/core';

import { IntroPage } from '../pages/intro/intro';
import { WalkingPage } from '../pages/walking/walking';
import { RestRouteProvider } from '../providers/rest-route/rest-route';


@Component({
  templateUrl: 'app.html'
})

@Injectable()
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;  // <<< Do not set the root page until the platform.ready()
                  //      This avoids to face the plugin loading error.

  pages: Array<{title: string, component: any, subPages?: any }>;
  walkSubPages: Array<{title: string, component: any }> = [];
  walkTimeSubPages: Array<{title: string, component: any }> = [];
  pageID: number = 0;
  routeID: number = 0;
  language: string = 'en';
  
  selectedMenu: number;
  selectedWalk: number;

  showSplash = true;

  interactiveAnimationOption = {
    loop: true,
    prerender: true,
    autoplay: true,
    autoloadSegments: false,
    path: 'assets/animations/logoAni.json'
}

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public restRouteProvider: RestRouteProvider,
    public menuCtrl: MenuController,
    public translate: TranslateService,
    private screenOrientation: ScreenOrientation) {

      this.initializeApp();

      this.translate.setDefaultLang(this.language);
      this.translate.use(this.language);
      // set to landscape
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);


      restRouteProvider.getAllRoutes();
      let allRoutesRaw = this.restRouteProvider.getAllRoutes();
      
      for (let k = 0; k < allRoutesRaw.length; k++) {
        this.walkSubPages.push({title: allRoutesRaw[k].name, component: WalkingPage})
      }

      let allTimeRoutesRaw = this.restRouteProvider.getAllTimeRoutes();
      for (let k = 0; k < allTimeRoutesRaw.length; k++) {
        this.walkTimeSubPages.push({title: allTimeRoutesRaw[k].name, component: WalkingPage})
      }

      this.pages = [
        { title: 'HOME', component: IntroPage },
        { title: 'WALKING BACK IN TIME', component: WalkingPage, subPages: this.walkTimeSubPages },
        { title: 'WALKING WITH...', component: WalkingPage, subPages: this.walkSubPages },
        { title: 'VANTAGE POINT', component: WalkingPage, subPages: this.walkSubPages }
      ]

      this.restRouteProvider.route.subscribe(routeID => {
        if(this.routeID != routeID){
          this.openPage(this.walkSubPages[this.pageID], routeID, true)
        }
        this.routeID = routeID;
        console.log(routeID);
      })

      this.restRouteProvider.page.subscribe(pageID => {
        if(this.pageID != pageID){
          this.pageID = pageID;
          this.openPage(this.walkSubPages[pageID], this.routeID, true)
        }
      })

      this.restRouteProvider.language.subscribe(language => {
        if(this.language != language){
          this.language = language;
        }
      })
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.rootPage = IntroPage;
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      timer(3000).subscribe(() => this.showSplash = false)
    });
  }

  openPage(page, index, subPage) {
    //if pages has loaded
    if(page){

      //open / close submenu
      if(!subPage){
        if (this.selectedMenu == index){
          this.selectedMenu = 0;
        }else{
          this.selectedMenu = index;
        }
      }
      //if not a header menu open the page
      else{
          this.restRouteProvider.setRoute(this.pageID,index);
      }
      
      if(!page.subPages){
        //set the page
        this.nav.setRoot(page.component);
        //close sub menu
        this.menuCtrl.close();
      }

      this.selectedWalk = index;
    }
  }

  setRoute(page,route){
      this.restRouteProvider.setRoute(page,route);

  }

  segmentChanged(event){
    this.restRouteProvider.setLanguage(event.value);
    this.translate.use(event.value);
  }
}
