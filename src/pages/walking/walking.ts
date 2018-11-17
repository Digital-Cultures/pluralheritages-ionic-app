import { Component, Renderer2 } from '@angular/core';
import { Nav, ToastController } from 'ionic-angular';
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

import { EmbedVideoService } from 'ngx-embed-video';
import { RestRouteProvider } from '../../providers/rest-route/rest-route';


@Component({
  selector: 'page-walking',
  templateUrl: 'walking.html'
})

export class WalkingPage {

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
  polygonLoaded: boolean = false;
  circleOptions: any;
  circleVariable: any;
  markerVariable: any[] = [undefined];
  tourGuide: string = "...";
  pointTitle: string;
  subtitleText: string;
  subtitlePosition: number;
  subData: any;
  subEnd: number;
  vimeoSubText: string = "";

  //video
  showVideoPlay = false;
  iframe_html: any;
  vimeoUrl: string = "https://vimeo.com/";
  vimeoClip: string = "";
  videoPlay: boolean = false;
  playingMarkerID: string;
  swapTourID: number;

  mapLocationMarker: {top:number,left:number} = {top:0,left:0};
  markerAnimationOption = {
    loop: true,
    prerender: true,
    autoplay: true,
    autoloadSegments: false,
    path: 'assets/animations/marker.json'
  }

  mapLabels: any[] = [];
  swapTour = false;
  footerSwapTourText = "";

