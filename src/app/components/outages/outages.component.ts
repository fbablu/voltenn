import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import spinner
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
} from 'rxjs'; // Added forkJoin, map
import {
  PredictionService,
  WeatherData,
  PredictionResult,
  CountyRanking, // Import CountyRanking
} from '../../services/prediction.service';

interface CountyData {
  year: number;
  score: number;
}

interface WeatherInfo {
  temperature: number;
  windSpeed: number;
  precipitation: number;
}

@Component({
  selector: 'app-outages',
  templateUrl: './outages.component.html',
  styleUrls: ['./outages.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule, // Add spinner module
  ],
})
export class OutagesComponent implements OnInit {
  predictionForm!: FormGroup;
  searchControl = new FormControl('');
  counties: string[] = [
    'Anderson',
    'Bedford',
    'Benton',
    'Bledsoe',
    'Blount',
    'Bradley',
    'Campbell',
    'Cannon',
    'Carroll',
    'Carter',
    'Cheatham',
    'Chester',
    'Claiborne',
    'Clay',
    'Cocke',
    'Coffee',
    'Crockett',
    'Cumberland',
    'Davidson',
    'Decatur',
    'DeKalb',
    'Dickson',
    'Dyer',
    'Fayette',
    'Fentress',
    'Franklin',
    'Gibson',
    'Giles',
    'Grainger',
    'Greene',
    'Grundy',
    'Hamblen',
    'Hamilton',
    'Hancock',
    'Hardeman',
    'Hardin',
    'Hawkins',
    'Haywood',
    'Henderson',
    'Henry',
    'Hickman',
    'Houston',
    'Humphreys',
    'Jackson',
    'Jefferson',
    'Johnson',
    'Knox',
    'Lake',
    'Lauderdale',
    'Lawrence',
    'Lewis',
    'Lincoln',
    'Loudon',
    'Macon',
    'Madison',
    'Marion',
    'Marshall',
    'Maury',
    'McMinn',
    'McNairy',
    'Meigs',
    'Monroe',
    'Montgomery',
    'Moore',
    'Morgan',
    'Obion',
    'Overton',
    'Perry',
    'Pickett',
    'Polk',
    'Putnam',
    'Rhea',
    'Roane',
    'Robertson',
    'Rutherford',
    'Scott',
    'Sequatchie',
    'Sevier',
    'Shelby',
    'Smith',
    'Stewart',
    'Sullivan',
    'Sumner',
    'Tipton',
    'Trousdale',
    'Unicoi',
    'Union',
    'Van Buren',
    'Warren',
    'Washington',
    'Wayne',
    'Weakley',
    'White',
    'Williamson',
    'Wilson',
  ];
  filteredCounties: string[] = [];
  selectedCounty: string | null = null;
  selectedCountyData: CountyData[] = [];
  latestScore: number = 0;
  countyInsight: string = '';
  weatherAlert: string | null = null;
  recommendations: string[] = [];
  currentWeather: WeatherInfo = {
    temperature: 0,
    windSpeed: 0,
    precipitation: 0,
  };
  weatherDescription: string = '';
  weatherDataLoading: boolean = false;
  lastUpdated: string = '';

  currentPrediction: PredictionResult | null = null;

  readonly CHART_MAX_SCORE = 50;

  mapCounties = [
    { name: 'Shelby', x: 10, y: 100, width: 20, height: 20 },
    { name: 'Tipton', x: 10, y: 80, width: 20, height: 15 },
    { name: 'Fayette', x: 30, y: 100, width: 20, height: 15 },
    { name: 'Haywood', x: 30, y: 80, width: 20, height: 15 },
    { name: 'Madison', x: 50, y: 80, width: 20, height: 20 },
    { name: 'Dyer', x: 30, y: 60, width: 20, height: 15 },
    { name: 'Davidson', x: 100, y: 50, width: 25, height: 25 },
    { name: 'Williamson', x: 100, y: 75, width: 25, height: 15 },
    { name: 'Rutherford', x: 125, y: 60, width: 25, height: 20 },
    { name: 'Sumner', x: 120, y: 30, width: 20, height: 20 },
    { name: 'Montgomery', x: 80, y: 30, width: 25, height: 20 },
    { name: 'Knox', x: 180, y: 60, width: 25, height: 25 },
    { name: 'Hamilton', x: 160, y: 100, width: 25, height: 20 },
    { name: 'Blount', x: 205, y: 70, width: 20, height: 15 },
    { name: 'Anderson', x: 180, y: 40, width: 20, height: 15 },
    { name: 'Sullivan', x: 220, y: 30, width: 20, height: 20 },
  ];

