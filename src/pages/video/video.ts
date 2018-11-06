import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
    selector: 'page-video',
    templateUrl: 'video.html',
})
export class VideoPage {
    iframe_html: any;
    vimeoUrl = "https://vimeo.com/254823750";

    selectedAnimation: any = "interactive";
    animations: any;
    interactive = false;
    anim: any;
    animationSpeed: number = 1;

    interactiveAnimationOption = {
        loop: true,
        prerender: false,
        autoplay: false,
        autoloadSegments: false,
        path: 'assets/animations/logoAni.json'
    }

    lottieAnimations = [
        {
            path: 'assets/animations/logoAni.json'
        }
    ];
    constructor(
        private embedService: EmbedVideoService
    ) {
        this.iframe_html = this.embedService.embed(this.vimeoUrl,{ hash: 't=1m2s',query: {  autoplay: 1 } });
    }

    changeAnimations() {
        this.interactive = false;
        this.animations = this.lottieAnimations;
    };

    handleAnimation(anim) {
        this.anim = anim;
      }
    
      stop() {
          this.anim.stop();
      }
    
      play() {
          this.anim.play();
      }
    
      pause() {
          this.anim.pause();
      }
    
      setSpeed() {
          this.anim.setSpeed(this.animationSpeed);
      }
    
      animate() {
        this.anim.playSegments([[27, 142], [14, 26]], true);
      }
}