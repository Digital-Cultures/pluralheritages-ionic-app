import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';

/**
 * Generated class for the CompassPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-compass',
  templateUrl: 'compass.html',
})
export class CompassPage {
  @ViewChild('myCanvas') canvasRef: ElementRef;

  direction: string;
  orientation: string = "~";
  defaultOrientation: any;
  positionCurrent = {
    lat: null,
    lng: null,
    hng: null
  };
  magneticHeading: any;
  listenerFn: () => void;
  event: any;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private platform: Platform) {
  }

  ngOnInit() {
    this.listenerFn = this.renderer.listen('window', 'deviceorientation', (evt) => {
                        console.log('deviceorientation', evt);
                        this.event = evt;
                        this.deviceOrientation.getCurrentHeading().then(
                          (data1: DeviceOrientationCompassHeading) => {
                            this.magneticHeading=data1.magneticHeading;
                            console.log(this.magneticHeading);
                            
                          },
                          (error: any) => console.log(error+" - error message")
                      );

                        this.onHeadingChange(evt, this.magneticHeading);
                        //window.removeEventListener("deviceorientation",processEvent);
                      });

    setInterval(() => {    //<<<---    using ()=> syntax
      this.onHeadingChange(this.event, this.magneticHeading);
    }, 500);

    this.renderer.listen('window', 'compassneedscalibration', (evt) => {
      // ask user to wave device in a figure-eight motion  
      //this.orientation += "~";
      event.preventDefault();
    });
  }

  onHeadingChange(evt, mag) {
    let heading = evt.alpha;

    if (typeof evt.webkitCompassHeading !== "undefined") {
      heading = evt.webkitCompassHeading; //iOS non-standard
      this.orientation = "true North";
    }


    let ctx: CanvasRenderingContext2D =
      this.canvasRef.nativeElement.getContext('2d');

    ctx.clearRect(0, 0, 360, 850);
    ctx.fillStyle = "#FF7777";
    ctx.font = "14px Verdana";
    ctx.fillText("Alpha: " + Math.round(mag), 10, 20);
    ctx.beginPath();
    ctx.moveTo(180, 75);
    ctx.lineTo(180, 0);
    ctx.arc(180, 75, 60, 1.5* Math.PI, -1*(mag+90) * Math.PI / 180);
    ctx.fill();

    ctx.fillStyle = "#FF6600";
    ctx.fillText("Beta: " + Math.round(evt.beta), 10, 140);
    ctx.beginPath();
    ctx.fillRect(180, 150, evt.beta, 90);

    ctx.fillStyle = "#FF0000";
    ctx.fillText("Gamma: " + Math.round(evt.gamma), 10, 270);
    ctx.beginPath();
    ctx.fillRect(90, 340, 180, evt.gamma);


    let orientation = this.getBrowserOrientation(evt);

    if (typeof heading !== "undefined" && heading !== null) { // && typeof orientation !== "undefined") {
      // we have a browser that reports device heading and orientation


      // what adjustment we have to add to rotation to allow for current device orientation
      let adjustment = 0;
      if (this.defaultOrientation === "landscape") {
        adjustment -= 90;
      }

      if (typeof orientation !== "undefined") {
        let currentOrientation = orientation.split("-");

        if (this.defaultOrientation !== currentOrientation[0]) {
          if (this.defaultOrientation === "landscape") {
            adjustment -= 270;
          } else {
            adjustment -= 90;
          }
        }

        if (currentOrientation[1] === "secondary") {
          adjustment -= 180;
        }
      }

      this.positionCurrent.hng = heading + adjustment;

      let phase = this.positionCurrent.hng < 0 ? 360 + this.positionCurrent.hng : this.positionCurrent.hng;
      this.direction = evt.webkitCompassHeading;//this.compassHeading(evt.alpha, evt.beta, evt.gamma) + "°";

    }
  }

  compassHeading(alpha, beta, gamma):number {

    // Convert degrees to radians
    let alphaRad = alpha * (Math.PI / 180);
    let betaRad = beta * (Math.PI / 180);
    let gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    let cA = Math.cos(alphaRad);
    let sA = Math.sin(alphaRad);
    let cB = Math.cos(betaRad);
    let sB = Math.sin(betaRad);
    let cG = Math.cos(gammaRad);
    let sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    let rA = - cA * sG - sA * sB * cG;
    let rB = - sA * sG + cA * sB * cG;
    let rC = - cB * cG;

    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;

  }

  getBrowserOrientation(evt): string {
    let orientation;
    if (evt.orientation && evt.orientation.type) {
      orientation = evt.orientation.type;
    } else {
      orientation = evt.orientation ||
        evt.mozOrientation ||
        evt.msOrientation;
    }

    /*
      'portait-primary':      for (screen width < screen height, e.g. phone, phablet, small tablet)
                                device is in 'normal' orientation
                              for (screen width > screen height, e.g. large tablet, laptop)
                                device has been turned 90deg clockwise from normal
      'portait-secondary':    for (screen width < screen height)
                                device has been turned 180deg from normal
                              for (screen width > screen height)
                                device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
      'landscape-primary':    for (screen width < screen height)
                                device has been turned 90deg clockwise from normal
                              for (screen width > screen height)
                                device is in 'normal' orientation
      'landscape-secondary':  for (screen width < screen height)
                                device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
                              for (screen width > screen height)
                                device has been turned 180deg from normal
    */

    return orientation;
  }



}

