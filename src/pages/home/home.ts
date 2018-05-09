import { Component, Renderer2 } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation,
  CameraPosition,
  ILatLng,
  LatLng
} from '@ionic-native/google-maps';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  mapReady: boolean = false;
  mapAnimating: boolean = false;
  map: GoogleMap;
  listenerFn: () => void;
  event: any;
  magneticHeading: number = 0;
  location: any;
  locationFix: boolean = false;

  GORYOKAKU_POINTS: ILatLng[] = [
    {lat: 54.9791583, lng: -1.6144455},
    {lat: 54.9791689, lng: -1.6140076},
    {lat: 54.9787878, lng: -1.6141799}
  ];

  constructor(
    public toastCtrl: ToastController, 
    private geolocation: Geolocation,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private screenOrientation: ScreenOrientation) 
  {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  ionViewDidLoad() {
    this.loadMap();

    this.listenerFn = this.renderer.listen('window', 'deviceorientation', (evt) => {
      //console.log('deviceorientation', evt);
      this.event = evt;
      this.deviceOrientation.getCurrentHeading().then(
        (data1: DeviceOrientationCompassHeading) => {
          this.magneticHeading=data1.magneticHeading;
         // console.log(this.magneticHeading);
          
        },
        (error: any) => console.log(error+" - error message")
      );
    });
  }

  loadMap() {
    // Create a map after the view is loaded.
    // (platform is already ready in app.component.ts)
    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: {
          lat: 54,
          lng: -1
        },
        zoom: 18,
        tilt: 30
      },
      gestures:{
        scroll:false
      }
    });

    // Wait the maps plugin is ready until the MAP_READY event
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapReady = true;

      setInterval(() => {    
        if (Math.round(this.magneticHeading)!=this.map.getCameraBearing()){
          this.onHeadingChange( this.magneticHeading);
        }
      }, 20);

      this.map.addMarker({
        title: 'Great North Museum: Hancock',
        snippet: 'play sound clip',
        position: {
          lat: 54.9787443,
          lng: -1.6126383
        }
      });

      this.map.addPolygon({
        'points': this.GORYOKAKU_POINTS,
        'strokeColor' : '#AA00FF',
        'fillColor' : '#00FFAA',
        'strokeWidth': 10
      });
    });
  }

  onHeadingChange(mag:number) {
    
    if(!this.mapAnimating && this.locationFix){
      this.mapAnimating = true;

      let newPoints = this.rotatePolygon(this.GORYOKAKU_POINTS, this.location, Math.round(mag)*-1);

      this.map.addPolygon({
        'points': newPoints,
        'strokeColor' : '#AA00FF',
        'fillColor' : '#00FFAA',
        'strokeWidth': 2
      });
      
      this.rotatePolygon(this.GORYOKAKU_POINTS, this.location, Math.round(mag));

      return this.map.animateCamera({
        target: this.location,
        zoom: this.map.getCameraZoom(),
        bearing: Math.round(mag),
        duration: 20
      }).then(() => {
        this.mapAnimating = false;
      });
    }
  }

  onButtonClick() {
    if (!this.mapReady) {
      this.showToast('map is not ready yet. Please try again.');
      return;
    }

    // Get the location of you
    this.geolocation.getCurrentPosition()
      .then((location) => {
        console.log(location);
        this.locationFix = true;
        this.location = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };

          // return this.map.addMarker({
          //   title: 'Sound',
          //   snippet: 'play sound clip',
          //   position: {
          //     lat: location.coords.latitude,
          //     lng: location.coords.longitude
          //   }
          // });
      })
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    toast.present(toast);
  }

  rotatePolygon(polygon,origin,angle):ILatLng[] {
    var coords = polygon.map(function(latLng){
      console.log("latLng ",latLng);
       let angleRad = angle * Math.PI / 180.0;
       
       return {
          lng: Math.cos(angleRad) * (latLng.lng - origin.lng) - Math.sin(angleRad) * (latLng.lat - origin.lat) + origin.lng,
          lat: Math.sin(angleRad) * (latLng.lng - origin.lng) + Math.cos(angleRad) * (latLng.lat - origin.lat) + origin.lat
        };
    });
    return coords;
    //polygon.setPath(coords);
  }

  // rotatePoint(point, angle) {
  //   console.log("point", point);
  //   let origin = {lng:this.location.lng, lat:this.location.lat};
  //   let angleRad = angle * Math.PI / 180.0;
  //   return {
        
  //   };
  // }
}