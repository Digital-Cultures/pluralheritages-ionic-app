import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Geolocation } from '@ionic-native/geolocation';
import { greatCircle, point, polygon, destination, booleanPointInPolygon, bearing, distance } from '@turf/turf';
import { RestRouteProvider } from '../../providers/rest-route/rest-route';

/**
 * Generated class for the CompassPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-demoApp',
  templateUrl: 'demoApp.html',
})
export class DemoAppPage {
  @ViewChild('CompassCanvas') compasscanvasRef: ElementRef;

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

  location: any;
  bearing: number;
  distance: number;
  checkpoint: number = 0;
  routeRaw: any[];

  accuracy: number;
  heading: number;
  speed: number;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private geolocation: Geolocation,
    private platform: Platform,
    public restRouteProvider: RestRouteProvider) {
  }

  ngOnInit() {
    this.listenerFn = this.renderer.listen('window', 'deviceorientation', (evt) => {
      //console.log('deviceorientation', evt);
      this.event = evt;
      this.deviceOrientation.getCurrentHeading().then(
        (data1: DeviceOrientationCompassHeading) => {
          this.magneticHeading = data1.magneticHeading;
          // console.log(this.magneticHeading);

        },
        (error: any) => console.log(error + " - error message")
      );

      this.onHeadingChange(evt, this.magneticHeading);
      //window.removeEventListener("deviceorientation",processEvent);
    });

    setInterval(() => {    //<<<---    using ()=> syntax
      this.onHeadingChange(this.event, this.magneticHeading);
    }, 500);


    this.geolocation.watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).subscribe(position => {
      this.onPositionChange(position);
    });
    
  }

  onPositionChange(position){
    if (position.coords !== undefined) {
      this.location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      this.getDistance();
      this.getBearing();

      this.accuracy = position.coords.accuracy;
      this.heading = position.coords.heading;
      this.speed = position.coords.speed;
    }
  }
  onPositionError(position){
    console.log()
  }

  onHeadingChange(evt, mag) {


    let heading = evt.alpha;

    if (typeof evt.webkitCompassHeading !== "undefined") {
      heading = evt.webkitCompassHeading; //iOS non-standard
      this.orientation = "true North";
    }



    let cctx: CanvasRenderingContext2D =
      this.compasscanvasRef.nativeElement.getContext('2d');
    cctx.clearRect(0, 0, 340, 350);
    cctx.setTransform(1, 0, 0, 1, 0, 0);

    cctx.fillStyle = "#FFFF22";
    cctx.translate(170, 160);
    cctx.rotate(((this.bearing - this.magneticHeading) + 90) * Math.PI / 180);
    cctx.translate(-170, -160);
    cctx.beginPath();
    cctx.moveTo(135, 160);
    cctx.lineTo(210, 235);
    cctx.lineTo(240, 235);
    cctx.lineTo(165, 160);
    cctx.lineTo(240, 95);
    cctx.lineTo(210, 95);
    cctx.fill();
  }

  getBearing() {
    let routeRaw = this.restRouteProvider.getRoute();
    let targetLng: number = routeRaw.path[this.checkpoint][0];
    let targetLat: number = routeRaw.path[this.checkpoint][1];

    let myLocation = point([this.location.lng, this.location.lat]);
    let targetLocation = point([targetLng, targetLat]);

    let bear = bearing(myLocation, targetLocation);

    this.bearing = bear;
  }

  getDistance() {
    let routeRaw = this.restRouteProvider.getRoute();
    let targetLng: number = routeRaw.path[this.checkpoint][0];
    let targetLat: number = routeRaw.path[this.checkpoint][1];


    let myLocation = point([this.location.lng, this.location.lat]);
    let targetLocation = point([targetLng, targetLat]);

    //distance in meters
    this.distance = Math.round(distance(myLocation, targetLocation) * 1000);

    if (this.distance < 10) {
      this.checkpoint++;
    }
  }

  compassHeading(alpha, beta, gamma): number {

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
    return orientation;
  }
}