  countyOutageData: { [key: string]: { [key: number]: number } } = {
    Loudon: {
      2015: 14.87,
      2017: 6.21,
      2019: 7.5,
      2021: 8.15,
      2022: 10.2,
      2023: 9.8,
      2024: 8.9,
    },
    Shelby: {
      2015: 7.52,
      2016: 7.22,
      2017: 8.06,
      2018: 6.97,
      2019: 7.69,
      2020: 15.5,
      2021: 12.8,
      2022: 44.17,
      2023: 31.5,
      2024: 23.7,
    },
    Davidson: {
      2018: 5.1,
      2019: 6.3,
      2020: 12.1,
      2021: 9.5,
      2022: 10.8,
      2023: 8.2,
      2024: 7.5,
    },
    Knox: {
      2018: 4.5,
      2019: 5.8,
      2020: 10.2,
      2021: 8.1,
      2022: 9.9,
      2023: 7.5,
      2024: 6.9,
    },
    Hamilton: {
      2018: 6.0,
      2019: 7.1,
      2020: 11.5,
      2021: 9.0,
      2022: 10.3,
      2023: 7.9,
      2024: 7.2,
    },
  };

  // For rankings
  topHighRiskCounties: CountyRanking[] = [];
  topLowRiskCounties: CountyRanking[] = [];
  isFetchingRankings: boolean = false;

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.setupSearch();
    this.updateLastUpdatedTimeUserLocal();
  }

  createForm(): void {
    this.predictionForm = this.fb.group({
      county: [this.selectedCounty, Validators.required],
    });
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm && searchTerm.trim().length > 0) {
          this.filteredCounties = this.counties.filter((county) =>
            county.toLowerCase().includes(searchTerm.toLowerCase()),
          );
        } else {
          this.filteredCounties = [];
        }
      });
  }

  selectCounty(county: string): void {
    this.predictionForm.patchValue({ county });
    this.searchControl.setValue('');
    this.filteredCounties = [];
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.predictionForm.invalid) {
      this.resetCountySpecificUIData();
      return;
    }
    const selected = this.predictionForm.get('county')?.value;
    if (selected && this.counties.includes(selected)) {
      if (this.selectedCounty !== selected) {
        this.resetCountySpecificUIData();
        this.selectedCounty = selected;
        this.loadHistoricalDataForSelectedCounty();
      }
      this.fetchWeatherAndPrediction();
    } else {
      this.resetCountySpecificUIData();
      this.selectedCounty = null;
    }
  }

  refreshData(): void {
    if (this.selectedCounty && !this.weatherDataLoading) {
      this.fetchWeatherAndPrediction();
    }
  }

  resetCountySpecificUIData(): void {
    this.latestScore = 0;
    this.countyInsight = 'Please select a county to see insights.';
    this.recommendations = [];
    this.weatherAlert = null;
    this.currentPrediction = null;
    this.currentWeather = { temperature: 0, windSpeed: 0, precipitation: 0 };
    this.weatherDescription = '';
    this.selectedCountyData = [];
    this.updateLastUpdatedTimeUserLocal();
  }

  loadHistoricalDataForSelectedCounty(): void {
    if (!this.selectedCounty) {
      this.selectedCountyData = [];
      return;
    }
    this.selectedCountyData = [];
    if (this.countyOutageData[this.selectedCounty]) {
      const countyData = this.countyOutageData[this.selectedCounty];
      this.selectedCountyData = Object.keys(countyData)
        .map((yearStr) => {
          const yearNum = parseInt(yearStr, 10);
          return { year: yearNum, score: countyData[yearNum] };
        })
        .sort((a, b) => a.year - b.year);
    }
  }

  fetchWeatherAndPrediction(): void {
    if (!this.selectedCounty) return;
    this.weatherDataLoading = true;
    this.currentPrediction = null;

    this.predictionService
      .getCurrentWeather(this.selectedCounty)
      .pipe(
        finalize(() => {
          this.weatherDataLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (weatherData) => {
          this.currentWeather = {
            temperature: weatherData.temperature,
            windSpeed: weatherData.windSpeed,
            precipitation: (weatherData.precipitationChance ?? 0) / 100,
          };
          this.weatherDescription = weatherData.weatherDescription || '';
          this.lastUpdated =
            weatherData.lastUpdated || new Date().toISOString();
          this.generateWeatherAlert(weatherData);

          this.predictionService.predict(weatherData).subscribe({
            next: (prediction) => {
              this.currentPrediction = prediction;
              this.latestScore = prediction.probability * 100;
              if (prediction.lastUpdated) {
                this.lastUpdated = prediction.lastUpdated;
              }
              this.generateCountyInsight();
              this.generateRecommendations(
                this.calculateRiskLevel(this.latestScore),
              );
            },
            error: (err) => {
              console.error('Error getting prediction:', err);
              this.fallbackToHistoricalScore();
              this.generateCountyInsight();
              this.generateRecommendations(
                this.calculateRiskLevel(this.latestScore),
              );
            },
          });
        },
        error: (err) => {
          console.error('Error getting weather data:', err);
          this.generateWeatherDataFallback();
          this.fallbackToHistoricalScore();
          this.generateCountyInsight();
          this.generateRecommendations(
            this.calculateRiskLevel(this.latestScore),
          );
        },
      });
  }

  fallbackToHistoricalScore() {
    if (this.selectedCounty && this.countyOutageData[this.selectedCounty]) {
      const countyHistData = this.countyOutageData[this.selectedCounty];
      const years = Object.keys(countyHistData).map(Number);
      if (years.length > 0) {
        const latestYear = Math.max(...years);
        this.latestScore = countyHistData[latestYear];
      } else {
        this.latestScore = 0;
      }
    } else {
      this.latestScore = 0;
    }
  }

  generateCountyInsight(): void {
    if (!this.selectedCounty) {
      this.countyInsight = 'Please select a county to see insights.';
      return;
    }
    if (this.currentPrediction) {
      const riskLevel = this.calculateRiskLevel(this.latestScore);
      let riskDescription = riskLevel.toLowerCase().replace('very ', 'very-');
      this.countyInsight = `${this.selectedCounty} County shows a ${riskDescription} risk based on current weather data. Outage probability is ${this.latestScore.toFixed(1)}%.`;
    } else if (this.selectedCountyData.length > 0) {
      const riskLevelString = this.calculateRiskLevel(this.latestScore);
      let riskDescription = riskLevelString
        .toLowerCase()
        .replace('very ', 'very-');
      let trendDescription = 'limited historical data';
      if (this.selectedCountyData.length >= 2) {
        const firstScore = this.selectedCountyData[0].score;
        const lastHistScore =
          this.selectedCountyData[this.selectedCountyData.length - 1].score;
        if (lastHistScore > firstScore * 1.3)
          trendDescription = 'an increasing trend';
        else if (lastHistScore < firstScore * 0.8)
          trendDescription = 'a decreasing trend';
        else trendDescription = 'a relatively stable trend';
      }
      this.countyInsight = `${this.selectedCounty} County shows a ${riskDescription} risk based on the latest historical score of ${this.latestScore.toFixed(1)}. Historical data suggests ${trendDescription}. Live prediction unavailable.`;
    } else {
      this.countyInsight = `No current prediction or historical data available for ${this.selectedCounty}.`;
    }
    this.cdr.detectChanges();
  }

  generateWeatherDataFallback(): void {
    this.currentWeather = {
      temperature: Math.floor(Math.random() * 30) + 55,
      windSpeed: Math.floor(Math.random() * 25) + 5,
      precipitation:
        Math.random() > 0.7 ? parseFloat((Math.random() * 0.5).toFixed(2)) : 0,
    };
    this.weatherDescription = 'Simulated weather conditions (API fallback)';
    this.lastUpdated = new Date().toISOString();
    this.generateWeatherAlert();
  }

  updateLastUpdatedTimeUserLocal(): void {
    this.lastUpdated = new Date().toISOString();
  }

  generateWeatherAlert(weatherDataParam?: WeatherData): void {
    this.weatherAlert = null;
    const ds = weatherDataParam || this.currentWeather;
    let temp: number,
      windSpeed: number,
      precipChance: number | undefined,
      windGust: number | undefined;
    if ('precipitationChance' in ds) {
      const wd = ds as WeatherData;
      temp = wd.temperature;
      windSpeed = wd.windSpeed;
      precipChance = wd.precipitationChance;
      windGust = wd.windGust;
    } else {
      const wi = ds as WeatherInfo;
      temp = wi.temperature;
      windSpeed = wi.windSpeed;
      precipChance = wi.precipitation * 100;
      windGust = windSpeed * 1.5;
    }
    if (windGust && windGust > 30)
      this.weatherAlert = `High wind warning: ${windGust.toFixed(0)} mph gusts.`;
    else if (precipChance && precipChance > 70 && windSpeed > 15)
      this.weatherAlert = `Moderate rain (${precipChance.toFixed(0)}% chance) and wind (${windSpeed.toFixed(0)} mph).`;
    else if (temp > 95)
      this.weatherAlert = `Extreme heat warning: ${temp.toFixed(0)}°F.`;
  }

  generateRecommendations(riskLevel: string): void {
    if (this.currentPrediction && this.currentPrediction.recommendation) {
      this.recommendations = this.currentPrediction.recommendation
        .split(/\.\s+/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.trim() + (s.endsWith('.') ? '' : '.'));
    } else {
      this.recommendations = ['Monitor local weather alerts closely.'];
    }
    this.recommendations.push(
      'Keep phones/power banks charged.',
      'Have flashlights/batteries accessible.',
    );
    if (!this.currentPrediction?.recommendation) {
      this.recommendations.push(
        'Know manual garage door operation.',
        "Check utility's outage map/app.",
      );
    }
    switch (riskLevel) {
      case 'Very High':
        this.recommendations.unshift(
          'Strongly consider backup generator/UPS.',
          'Stock 3+ days food/water.',
        );
        break;
      case 'High':
        this.recommendations.unshift(
          'Stock 1-2 days food/water.',
          'Prepare cooler for perishables.',
        );
        break;
      case 'Moderate':
        if (!this.currentPrediction?.recommendation?.includes('cooler'))
          this.recommendations.push('Have cooler ready.');
        break;
    }
    if (this.weatherAlert?.includes('wind'))
      this.recommendations.push('Secure loose outdoor items.');
    if (this.weatherAlert?.includes('heat'))
      this.recommendations.push('Stay hydrated; check cooling systems.');
    if (
      this.weatherAlert?.includes('rain') &&
      this.currentWeather.precipitation > 0.1
    )
      this.recommendations.push('Monitor for localized flooding.');
    this.cdr.detectChanges();
  }

  formatDateTime(dateStringISO: string): string {
    if (!dateStringISO) return 'Not available';
    try {
      const date = new Date(dateStringISO);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return dateStringISO;
    }
  }

  get countyControl(): FormControl {
    return this.predictionForm.get('county') as FormControl;
  }

  calculateRiskLevel(score: number): string {
    if (score > 75) return 'Very High';
    if (score > 50) return 'High';
    if (score > 25) return 'Moderate';
    if (score > 10) return 'Low';
    return 'Very Low';
  }

  getColorForScore(score: number): string {
    const riskLevel = this.calculateRiskLevel(score);
    switch (riskLevel) {
      case 'Very High':
        return '#d32f2f';
      case 'High':
        return '#f44336';
      case 'Moderate':
        return '#ff9800';
      case 'Low':
        return '#ffc107';
      case 'Very Low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  }

  getBarHeight(score: number): number {
    const scaledScore = Math.min(score, this.CHART_MAX_SCORE);
    const heightPercentage = (scaledScore / this.CHART_MAX_SCORE) * 100;
    return Math.max(5, Math.min(100, heightPercentage));
  }

  // Method to fetch rankings for all counties
  fetchCountyRankings(): void {
    this.isFetchingRankings = true;
    this.topHighRiskCounties = [];
    this.topLowRiskCounties = [];

    this.predictionService
      .getCountyRankings()
      .pipe(
        finalize(() => {
          this.isFetchingRankings = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (rankings) => {
          this.topHighRiskCounties = rankings.high_risk;
          this.topLowRiskCounties = rankings.low_risk;
        },
        error: (err) => {
          console.error('Error fetching county rankings:', err);
          // Optionally show an error message to the user
        },
      });
  }
}
