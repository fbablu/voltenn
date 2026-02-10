// src/app/components/home/home.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DashboardCard {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  priority: 'high' | 'medium' | 'low';
}

interface IndustryInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  actionIcon?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 space-y-6 bg-gray-50 min-h-screen">
      <!-- Industry Welcome Section -->
      <div
        class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">
              Welcome to Your {{ getIndustryDisplayName() }} Command Center
            </h1>
            <p class="text-blue-100">
              {{ getIndustryWelcomeMessage() }}
            </p>
          </div>
          <div class="hidden md:block">
            <div
              class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            >
              <span class="material-icons text-3xl">{{
                getIndustryIcon()
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          *ngFor="let card of dashboardCards"
          class="bg-white rounded-lg p-6 shadow-sm border-l-4 hover:shadow-md transition-shadow"
          [class.border-blue-500]="card.color === 'blue'"
          [class.border-green-500]="card.color === 'green'"
          [class.border-yellow-500]="card.color === 'yellow'"
          [class.border-red-500]="card.color === 'red'"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="p-2 rounded-lg"
              [class.bg-blue-100]="card.color === 'blue'"
              [class.bg-green-100]="card.color === 'green'"
              [class.bg-yellow-100]="card.color === 'yellow'"
              [class.bg-red-100]="card.color === 'red'"
            >
              <span
                class="material-icons text-xl"
                [class.text-blue-600]="card.color === 'blue'"
                [class.text-green-600]="card.color === 'green'"
                [class.text-yellow-600]="card.color === 'yellow'"
                [class.text-red-600]="card.color === 'red'"
              >
                {{ card.icon }}
              </span>
            </div>

            <!-- Priority Indicator -->
            <span
              *ngIf="card.priority === 'high'"
              class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full"
            >
              Critical
            </span>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">
              {{ card.title }}
            </h3>
            <p class="text-2xl font-bold text-gray-900 mb-2">
              {{ card.value }}
            </p>

            <div class="flex items-center text-sm">
              <span
                class="material-icons text-xs mr-1"
                [class.text-green-500]="
                  card.trendDirection === 'up' && card.color === 'green'
                "
                [class.text-red-500]="
                  card.trendDirection === 'up' && card.color === 'red'
                "
                [class.text-gray-500]="card.trendDirection === 'stable'"
              >
                {{ getTrendIcon(card.trendDirection) }}
              </span>
              <span class="text-gray-600">{{ card.trend }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Industry Insights & Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Alerts Column -->
        <div class="lg:col-span-2">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Industry-Specific Insights
          </h2>
          <div class="space-y-4">
            <div
              *ngFor="let insight of industryInsights"
              class="p-4 rounded-lg border-l-4"
              [class.bg-yellow-50]="insight.type === 'warning'"
              [class.border-yellow-400]="insight.type === 'warning'"
              [class.bg-blue-50]="insight.type === 'info'"
              [class.border-blue-400]="insight.type === 'info'"
              [class.bg-green-50]="insight.type === 'success'"
              [class.border-green-400]="insight.type === 'success'"
            >
              <div class="flex items-start">
                <span
                  class="material-icons mr-3 mt-0.5"
                  [class.text-yellow-600]="insight.type === 'warning'"
                  [class.text-blue-600]="insight.type === 'info'"
                  [class.text-green-600]="insight.type === 'success'"
                >
                  {{ getInsightIcon(insight.type) }}
                </span>

                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 mb-1">
                    {{ insight.title }}
                  </h3>
                  <p class="text-sm text-gray-600 mb-3">
                    {{ insight.description }}
                  </p>

                  <button
                    *ngIf="insight.action"
                    mat-button
                    class="text-sm"
                    [class.text-yellow-700]="insight.type === 'warning'"
                    [class.text-blue-700]="insight.type === 'info'"
                    [class.text-green-700]="insight.type === 'success'"
                  >
                    <span class="material-icons text-sm mr-1">{{
                      insight.actionIcon || 'arrow_forward'
                    }}</span>
                    {{ insight.action }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div class="space-y-3">
            <button
              *ngFor="let action of getQuickActions()"
              mat-raised-button
              class="w-full justify-start p-4 h-auto"
              [color]="action.primary ? 'primary' : ''"
            >
              <div class="flex items-center">
                <span class="material-icons mr-3">{{ action.icon }}</span>
                <div class="text-left">
                  <div class="font-medium">{{ action.name }}</div>
                  <div class="text-sm opacity-75">{{ action.description }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity Timeline -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div class="space-y-4">
          <div
            *ngFor="let activity of recentActivities"
            class="flex items-start"
          >
            <div
              class="flex-shrink-0 w-2 h-2 mt-2 rounded-full"
              [class.bg-blue-500]="activity.type === 'prediction'"
              [class.bg-yellow-500]="activity.type === 'alert'"
              [class.bg-green-500]="activity.type === 'resolution'"
            ></div>
            <div class="ml-4 flex-1">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500">{{ activity.timestamp }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hover\\:shadow-md:hover {
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  @Input() userIndustry: string = '';
  @Input() userProfile: any = null;

  dashboardCards: DashboardCard[] = [];
  industryInsights: IndustryInsight[] = [];
  recentActivities: any[] = [
    {
      type: 'prediction',
      description: 'High outage risk predicted for Davidson County tomorrow',
      timestamp: '2 minutes ago',
    },
    {
      type: 'alert',
      description: 'Generator maintenance reminder sent to 3 facilities',
      timestamp: '1 hour ago',
    },
    {
      type: 'resolution',
      description: 'All systems operational after scheduled maintenance',
      timestamp: '3 hours ago',
    },
  ];

  ngOnInit() {
    this.loadIndustrySpecificData();
  }

  loadIndustrySpecificData() {
    switch (this.userIndustry) {
      case 'data-centers':
        this.loadDataCenterMetrics();
        break;
      case 'healthcare':
        this.loadHealthcareMetrics();
        break;
      case 'construction':
        this.loadConstructionMetrics();
        break;
      case 'manufacturing':
        this.loadManufacturingMetrics();
        break;
      default:
        this.loadGenericMetrics();
    }
  }

  loadDataCenterMetrics() {
    this.dashboardCards = [
      {
        title: 'System Uptime',
        value: '99.97%',
        trend: '+0.02% vs last month',
        trendDirection: 'up',
        icon: 'dns',
        color: 'green',
        priority: 'high',
      },
      {
        title: 'At-Risk Facilities',
        value: '3',
        trend: '2 high, 1 medium',
        trendDirection: 'stable',
        icon: 'warning',
        color: 'yellow',
        priority: 'high',
      },
      {
        title: 'Cooling Efficiency',
        value: '92%',
        trend: 'Optimal range',
        trendDirection: 'stable',
        icon: 'ac_unit',
        color: 'blue',
        priority: 'medium',
      },
      {
        title: 'Backup Power Status',
        value: '100%',
        trend: 'All generators ready',
        trendDirection: 'up',
        icon: 'power',
        color: 'green',
        priority: 'high',
      },
    ];

    this.industryInsights = [
      {
        type: 'warning',
        title: 'High Outage Risk This Weekend',
        description:
          'Severe weather predicted for Northern Virginia region where 2 data centers are located. Estimated 85% outage probability.',
        action: 'Review Disaster Recovery Plan',
        actionIcon: 'assignment',
      },
      {
        type: 'info',
        title: 'Workload Migration Recommended',
        description:
          'Consider moving non-critical workloads from Virginia to Oregon facility before storm impact.',
        action: 'Start Migration',
        actionIcon: 'cloud_sync',
      },
    ];
  }

  loadHealthcareMetrics() {
    this.dashboardCards = [
      {
        title: 'Facility Status',
        value: '24/25',
        trend: '1 facility on backup power',
        trendDirection: 'stable',
        icon: 'local_hospital',
        color: 'green',
        priority: 'high',
      },
      {
        title: 'Cold Chain Integrity',
        value: '98.2%',
        trend: 'Within compliance',
        trendDirection: 'up',
        icon: 'ac_unit',
        color: 'green',
        priority: 'high',
      },
      {
        title: 'Emergency Power',
        value: '15 min',
        trend: 'Avg backup duration',
        trendDirection: 'stable',
        icon: 'battery_full',
        color: 'yellow',
        priority: 'medium',
      },
      {
        title: 'Supply Chain Risk',
        value: 'Medium',
        trend: '3 routes affected',
        trendDirection: 'up',
        icon: 'local_shipping',
        color: 'yellow',
        priority: 'medium',
      },
    ];

    this.industryInsights = [
      {
        type: 'warning',
        title: 'Critical Medicine Storage Alert',
        description:
          'Outage predicted at Memphis distribution center could affect vaccine cold storage for 48 hours.',
        action: 'Deploy Mobile Cooling',
        actionIcon: 'local_shipping',
      },
      {
        type: 'success',
        title: 'Generator Testing Complete',
        description:
          'All 15 healthcare facilities passed backup power tests. Systems ready for emergency activation.',
        action: 'View Report',
      },
    ];
  }

  loadConstructionMetrics() {
    this.dashboardCards = [
      {
        title: 'Active Projects',
        value: '12',
        trend: '3 at high weather risk',
        trendDirection: 'stable',
        icon: 'construction',
        color: 'blue',
        priority: 'medium',
      },
      {
        title: 'Schedule Risk',
        value: 'High',
        trend: '2 delays possible this week',
        trendDirection: 'up',
        icon: 'schedule',
        color: 'red',
        priority: 'high',
      },
      {
        title: 'Equipment Status',
        value: '94%',
        trend: 'Ready for deployment',
        trendDirection: 'up',
        icon: 'build',
        color: 'green',
        priority: 'medium',
      },
      {
        title: 'Weather Windows',
        value: '3 days',
        trend: 'Good conditions ahead',
        trendDirection: 'up',
        icon: 'wb_sunny',
        color: 'green',
        priority: 'low',
      },
    ];

    this.industryInsights = [
      {
        type: 'warning',
        title: 'Downtown Project at Risk',
        description:
          'High winds and outage probability 85% for Thursday. Consider postponing crane operations.',
        action: 'Reschedule Operations',
        actionIcon: 'schedule',
      },
      {
        type: 'info',
        title: 'Generator Deployment Recommended',
        description:
          'Pre-position backup power at 3 active sites before weather window closes.',
        action: 'Deploy Equipment',
        actionIcon: 'local_shipping',
      },
    ];
  }

  loadManufacturingMetrics() {
    this.dashboardCards = [
      {
        title: 'Production Lines',
        value: '18/20',
        trend: '2 on backup power',
        trendDirection: 'stable',
        icon: 'precision_manufacturing',
        color: 'yellow',
        priority: 'high',
      },
      {
        title: 'Output Risk',
        value: '$2.3M',
        trend: 'Potential weekly loss',
        trendDirection: 'up',
        icon: 'trending_down',
        color: 'red',
        priority: 'high',
      },
      {
        title: 'Supply Chain',
        value: '85%',
        trend: 'Delivery confidence',
        trendDirection: 'down',
        icon: 'local_shipping',
        color: 'yellow',
        priority: 'medium',
      },
      {
        title: 'Energy Efficiency',
        value: '91%',
        trend: 'Above target',
        trendDirection: 'up',
        icon: 'energy_savings_leaf',
        color: 'green',
        priority: 'low',
      },
    ];
  }

  loadGenericMetrics() {
    this.dashboardCards = [
      {
        title: 'System Status',
        value: 'Operational',
        trend: 'All systems normal',
        trendDirection: 'stable',
        icon: 'check_circle',
        color: 'green',
        priority: 'medium',
      },
      {
        title: 'Risk Level',
        value: 'Medium',
        trend: 'Weather dependent',
        trendDirection: 'stable',
        icon: 'warning',
        color: 'yellow',
        priority: 'medium',
      },
    ];
  }

  getIndustryDisplayName(): string {
    const names: { [key: string]: string } = {
      'data-centers': 'Data Center',
      healthcare: 'Healthcare',
      construction: 'Construction',
      manufacturing: 'Manufacturing',
      utilities: 'Utilities',
    };
    return names[this.userIndustry] || 'Operations';
  }

  getIndustryWelcomeMessage(): string {
    const messages: { [key: string]: string } = {
      'data-centers':
        'Monitor uptime, predict outages, and ensure 99.99% availability across your infrastructure.',
      healthcare:
        'Protect critical systems, maintain cold chain integrity, and ensure patient safety during power events.',
      construction:
        'Optimize project schedules, protect equipment, and minimize weather-related delays.',
      manufacturing:
        'Maintain production continuity, protect equipment, and minimize downtime costs.',
    };
    return (
      messages[this.userIndustry] ||
      'Predict outages, optimize operations, and protect your business continuity.'
    );
  }

  getIndustryIcon(): string {
    const icons: { [key: string]: string } = {
      'data-centers': 'dns',
      healthcare: 'local_hospital',
      construction: 'construction',
      manufacturing: 'precision_manufacturing',
    };
    return icons[this.userIndustry] || 'business';
  }

  getQuickActions() {
    const actionSets: { [key: string]: any[] } = {
      'data-centers': [
        {
          name: 'Initiate Failover',
          description: 'Switch to backup systems',
          icon: 'swap_horiz',
          primary: true,
        },
        {
          name: 'Check Generator Status',
          description: 'Verify backup power',
          icon: 'power',
          primary: false,
        },
        {
          name: 'Review SLA Impact',
          description: 'Calculate downtime costs',
          icon: 'assessment',
          primary: false,
        },
      ],
      healthcare: [
        {
          name: 'Deploy Mobile Cooling',
          description: 'Protect cold chain',
          icon: 'local_shipping',
          primary: true,
        },
        {
          name: 'Alert Clinical Staff',
          description: 'Notify care teams',
          icon: 'notification_important',
          primary: false,
        },
        {
          name: 'Check Backup Systems',
          description: 'Verify life support',
          icon: 'favorite',
          primary: false,
        },
      ],
      construction: [
        {
          name: 'Reschedule Operations',
          description: 'Optimize for weather',
          icon: 'schedule',
          primary: true,
        },
        {
          name: 'Deploy Generators',
          description: 'Position backup power',
          icon: 'electrical_services',
          primary: false,
        },
        {
          name: 'Update Project Timeline',
          description: 'Adjust milestones',
          icon: 'timeline',
          primary: false,
        },
      ],
    };

    return (
      actionSets[this.userIndustry] || [
        {
          name: 'Check System Status',
          description: 'Review all systems',
          icon: 'check_circle',
          primary: true,
        },
        {
          name: 'View Predictions',
          description: 'See forecast details',
          icon: 'visibility',
          primary: false,
        },
      ]
    );
  }

  getTrendIcon(direction: string): string {
    switch (direction) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  }

  getInsightIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }
}
