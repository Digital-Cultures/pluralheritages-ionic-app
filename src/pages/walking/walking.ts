import { Component, Renderer2 } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  LatLngBounds,
  CameraPosition
} from '@ionic-native/google-maps';
import { NativeAudio } from '@ionic-native/native-audio';
import { point, polygon, destination, distance } from '@turf/turf';
import { TranslateService } from '@ngx-translate/core';

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
  target: any;
  tilt: number = 0;
  zoom: number = 17;
  markersAdded: any[] = [];
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
  language: string = "en";

  //video
  showVideoPlay = false;
  iframe_html: any;
  vimeoUrl: string = "https://vimeo.com/";
  vimeoClip: string = "";
  videoPlay: boolean = false;
  playingMarkerID: string;
  swapTourID: number;
  minimised: boolean = false;

  //audio
  playing:boolean = false;

  mapLocationMarker: {top:number,left:number} = {top:0,left:0};
  markerAnimationOption = {
    loop: true,
    prerender: true,
    autoplay: true,
    autoloadSegments: false,
    path: 'assets/animations/marker.json'
  }

  mapLabels: any[] = [];
  timelineLabels: any[] = [];
  swapTour = false;
  footerSwapTourText = "";

  constructor(
    public toastCtrl: ToastController,
    private geolocation: Geolocation,
    private renderer: Renderer2,
    private deviceOrientation: DeviceOrientation,
    private screenOrientation: ScreenOrientation,
    private embedService: EmbedVideoService,
    public restRouteProvider: RestRouteProvider,
    private nativeAudio: NativeAudio,
    public translate: TranslateService
  ) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.locationFix = false;
    this.polygonLoaded = false;
    this.nativeAudio.preloadComplex('uniqueId2', 'assets/sounds/ambient.mp3', 1, 1, 0).then((evt) => {console.log("sound loaded")}, (error: any) => console.log(error + " - load error message"));
    this.nativeAudio.preloadComplex('uniqueId3', 'assets/sounds/bgGame.mp3', 1, 1, 0).then((evt) => {console.log("sound loaded")}, (error: any) => console.log(error + " - load error message"));

    
    this.language = translate.currentLang;
    translate.onLangChange.subscribe((value) => {
        // value is our translated string
        this.language = value.lang;
        console.log(value.lang)
      });
  }

  ionViewDidLoad() {
    this.loadMap();

    // this.listenerFn = this.renderer.listen('window', 'deviceorientation', (evt) => {
    //   this.event = evt;
    //   this.deviceOrientation.getCurrentHeading().then(
    //     (data1: DeviceOrientationCompassHeading) => {
    //       this.magneticHeading = data1.magneticHeading;
    //       this.map.setCameraBearing(this.magneticHeading);
    //     },
    //     (error: any) => console.log(error + " - error message")
    //   );
    // });


  }

  loadMap() {
    // Create a map after the view is loaded.
    // (platform is already ready in app.component.ts)
    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: {
          lat: 54,
          lng: -1
        }//,
        //zoom: 16,
        //tilt: 30
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

    // Wait the maps plugin is ready until the MAP_READY event
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapReady = true;


      let routeRaw:number = this.restRouteProvider.getRouteNumber();

      let page:number = this.restRouteProvider.getRoutePageNumber();

      let allRoutesRaw;
      let sounds;
      if (page==1){
        // walking back in time
        allRoutesRaw = this.restRouteProvider.getAllTimeRoutes();
        this.tourGuide = allRoutesRaw[routeRaw].name;
      } else if (page==2){
        // tour
        allRoutesRaw = this.restRouteProvider.getAllRoutes();
        this.tourGuide = allRoutesRaw[routeRaw].name;
      } else if (page==3){
        allRoutesRaw = [];
        sounds = this.restRouteProvider.getAllSounds();
        this.target = {lat: 40.996635, lng: 28.928335};
        this.zoom = 19;
        this.tilt = 90;
        
        var subscription = this.deviceOrientation.watchHeading().subscribe(
          (data: DeviceOrientationCompassHeading) => this.map.setCameraBearing(data.trueHeading)
        );
      }
        

      for (let k = 0; k < allRoutesRaw.length; k++) {
        // non-selected route
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

          //different coloured lines
          if (page==1){
            this.map.addPolyline({
              points: path,
              //'width': 5,
              width: 4,
              color: 'rgb(255, 81, 50)'
            });
          } else if (page==2){
            this.map.addPolyline({
              points: path,
              //'width': 5,
              width: 4,
              color: '#FFA042'
            });
          } 

          // set zoom too for selected path
          this.target = new LatLngBounds(path);
        }
      }

      // for (let k = 0; k < sounds.length; k++) {

      // }
      
      this.map.moveCamera({
        'target': this.target,
        'tilt': this.tilt,
        'zoom': this.zoom
      });
     
      this.updateLabelPosition();

      // if (page==3){
      //   setInterval(() => {
      //     if (Math.round(this.magneticHeading) != this.map.getCameraBearing()) {
      //       //this.map.setCameraBearing(this.magneticHeading);
      //       //this.rotateMap(this.magneticHeading);
      //       //this.onHeadingChange(this.magneticHeading);
      //     }
      //   }, 50);
      // }
      
      // let myLocation = point([this.location.lng, this.location.lat]);
      // let targetLocation = point([allRoutesRaw[routeRaw].path[0][0], allRoutesRaw[routeRaw].path[0][1]]);
      // // if the distance is less than 40K zoom to your location
      // if (distance(myLocation, targetLocation)<40){
      //else if(page!=3){
        setTimeout(()  =>{
          this.map.animateCamera({
            target: {lat: this.location.lat, lng: this.location.lng},
            //zoom: 17,
            //tilt: this.tilt,
            //bearing: 140,
            duration: 5000
          });
        }, 5000);
        
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
   //this.mapLabels = [];
   for (let k=0; k<this.mapLabels.length; k++){
    this.mapLabels[k].visible = false;
   }
  }

  updateLabelPosition() {
    //select right route
    let routeRaw:number = this.restRouteProvider.getRouteNumber();
    let page:number = this.restRouteProvider.getRoutePageNumber();
    let allRoutesRaw;
    let timeline = false;

    let earliestDate = 3000; //temp
    let latestDate = -3000; //temp


    if (page==1){
      timeline = true;
      allRoutesRaw = this.restRouteProvider.getAllTimeRoutes();
    } else if (page==2){
      allRoutesRaw = this.restRouteProvider.getAllRoutes();
    } else if (page==3){
      allRoutesRaw = this.restRouteProvider.getAllSounds();;
    }

    if (page!=3){
    let markerCount:number=0;
      for (let k=0; k<allRoutesRaw.length; k++){
        
        if (allRoutesRaw[k].points) {
          
          for (let i = 0; i < allRoutesRaw[k].points.length; i++) {
            let selected  = (k == routeRaw ? true : false);
            this.map.fromLatLngToPoint({ lat: allRoutesRaw[k].points[i].lat, lng: allRoutesRaw[k].points[i].long }).then((point: any[]) => {
              
                //add new map marker
                if (this.mapLabels.length==markerCount){
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
                    redColor: timeline,
                    visible: true
                    //action: function() {  this.playVideo(routeRaw,i); console.log("CLICK")}
                  });
                  if (timeline && selected){
                    //timelineLabels
                    let date = parseInt(allRoutesRaw[k].points[i].title, 10);
                    if (date<earliestDate){
                      earliestDate = date;
                    }
                    if (date>latestDate){
                      latestDate = date;
                    }
                    this.drawLimeLine(earliestDate, latestDate);
                  }
                } else { //update map marker position
                  this.mapLabels[markerCount].title = allRoutesRaw[k].points[i].title,
                  this.mapLabels[markerCount].tr_title = allRoutesRaw[k].points[i].tr_title,
                  this.mapLabels[markerCount].point = { left: Math.floor(point[0].toFixed(1)), top: Math.floor(point[1].toFixed(1))-35 };
                  this.mapLabels[markerCount].selected = selected;
                  this.mapLabels[markerCount].location = { lat: allRoutesRaw[k].points[i].lat, lng: allRoutesRaw[k].points[i].long };
                  this.mapLabels[markerCount].vimeo = allRoutesRaw[k].points[i].vimeoID
                  this.mapLabels[markerCount].time = allRoutesRaw[k].points[i].time;
                  this.mapLabels[markerCount].endtime = allRoutesRaw[k].points[i].endtime;

                  if (point[0]>0 && point[1]>0 && point[0]<1000 && point[1]<1000){
                    this.mapLabels[markerCount].visible = true;
                  }else{
                    this.mapLabels[markerCount].visible = false;
                  }
                }
                markerCount++;
            })
          }
        }
      }
    }

    if (page==3){
      if (this.markersAdded.length < 1){    
        for (let k=0; k<allRoutesRaw.length; k++){        
          if (allRoutesRaw[k].points) {            
            for (let i = 0; i < allRoutesRaw[k].points.length; i++) {
              let marker =  this.map.addMarker({position:{lat: allRoutesRaw[k].points[i].lat, lng: allRoutesRaw[k].points[i].long}, title: allRoutesRaw[k].points[i].title})

              this.markersAdded.push(marker);
            }
          }
        } 
      }
      // calculate distance to marker
      if (this.location != null){
        for (let k=0; k<allRoutesRaw.length; k++){        
          if (allRoutesRaw[k].points) {            
            for (let i = 0; i < allRoutesRaw[k].points.length; i++) {
  
              let myLocation = point([this.location.lng, this.location.lat]);
              let targetLocation = point([allRoutesRaw[k].points[i].long, allRoutesRaw[k].points[i].lat]);
  
              //distance in meters
              let distanceToPoint = Math.round(distance(myLocation, targetLocation) * 1000);
              
              if (distanceToPoint < 50){
                if(!this.playing){
                  //play sound
                  this.nativeAudio.play('uniqueId2',() => { this.playing = false; console.log("sound played")} )
                    .then(() => {console.log("sound started")}, 
                    (error: any) => console.log(error + " - error message"));

                    setTimeout(()  =>{
                      this.nativeAudio.play('uniqueId3',() => { this.playing = false; console.log("sound played 3")} )
                      .then(() => {console.log("sound started 3")}, 
                      (error: any) => console.log(error + " - error message 3"));
                    }, 1000);
                 
                    
                  this.playing = true;
                }
              }
            }
          }
        }
      }
    }
  }

  drawLimeLine(earliestDate, latestDate){
    this.timelineLabels = [];
    let timePeriod = latestDate-earliestDate;
    let screenHeight = 500;
    let markerHeight = 64;

    let numberofMarkers = Math.floor(screenHeight/markerHeight);
    let yearsPerMarker = Math.round(timePeriod / numberofMarkers);

    for (let i = 0; i <= (numberofMarkers); i++) {
      this.timelineLabels.push(earliestDate+(i*yearsPerMarker));
    }
  }
  updateLocationMarker() {
    if (this.locationFix) {
      this.map.fromLatLngToPoint({ lat: this.location.lat, lng: this.location.lng }).then((point: any[]) => {
        this.mapLocationMarker = {left: Math.floor(point[0].toFixed(1)-50), top: Math.floor(point[1].toFixed(1))-50};
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
    
    // this.player = new Player('embededvideo', {});
    // this.player.enableTextTrack(this.language, 'subtitles').then((track) => {
    //   // track.language = the iso code for the language
    //   // track.kind = 'captions' or 'subtitles'
    //   // track.label = the human-readable label
    //   console.log(track);
    // }).catch((error) => {
    //   console.log(error);
    //   switch (error.name) {
    //     case 'InvalidTrackLanguageError':
    //       // no track was available with the specified language
    //       break;
    //     case 'InvalidTrackError':
    //       // no track was available with the specified language and kind
    //       break;
    //     default:
    //       // some other error occurred
    //       break;
    //   }
    // });


    // callMethod('enableTextTrack', {
    //   language: language,
    //   kind: kind
    // });
    
    this.playingMarkerID = pointID;


    //convert to ms eg: 1m09s
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

    this.restRouteProvider.getJSONsubs(this.tourGuide).subscribe(data => {
      console.log(time+"  -   "+endtime);
      //
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
    },
    error => console.log(error));

    //get subtitles from vimeo
    this.vimeoSubtitle();

    console.log(this.subData.end[this.subtitlePosition]-this.subData.start[this.subtitlePosition]);

    //close modal
    setTimeout(()  =>{
      this.closeVideo();
    }, endTime-startTime)
  }

  vimeoSubtitle(){
    setTimeout(()  =>{
      if (this.showVideoPlay){
        this.vimeoSubtitle();
      }
    }, 50);

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

  hideVideo(){
    this.minimised = !this.minimised;
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

      this.showVideoPlay = false;

    }
  }

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