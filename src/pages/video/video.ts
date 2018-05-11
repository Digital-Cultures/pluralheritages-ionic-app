import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { EmbedVideoService } from 'ngx-embed-video';

@IonicPage()
@Component({
    selector: 'page-video',
    templateUrl: 'video.html',
})
export class VideoPage {
    iframe_html: any;
    vimeoUrl = "https://vimeo.com/254823750";

    constructor(
        private embedService: EmbedVideoService
    ) {
        this.iframe_html = this.embedService.embed(this.vimeoUrl,{ hash: 't=1m2s',query: {  autoplay: 1 } });
    }
}