import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  google_maps_api: string = environment.google_maps_api;
  open_weather_api: string = environment.open_weather_api;

  locations = [
    { name: 'Downtown Nashville', lat: 36.1627, lng: -86.7816 },
    { name: 'East Nashville', lat: 36.18, lng: -86.7386 },
    { name: 'Green Hills', lat: 36.1003, lng: -86.8162 },
    { name: 'Antioch', lat: 36.0581, lng: -86.6704 },
    { name: 'Belle Meade', lat: 36.0973, lng: -86.8651 },
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadGoogleMapsScript();
  }

  loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.google_maps_api}`;
    script.async = true;
    script.defer = true;
    script.onload = this.initMap.bind(this);
    document.head.appendChild(script);
  }

  getOutageLikelihood(weather: any) {
    if (!weather || !weather.wind || !weather.weather) return 'Unknown';
    if (weather.wind.speed > 15 || weather.weather[0].main === 'Thunderstorm') {
      return 'High';
    } else if (weather.wind.speed > 10) {
      return 'Moderate';
    } else {
      return 'Low';
    }
  }

  async fetchWeather(lat: number, lon: number) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.open_weather_api}&units=metric`;
    const response = await fetch(url);
    return await response.json();
  }

  async initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: { lat: 36.1627, lng: -86.7816 },
    });

    for (const loc of this.locations) {
      try {
        const weather = await this.fetchWeather(loc.lat, loc.lng);
        const likelihood = this.getOutageLikelihood(weather);

        const infoContent = `
         <div class="info-window">
           <strong>${loc.name}</strong><br>
           Temperature: ${weather.main.temp} °C<br>
           Weather: ${weather.weather[0].main} - ${weather.weather[0].description}<br>
           Wind Speed: ${weather.wind.speed} m/s<br>
           <strong>Outage Likelihood:</strong> ${likelihood}
         </div>`;

        const marker = new google.maps.Marker({
          position: { lat: loc.lat, lng: loc.lng },
          map: map,
          title: loc.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      } catch (error) {
        console.error(`Failed to fetch weather for ${loc.name}:`, error);
      }
    }
  }
}
