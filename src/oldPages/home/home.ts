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
  LatLngBounds,
  PolygonOptions,
  MarkerOptions
} from '@ionic-native/google-maps';
import { greatCircle, point, polygon, destination, booleanPointInPolygon, distance, circle } from '@turf/turf';
//import { Vibration } from '@ionic-native/vibration';
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
  polygonView: any;
  polygonLoaded:boolean = false;
  circleOptions: any;
  circleVariable: any;
  markerVariable: any[] = [undefined];

  //video
  showVideoPlay = false;
  iframe_html: any;
  vimeoUrl: string = "https://vimeo.com/";
  vimeoClip: string = "";
  videoPlay: boolean = false;

  mapLabels: any[] = [];

  constructor(
    public toastCtrl: ToastController,
    private geolocation: Geolocation,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private screenOrientation: ScreenOrientation,
    //private vibration: Vibration,
    private embedService: EmbedVideoService,
    public restRouteProvider: RestRouteProvider
  ) {
    // this.turfObj = new turf();
    // console.log(turf.greatCircle([0, 0], [100, 10]));
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.locationFix = false;
    this.polygonLoaded = false;
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
      },
      styles: [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      },
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]
    });
  
    // this.map.on(GoogleMapsEvent.MAP_DRAG_START).subscribe(() => {
    //   this.updateLabelPosition();
    // });
    // this.map.on(GoogleMapsEvent.MAP_DRAG).subscribe(() => {
    //   this.updateLabelPosition();
    // });
    // this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(() => {
    //   this.updateLabelPosition();
    // });

    // this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(() => {
    //   this.updateLabelPosition();
    // });

   
    // Wait the maps plugin is ready until the MAP_READY event
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapReady = true;

      let routeRaw = this.restRouteProvider.getRoute();
      let path = [];
      for (let i = 0; i < routeRaw.path.length; i++) {
        // this.map.addMarker({
        //   title: 'Play',
        //   snippet: 'play sound clip',
        //   position: { lat: routeRaw[i][1], lng: routeRaw[i][0] }
        // }) 
        path.push({"lat": routeRaw.path[i][1], "lng": routeRaw.path[i][0]})
      }
      
      this.map.addPolyline({
        points: path,
        'color' : '#FFFFFF',
        'width': 5,
        'geodesic': true,
        'strokeOpacity': 0.9
      });

       /* if(routeRaw.points){
          for (let i = 0; i < routeRaw.points.length; i++) {
            this.map.addMarker({
               // title: routeRaw.points[i].title,
                position: { lat: routeRaw.points[i].lat, lng: routeRaw.points[i].long },
               // visible: true
              }).then((marker) => {
                marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(e => {
                  this.iframe_html = this.embedService.embed(this.vimeoUrl+routeRaw.vimeoID, { hash: 't='+routeRaw.points[i].time, query: { autoplay: 1 } });
                  
                  //stop centering around marker
                  this.map.setCameraTarget(this.map.getCameraTarget());
                });
               // marker.showInfoWindow();
              });
              console.log(routeRaw.points[i].title);
          }
        }
*/

      let latLngBounds = new LatLngBounds(path);
      //let bounds = [];
      this.map.moveCamera({
        'target': latLngBounds
      });
      
      this.updateLabelPosition();
      
      setInterval(() => {
        //if (Math.round(this.magneticHeading) != this.map.getCameraBearing()) {
          this.onHeadingChange(this.magneticHeading);
       // }
      }, 50);


      this.geolocation.watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).subscribe(position => {
        this.updateLocation(position);
      });

       this.map.on(GoogleMapsEvent.CAMERA_MOVE_START).subscribe(() => {
      this.removeLabels();
    });
    
    this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
      this.updateLabelPosition();
    });
      
    });
  }

  removeLabels(){
    this.mapLabels = [];
  }
  updateLabelPosition(){
    let routeRaw = this.restRouteProvider.getRoute();
    if(routeRaw.points){
      for (let i = 0; i < routeRaw.points.length; i++) {
        this.map.fromLatLngToPoint( { lat: routeRaw.points[i].lat, lng: routeRaw.points[i].long}).then((point: any[]) => {
          this.mapLabels.push({
            title: routeRaw.points[i].title,
            point: { left: Math.floor(point[0].toFixed(1)), top: Math.floor(point[1].toFixed(1))},
            action: function() {  this.iframe_html = this.embedService.embed(this.vimeoUrl+routeRaw.vimeoID, { hash: 't='+routeRaw.points[i].time, query: { autoplay: 1 } }); console.log("CLICK")}
          });
        })
      }
    }
  }

  // onLabelClick(){
  //   console.log("CLICK");
  // }

  onHeadingChange(mag: number) {

    if (this.locationFix) {
      this.mapAnimating = true;

      // let newPoints = this.rotatePolygon(this.GORYOKAKU_POINTS, this.location, Math.round(mag)*-1);

      let startPoint = point([this.location.lat, this.location.lng]);
      let distance = 0.2;
      let northBearing = mag * -1;

      let endPoint = destination(startPoint, distance, Math.round(northBearing) + 70);
      let endPoint2 = destination(startPoint, distance, Math.round(northBearing) + 110);

      let newPoints: ILatLng[] = [
        { lat: startPoint.geometry.coordinates[0], lng: startPoint.geometry.coordinates[1] },
        { lat: endPoint.geometry.coordinates[0], lng: endPoint.geometry.coordinates[1] },
        { lat: endPoint2.geometry.coordinates[0], lng: endPoint2.geometry.coordinates[1] },
        { lat: startPoint.geometry.coordinates[0], lng: startPoint.geometry.coordinates[1] }
      ];

/*
       //Circle overlay
       var center = [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]];
       var radius = 0.02;
       //var options = {steps: 10, units: 'kilometers'};
       var circlePoints = circle(center, radius, {steps: 10, units: 'kilometers'});
 
       console.log(circlePoints);
 
       let newCirclePoints: ILatLng[] = [];
       circlePoints.geometry.coordinates[0].forEach( point => {
         newPoints.push({ lat: point[0], lng: point[1] });
       });
  */     

      this.polygonOptions = {
        'points': newPoints,
        'fillColor': '#00AAFF',
        'fillOpacity': 0.1,
        'strokeWidth': 0
      };

      //if it exhists update point 
      
      if (this.polygonLoaded) {
        this.polygonView.setPoints(newPoints);
      } else {
        this.map.addPolygon(this.polygonOptions).then((marker) => {
          this.polygonView = marker;
        });
        this.polygonLoaded = true;
      }

     
/*
      this.circleOptions = {
        'points': newCirclePoints,
        'strokeColor': '#FFFFFF',
        'fillColor': '#FFFFFF',
        'fillOpacity': 0.1,
        'strokeWidth': 2
      };


       //if it exhists update point 
       if (this.circleVariable) {
        this.circleVariable.setPoints(newCirclePoints);
      } else {
        this.map.addPolygon(this.circleOptions).then((marker) => {
          this.circleVariable = marker;
          this.mapAnimating = false;
        });
      }
*/
      // Triger if overlap
      let targetPoints = [point([41.014665, 28.983539]), point([40.993798, 28.921575]),point([41.026142,28.938784]), point([40.996635,28.928335]), point([41.035145,28.941362])];    
      
      let scanArea = polygon([[
        [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]],
        [endPoint.geometry.coordinates[0], endPoint.geometry.coordinates[1]],
        [endPoint2.geometry.coordinates[0], endPoint2.geometry.coordinates[1]],
        [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]
      ]]);

      this.showVideoPlay = false;

      // need a list of visable markers
      targetPoints.forEach((targetPoint,i) => {
        if (booleanPointInPolygon(targetPoint, scanArea)) {
          //if it is already added dont do anything

          //else add the point
        }else{
          // if visable remove
        
        }

      });

      this.distanceToMarker();
      /*
          // so it only happens once
          if (!this.videoPlay) {
            //this.vibration.vibrate(20);
            this.videoPlay = true;
            
            if (this.markerVariable[i]) {
              this.markerVariable[i].setPosition({ lat: targetPoint.geometry.coordinates[0], lng: targetPoint.geometry.coordinates[1] });
            } else {
              // make play button visable
              this.showVideoPlay = true;
              this.map.addMarker({
                title: 'Play',
                snippet: 'play sound clip',
                position: { lat: targetPoint.geometry.coordinates[0], lng: targetPoint.geometry.coordinates[1] }
              }).then((marker) => {
                marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(e => {
                  this.iframe_html = this.embedService.embed(this.vimeoUrl, { hash: 't=10s', query: { autoplay: 1 } });
                  
                  //stop centering around marker
                  this.map.setCameraTarget(this.map.getCameraTarget());
                });
                this.markerVariable.push(marker);
              });
            }
          }
        } else {
            if (this.markerVariable[i]) {
              this.markerVariable[i].remove();
              this.markerVariable.splice(i);;
            }
        }
      });
      */

      //this.polygon.setMap(this.map)

      // return this.map.moveCamera({
      //   //target: this.location,
      //   //zoom: this.map.getCameraZoom(),
      //   //bearing: Math.round(mag),
      //   //duration: 20
      // }).then(() => {
      //  // this.mapAnimating = false;
      // });

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
      this.location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.locationFix = true;
  }

  distanceToMarker(){
    let routeRaw = this.restRouteProvider.getRoute();
    if(routeRaw.points){
      for (let i = 0; i < routeRaw.points.length; i++) {

        let routeRaw = this.restRouteProvider.getRoute();
        let targetLng: number = routeRaw.points[i].long;
        let targetLat: number = routeRaw.points[i].lat;


        let myLocation = point([this.location.lng, this.location.lat]);
        let targetLocation = point([targetLng, targetLat]);

        //distance in meters
        let distanceToPoint = Math.round(distance(myLocation, targetLocation) * 1000);
       // console.log(distanceToPoint);
        if (distanceToPoint<50){
         // console.log("Play clip "+this.vimeoClip+" != "+routeRaw.vimeoID);
          if (this.vimeoClip != routeRaw.vimeoID){
            //console.log("Play");
            this.vimeoClip = routeRaw.vimeoID;
            this.iframe_html = this.embedService.embed(this.vimeoUrl+routeRaw.vimeoID, { hash: 't='+routeRaw.points[i].time, query: { autoplay: 1 } });
          }
        }
      }
    }
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
      //console.log("latLng ", latLng);
      let angleRad = angle * Math.PI / 180.0;

      return {
        lng: Math.cos(angleRad) * (latLng.lng - origin.lng) - Math.sin(angleRad) * (latLng.lat - origin.lat) + origin.lng,
        lat: Math.sin(angleRad) * (latLng.lng - origin.lng) + Math.cos(angleRad) * (latLng.lat - origin.lat) + origin.lat
      };
    });
    return coords;
  }
}