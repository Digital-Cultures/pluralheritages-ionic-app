import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { EmbedVideoService } from 'ngx-embed-video';
import { RestRouteProvider } from '../../providers/rest-route/rest-route';

@Component({
    selector: 'page-intro',
    templateUrl: 'intro.html',
})
export class IntroPage {
   
    constructor(
        public restRouteProvider: RestRouteProvider
    ) {
        
    }

    changeTour(pageID:number, tourID:number){
        this.restRouteProvider.setRoute(pageID,tourID);
    }
}