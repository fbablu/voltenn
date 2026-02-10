// Enhanced dashboard controller with improved navigation and state management
import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { CommonEngine } from '@angular/ssr/node';
import { OutagesComponent } from '../outages/outages.component';
import { PredictComponent } from '../predict/predict.component';
import { HomeComponent } from '../home/home.component';
import { MapComponent } from '../map/map.component';
import { ProfileComponent } from '../profile/profile.component';

interface Tab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    OutagesComponent,
    PredictComponent,
    HomeComponent,
    MapComponent,
    ProfileComponent,
  ],
  standalone: true,
})
export class DashboardComponent {
  activeTab: string = 'map'; // Start with map as it's most visual

  tabs: Tab[] = [
    {
      id: 'map',
      name: 'Map View',
      icon: 'map',
      description: 'Geographic outage visualization',
    },
    {
      id: 'outages',
      name: 'Risk Analysis',
      icon: 'warning',
      description: 'County risk assessments',
    },
    {
      id: 'predict',
      name: 'AI Assistant',
      icon: 'auto_awesome',
      description: 'Predictive insights & planning',
    },
    {
      id: 'profile',
      name: 'Settings',
      icon: 'person',
      description: 'User & organization management',
    },
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getActiveTabName(): string {
    return this.tabs.find((tab) => tab.id === this.activeTab)?.name || '';
  }

  getActiveTabDescription(): string {
    return (
      this.tabs.find((tab) => tab.id === this.activeTab)?.description || ''
    );
  }

  shouldShowQuickStats(): boolean {
    // Show quick stats on map and outages tabs
    return ['map', 'outages'].includes(this.activeTab);
  }
}
