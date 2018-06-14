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
  LatLng,
  PolygonOptions,
  MarkerOptions
} from '@ionic-native/google-maps';
import { greatCircle, point, polygon, destination, booleanPointInPolygon } from '@turf/turf';
import { Vibration } from '@ionic-native/vibration';
import { EmbedVideoService } from 'ngx-embed-video';
import { RestRouteProvider } from '../../providers/rest-route/rest-route';

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
  polygonOptions: any;
  polygonVariable: any;
  markerVariable: any[] = [undefined];

  //video
  iframe_html: any;
  vimeoUrl = "https://vimeo.com/254823750";
  videoPlay: boolean = false;

  constructor(
    public toastCtrl: ToastController,
    private geolocation: Geolocation,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private screenOrientation: ScreenOrientation,
    private vibration: Vibration,
    private embedService: EmbedVideoService,
    public restRouteProvider: RestRouteProvider
  ) {
    // this.turfObj = new turf();
    // console.log(turf.greatCircle([0, 0], [100, 10]));
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  ionViewDidLoad() {
    this.loadMap();

    this.listenerFn = this.renderer.listen('window', 'deviceorientation', (evt) => {
      //console.log('deviceorientation', evt);
      this.event = evt;
      this.deviceOrientation.getCurrentHeading().then(
        (data1: DeviceOrientationCompassHeading) => {
          this.magneticHeading = data1.magneticHeading;
        },
        (error: any) => console.log(error + " - error message")
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
        zoom: 16,
        tilt: 30
      },
      gestures: {
      //  scroll: false
      }
    });

    // Wait the maps plugin is ready until the MAP_READY event
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapReady = true;

      let routeRaw = this.restRouteProvider.getRoute();
      let path = [];
      for (let i = 0; i < routeRaw.length; i++) {
        // this.map.addMarker({
        //   title: 'Play',
        //   snippet: 'play sound clip',
        //   position: { lat: routeRaw[i][1], lng: routeRaw[i][0] }
        // }) 
        path.push({"lat": routeRaw[i][1], "lng": routeRaw[i][0]})
      }
      
      this.map.addPolyline({
        points: path,
        'color' : '#AA00FF',
        'width': 5,
        'geodesic': true
      });
    
      setInterval(() => {
        if (Math.round(this.magneticHeading) != this.map.getCameraBearing()) {
          this.onHeadingChange(this.magneticHeading);
        }
      }, 20);


      setInterval(() => {
        if (Math.round(this.magneticHeading) != this.map.getCameraBearing()) {
          this.onHeadingChange(this.magneticHeading);
        }
      }, 20);

      this.geolocation.watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).subscribe(position => {
        this.updateLocation(position);
      });
      
      // setInterval(() => {
      //   this.updateLocation();
      // }, 20000);

    });
  }

  onHeadingChange(mag: number) {

    if (!this.mapAnimating && this.locationFix) {
      this.mapAnimating = true;

      // let newPoints = this.rotatePolygon(this.GORYOKAKU_POINTS, this.location, Math.round(mag)*-1);

      let startPoint = point([this.location.lat, this.location.lng]);
      let distance = 1;
      let northBearing = mag * -1;

      let endPoint = destination(startPoint, distance, Math.round(northBearing) + 60);
      let endPoint2 = destination(startPoint, distance, Math.round(northBearing) + 120);

      let newPoints: ILatLng[] = [
        { lat: startPoint.geometry.coordinates[0], lng: startPoint.geometry.coordinates[1] },
        { lat: endPoint.geometry.coordinates[0], lng: endPoint.geometry.coordinates[1] },
        { lat: endPoint2.geometry.coordinates[0], lng: endPoint2.geometry.coordinates[1] },
        { lat: startPoint.geometry.coordinates[0], lng: startPoint.geometry.coordinates[1] }
      ];

      this.polygonOptions = {
        'points': newPoints,
        'strokeColor': '#AA00FF',
        'fillColor': '#00FFAA',
        'strokeWidth': 2
      };

      if (this.polygonVariable) {
        this.polygonVariable.setPoints(newPoints);
      } else {
        this.map.addPolygon(this.polygonOptions).then((marker) => {
          this.polygonVariable = marker;
        });
      }

      // Triger if overlap
      let targetPoints = [point([55.2971528, -1.7117829]),point([54.979078, -1.611853])];
      let scanArea = polygon([[
        [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]],
        [endPoint.geometry.coordinates[0], endPoint.geometry.coordinates[1]],
        [endPoint2.geometry.coordinates[0], endPoint2.geometry.coordinates[1]],
        [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]
      ]]);

      targetPoints.forEach((targetPoint,i) => {
        if (booleanPointInPolygon(targetPoint, scanArea)) {
          // so it only happens once
          if (!this.videoPlay) {
            this.vibration.vibrate(20);
            this.videoPlay = true;
            
            if (this.markerVariable[i]) {
              this.markerVariable[i].setPosition({ lat: targetPoint.geometry.coordinates[0], lng: targetPoint.geometry.coordinates[1] });
            } else {
              this.map.addMarker({
                title: 'Play',
                snippet: 'play sound clip',
                position: { lat: targetPoint.geometry.coordinates[0], lng: targetPoint.geometry.coordinates[1] }
              }).then((marker) => {
                marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(e => {
                  this.iframe_html = this.embedService.embed(this.vimeoUrl, { hash: 't=1m2s', query: { autoplay: 1 } });
                  
                  //stop centering around marker
                  this.map.setCameraTarget(this.map.getCameraTarget());
                });
                this.markerVariable.push(marker);
              });
            }
          }
        } else {
          //not in scan area so remove
          if (this.videoPlay) {
            if (this.markerVariable[i]) {
              this.markerVariable[i].remove();
              this.markerVariable.splice(i);
              this.videoPlay = false;
            }
          }
        }
      });
      

      //this.polygon.setMap(this.map)

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

  // onButtonClick() {
  //   this.updateLocation();
  // }

  updateLocation(position) {
    if (!this.mapReady) {
      this.showToast('map is not ready yet. Please try again.');
      return;
    }
    // Get the location of you
      this.locationFix = true;
      this.location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    toast.present(toast);
  }

  rotatePolygon(polygon, origin, angle): ILatLng[] {
    var coords = polygon.map(function (latLng) {
      console.log("latLng ", latLng);
      let angleRad = angle * Math.PI / 180.0;

      return {
        lng: Math.cos(angleRad) * (latLng.lng - origin.lng) - Math.sin(angleRad) * (latLng.lat - origin.lat) + origin.lng,
        lat: Math.sin(angleRad) * (latLng.lng - origin.lng) + Math.cos(angleRad) * (latLng.lat - origin.lat) + origin.lat
      };
    });
    return coords;
  }
}