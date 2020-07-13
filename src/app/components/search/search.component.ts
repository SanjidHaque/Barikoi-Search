import {FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {debounceTime, finalize, switchMap, tap} from 'rxjs/operators';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  isLoading = false;
  bariKoiAPIKey = 'MTc0MDpCS0NWTkNTSjc5';

  zoom = 12;
  center: google.maps.LatLngLiteral;
  markers = [];

  searchText = '';
  searchLocationFormControl = new FormControl();

  locations = [];
  nearbyThings = [];
  selectedLocation = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    navigator.geolocation.getCurrentPosition(position => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
    });

    this.searchLocationFormControl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.locations = [];
          this.isLoading = true;
        }),
        switchMap(value =>
          this.http.get('https://barikoi.xyz/v1/api/search/autocomplete/' + this.bariKoiAPIKey +'/place?q=' + value)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              }),
            )
        )
      ).subscribe((data: any) => {
      if (data.status === 200) {
        this.locations = data.places;
      } else {
        this.locations = [];
      }
    });
  }

  resetForm() {
    this.searchText = '';
    this.selectedLocation = null;
    this.nearbyThings = [];
    this.markers = [];
  }

  setSelectedLocation(location: any) {
    this.selectedLocation = location;
    this.markers.push({
      position: {
        lat: +location.latitude,
        lng: +location.longitude
      },
      label: {
        color: 'black',
        text: ' '
      },
      title: location.address,
      options: {  }
    });

  }

  addMarkers(locations: any[]) {
    this.markers = [];

    locations.forEach(location => {
      this.markers.push({
        position: {
          lat: +location.latitude,
          lng: +location.longitude
        },
        label: {
          color: 'black',
          text: ' '
        },
        title: location.Address
      });
    });
  }

  getNearbyThings(type: string) {
    this.http.get('https://barikoi.xyz/v1/api/search/nearby/category/'
      + this.bariKoiAPIKey
      +'/1/20?longitude='
      + this.selectedLocation.longitude
      +'&&latitude='
      + this.selectedLocation.latitude
      + '&ptype='
      + type)
      .subscribe((response: any) => {
        if (response.Place !== undefined) {
          this.nearbyThings = response.Place;
          this.addMarkers(this.nearbyThings);
        }
      });
  }

}