  constructor(
    public toastCtrl: ToastController,
    private geolocation: Geolocation,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private screenOrientation: ScreenOrientation,
    private embedService: EmbedVideoService,
    public restRouteProvider: RestRouteProvider
  ) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.locationFix = false;
    this.polygonLoaded = false;
  }

  ionViewDidLoad() {
    this.loadMap();

    this.listenerFn = this.renderer.listen('window', 'deviceorientation', (evt) => {
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


      let routeRaw:number = this.restRouteProvider.getRouteNumber();

      let page:number = this.restRouteProvider.getRoutePageNumber();

      let allRoutesRaw;
      if (page==1){
        // walking back in time
        allRoutesRaw = this.restRouteProvider.getAllTimeRoutes();
      }else{
        // tour
        allRoutesRaw = this.restRouteProvider.getAllRoutes();
      }
      

      this.tourGuide = allRoutesRaw[routeRaw].name;

      for (let k = 0; k < allRoutesRaw.length; k++) {
        // non selected route
        if (k!=routeRaw){
          let path = [];
          for (let i = 0; i < allRoutesRaw[k].path.length; i++) {
            path.push({ "lat": allRoutesRaw[k].path[i][1], "lng": allRoutesRaw[k].path[i][0] })
          }

          this.map.addPolyline({
            points: path,
            //'width': 5,
            width: 4,
            color: '#AAAAAA'
          });
        }
      }

      //add selected polygon on top
      for (let k = 0; k < allRoutesRaw.length; k++) {
  
        if (k==routeRaw){
          let path = [];
          for (let i = 0; i < allRoutesRaw[k].path.length; i++) {
            path.push({ "lat": allRoutesRaw[k].path[i][1], "lng": allRoutesRaw[k].path[i][0] })
          }

          if (page==1){
            this.map.addPolyline({
              points: path,
              //'width': 5,
              width: 4,
              color: 'rgb(255, 81, 50)'
            });
          }else{
            this.map.addPolyline({
              points: path,
              //'width': 5,
              width: 4,
              color: '#FFA042'
            });
          }

          // zoom too
          let latLngBounds = new LatLngBounds(path);
          this.map.moveCamera({
            'target': latLngBounds
          });

        }
      }
     
      this.updateLabelPosition();

      // setInterval(() => {
      //   if (Math.round(this.magneticHeading) != this.map.getCameraBearing()) {
      //     this.onHeadingChange(this.magneticHeading);
      //   }
      // }, 50);


      // let myLocation = point([this.location.lng, this.location.lat]);
      // let targetLocation = point([allRoutesRaw[routeRaw].path[0][0], allRoutesRaw[routeRaw].path[0][1]]);
      // // if the distance is less than 40K zoom to your location
      // if (distance(myLocation, targetLocation)<40){
        setTimeout(()  =>{
          this.map.animateCamera({
            target: {lat: this.location.lat, lng: this.location.lng},
            zoom: 17,
            //tilt: 60,
            //bearing: 140,
            duration: 5000
          });
        }, 5000)
      // }


      this.geolocation.watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).subscribe(position => {
        this.updateLocation(position);
        this.distanceToMarker();
      });

      this.map.on(GoogleMapsEvent.CAMERA_MOVE_START).subscribe(() => {
        this.removeLabels();
      });

      this.map.on(GoogleMapsEvent.CAMERA_MOVE).subscribe(() => {
        this.updateLocationMarker();
      });

      this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
        this.updateLabelPosition();
        this.updateLocationMarker();
      });

    });
  }

  removeLabels() {
    this.mapLabels = [];
  }
  updateLabelPosition() {
    //select right route
    let routeRaw:number = this.restRouteProvider.getRouteNumber();
    let page:number = this.restRouteProvider.getRoutePageNumber();
    let allRoutesRaw;
    let redColor = false;
    if (page==1){
      redColor = true;
      allRoutesRaw = this.restRouteProvider.getAllTimeRoutes();
    }else{
      allRoutesRaw = this.restRouteProvider.getAllRoutes();
    }

    for (let k=0; k<allRoutesRaw.length; k++){
      
      if (allRoutesRaw[k].points) {
        
        for (let i = 0; i < allRoutesRaw[k].points.length; i++) {
          let selected  = (k == routeRaw ? true : false);
          this.map.fromLatLngToPoint({ lat: allRoutesRaw[k].points[i].lat, lng: allRoutesRaw[k].points[i].long }).then((point: any[]) => {
            if (point[0]>0 && point[1]>0 && point[0]<1000 && point[1]<1000){
              this.mapLabels.push({
                pointID: k+"_"+i,
                tourID: k,
                name: allRoutesRaw[k].name,
                title: allRoutesRaw[k].points[i].title,
                point: { left: Math.floor(point[0].toFixed(1)), top: Math.floor(point[1].toFixed(1))-35 },
                location: { lat: allRoutesRaw[k].points[i].lat, lng: allRoutesRaw[k].points[i].long },
                vimeo: allRoutesRaw[k].points[i].vimeoID,
                time: allRoutesRaw[k].points[i].time,
                endtime: allRoutesRaw[k].points[i].endtime,
                selected: selected,
                swapTourAllowed: false,
                redColor: redColor
                //action: function() {  this.playVideo(routeRaw,i); console.log("CLICK")}
              });
            }
          })
        }
      }
    }

  }

  updateLocationMarker() {
    if (this.locationFix) {
      this.map.fromLatLngToPoint({ lat: this.location.lat, lng: this.location.lng }).then((point: any[]) => {
        this.mapLocationMarker = {left: Math.floor(point[0].toFixed(1)-35), top: Math.floor(point[1].toFixed(1))-35};
      })
    }
  }

  changeTour(tourID:number){
    this.restRouteProvider.setRoute(this.restRouteProvider.getRoutePageNumber(),tourID);
  }

  public playVideo(vimeoID: string, time: string, endtime: string, title: string, pointID: string) {
    this.showVideoPlay = true;
    this.pointTitle = title;
    this.iframe_html = this.embedService.embed(this.vimeoUrl + vimeoID, { hash: 't=' + time, query: { autoplay: 1 } });
    this.playingMarkerID = pointID;

    this.restRouteProvider.getJSONsubs(this.tourGuide).subscribe(data => {
      console.log(time+"  -   "+endtime);
      //1m09s

      //convert to ms
      let timeArray = time.split('s')[0].split('m');
      let startTime: number = 0;
      if (timeArray.length>1){
         startTime = Number(timeArray[0])*60000 + Number(timeArray[1])*1000;
      }else{
         startTime = Number(timeArray[0])*1000;
      }
      console.log(startTime);

      let timeEndArray = endtime.split('s')[0].split('m');
      let endTime: number = 0;
      if (timeEndArray.length>1){
        endTime = Number(timeEndArray[0])*60000 + Number(timeEndArray[1])*1000;
      }else{
        endTime = Number(timeEndArray[0])*1000;
      }

      this.subData = data;

      for (let i=0; this.subData.start.length; i++){

        if (startTime >= this.subData.start[i]){
          this.subtitlePosition = i;
        }
        if (endTime <= this.subData.end[i]){
          this.subEnd = i;
          break;
        }
      }
      
      //display first subtitle from json
     /*
     this.subtitleText = this.subData.text[this.subtitlePosition];
      
      setTimeout(()  =>{
        this.nextSubtitle();
      }, this.subData.end[this.subtitlePosition]-this.subData.start[this.subtitlePosition]);
      */

      //get subtitles from vimeo
      this.vimeoSubtitle();

      console.log(this.subData.end[this.subtitlePosition]-this.subData.start[this.subtitlePosition]);

      //close modal
      setTimeout(()  =>{
        this.closeVideo();
      }, endTime-startTime)
    });
  }

  vimeoSubtitle(){
    let ifrm: any = document.getElementsByTagName('iframe');
    // reference to document in iframe
    let doc = ifrm[0].contentDocument? ifrm[0].contentDocument: ifrm[0].contentWindow.document;
    // get reference to greeting text box in iframed document
    let fld = doc.getElementsByClassName("vp-captions");
   
    this.vimeoSubText = "";

    if (fld.length>0){
      this.vimeoSubText = fld[0].textContent;
      this.subtitleText = this.vimeoSubText
    }

    setTimeout(()  =>{
      this.vimeoSubtitle();
    }, 50);
  }

  //subtitles from json (redundent)
  nextSubtitle() {
    this.subtitlePosition ++;
    this.subtitleText = this.subData.text[this.subtitlePosition];    

    if (this.subtitlePosition <= this.subEnd){
      setTimeout(()  =>{
        this.nextSubtitle();
      }, this.subData.end[this.subtitlePosition]-this.subData.start[this.subtitlePosition])
    }
  }

  closeVideo() {
    this.showVideoPlay = false;
  }


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
        'fillColor': '#FFA042',
        'fillOpacity': 0.1,
        'strokeWidth': 0
      };

      //if it exhists update point 

      if (this.polygonView) {
        this.polygonView.setPoints(newPoints);
      } else {
        this.map.addPolygon(this.polygonOptions).then((marker) => {
          this.polygonView = marker;
        });
 //       this.polygonLoaded = true;
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
     // let targetPoints = [point([41.014665, 28.983539]), point([40.993798, 28.921575]), point([41.026142, 28.938784]), point([40.996635, 28.928335]), point([41.035145, 28.941362])];

      let scanArea = polygon([[
        [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]],
        [endPoint.geometry.coordinates[0], endPoint.geometry.coordinates[1]],
        [endPoint2.geometry.coordinates[0], endPoint2.geometry.coordinates[1]],
        [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]
      ]]);

      this.showVideoPlay = false;

      // need a list of visable markers
      // targetPoints.forEach((targetPoint, i) => {
      //   if (booleanPointInPolygon(targetPoint, scanArea)) {
      //     //if it is already added dont do anything

      //     //else add the point
      //   } else {
      //     // if visable remove

      //   }

      // });




    }
  }

  // onButtonClick() {
  //   this.updateLocation();
  // }

  updateLocation(position) {
    if (!this.mapReady) {
      return;
    }
    // Get the location of you
    this.location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    this.locationFix = true;
  }

  distanceToMarker() {

    for (let i = 0; i < this.mapLabels.length; i++){

      let targetLng: number = this.mapLabels[i].location.lng;
      let targetLat: number = this.mapLabels[i].location.lat;

      let myLocation = point([this.location.lng, this.location.lat]);
      let targetLocation = point([targetLng, targetLat]);

      //distance in meters
      let distanceToPoint = Math.round(distance(myLocation, targetLocation) * 1000);

      if (distanceToPoint < 50) {
  
        if (this.mapLabels[i].selected){
          if (this.vimeoClip != this.mapLabels[i].vimeo) {
            if(this.playingMarkerID != this.mapLabels[i].pointID){
              this.playVideo(this.mapLabels[i].vimeo, this.mapLabels[i].time, this.mapLabels[i].endtime, this.mapLabels[i].title, this.mapLabels[i].pointID);
            }
          }
        }else{
          this.mapLabels[i].swapTourAllowed = true;
          this.footerSwapTourText = "SWAP TO "+this.mapLabels[i].name+"s TOUR \n AND HEAR ABOUT "+this.mapLabels[i].title;
          this.swapTour = true;
          this.swapTourID = this.mapLabels[i].tourID;
        }
      }
    }
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