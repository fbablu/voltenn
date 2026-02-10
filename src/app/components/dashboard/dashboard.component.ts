// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { HomeComponent } from '../home/home.component';
import { MapComponent } from '../map/map.component';
import { OutagesComponent } from '../outages/outages.component';
import { PredictComponent } from '../predict/predict.component';
import { ProfileComponent } from '../profile/profile.component';

interface Tab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    HomeComponent,
    MapComponent,
    OutagesComponent,
    PredictComponent,
    ProfileComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  activeTab = 'outages';
  sidebarCollapsed = false;
  userProfile: any = {};
  unreadNotifications = 3;

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

  constructor() {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const profile = localStorage.getItem('gemicast-user-profile');
    if (profile) {
      this.userProfile = JSON.parse(profile);
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getActiveTabName(): string {
    const tab = this.tabs.find((t) => t.id === this.activeTab);
    return tab ? tab.name : '';
  }

  getActiveTabDescription(): string {
    return (
      this.tabs.find((tab) => tab.id === this.activeTab)?.description || ''
    );
  }

  shouldShowQuickStats(): boolean {
    return this.activeTab === 'outages' || this.activeTab === 'map';
  }
}
