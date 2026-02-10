import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

interface Industry {
  id: string;
  name: string;
  icon: string;
  description: string;
  priority: 'tier1' | 'tier2' | 'tier3';
  averageOutageCost: string;
  keyRisks: string[];
  useCases: string[];
}

interface UserProfile {
  industry: string;
  role: string;
  organizationSize: string;
  primaryConcerns: string[];
  location: {
    state: string;
    county: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    slack: boolean;
    threshold: 'low' | 'medium' | 'high';
  };
  integrations: {
    calendar: boolean;
    projectManagement: boolean;
    iot: boolean;
  };
}

@Component({
  selector: 'app-enhanced-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatStepperModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatRadioModule,
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class EnhancedOnboardingComponent implements OnInit {
  currentStep = 0;

  steps = [
    { title: 'Welcome' },
    { title: 'Industry' },
    { title: 'Role & Location' },
    { title: 'Priorities' },
    { title: 'Notifications' },
    { title: 'Complete' },
  ];

  userProfile: UserProfile = {
    industry: '',
    role: '',
    organizationSize: '',
    primaryConcerns: [],
    location: {
      state: '',
      county: '',
    },
    notifications: {
      email: true,
      sms: false,
      slack: false,
      threshold: 'medium',
    },
    integrations: {
      calendar: false,
      projectManagement: false,
      iot: false,
    },
  };

  industries: Industry[] = [
    // Tier 1 - High Impact
    {
      id: 'construction',
      name: 'Construction',
      icon: 'construction',
      description: 'Projects, equipment, and site safety',
      priority: 'tier1',
      averageOutageCost: '$2K-10K',
      keyRisks: [
        'Equipment downtime',
        'Site safety systems',
        'Schedule delays',
        'Worker safety',
      ],
      useCases: [
        'Schedule adjustments',
        'Generator staging',
        'Safety prep',
        'Resource planning',
      ],
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: 'local_hospital',
      description: 'Hospitals, clinics, and medical facilities',
      priority: 'tier1',
      averageOutageCost: '$10K-50K',
      keyRisks: [
        'Life support systems',
        'Medical equipment',
        'Cold chain storage',
        'Emergency response',
      ],
      useCases: [
        'Equipment backup',
        'Patient evacuation plans',
        'Medication storage',
        'Emergency protocols',
      ],
    },
    {
      id: 'data-centers',
      name: 'Data Centers',
      icon: 'storage',
      description: 'Server farms and cloud infrastructure',
      priority: 'tier1',
      averageOutageCost: '$300K-1M',
      keyRisks: [
        'Server downtime',
        'Cooling failures',
        'SLA breaches',
        'Data loss',
      ],
      useCases: [
        'Workload migration',
        'Cooling management',
        'SLA compliance',
        'Backup power',
      ],
    },

    // Tier 2 - Business Critical
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: 'precision_manufacturing',
      description: 'Production facilities and factories',
      priority: 'tier2',
      averageOutageCost: '$5K-25K',
      keyRisks: [
        'Production line stops',
        'Quality control',
        'Supply chain',
        'Equipment damage',
      ],
      useCases: [
        'Production scheduling',
        'Quality assurance',
        'Supply coordination',
        'Equipment protection',
      ],
    },
    {
      id: 'telecommunications',
      name: 'Telecommunications',
      icon: 'cell_tower',
      description: 'Cell towers and network infrastructure',
      priority: 'tier2',
      averageOutageCost: '$1K-10K',
      keyRisks: [
        'Network outages',
        'Emergency services',
        'Customer service',
        'Infrastructure damage',
      ],
      useCases: [
        'Network redundancy',
        'Emergency protocols',
        'Customer communication',
        'Infrastructure protection',
      ],
    },
    {
      id: 'education',
      name: 'Education',
      icon: 'school',
      description: 'Schools, universities, and research',
      priority: 'tier2',
      averageOutageCost: '$500-5K',
      keyRisks: [
        'Campus safety',
        'Research data',
        'Online learning',
        'HVAC systems',
      ],
      useCases: [
        'Campus emergency plans',
        'Data backup',
        'Remote learning prep',
        'System maintenance',
      ],
    },
    {
      id: 'events',
      name: 'Events & Entertainment',
      icon: 'event',
      description: 'Venues, sports, and entertainment',
      priority: 'tier2',
      averageOutageCost: '$10K-100K',
      keyRisks: [
        'Event cancellation',
        'Crowd safety',
        'Equipment failure',
        'Revenue loss',
      ],
      useCases: [
        'Event planning',
        'Safety protocols',
        'Equipment backup',
        'Crowd management',
      ],
    },

    // Tier 3 - Standard Operations
    {
      id: 'retail',
      name: 'Retail',
      icon: 'store',
      description: 'Stores and shopping centers',
      priority: 'tier3',
      averageOutageCost: '$100-2K',
      keyRisks: [
        'POS systems',
        'Refrigeration',
        'Security systems',
        'Customer experience',
      ],
      useCases: [
        'Payment processing',
        'Inventory protection',
        'Security backup',
        'Customer service',
      ],
    },
    {
      id: 'agriculture',
      name: 'Agriculture',
      icon: 'agriculture',
      description: 'Farms and food production',
      priority: 'tier3',
      averageOutageCost: '$500-5K',
      keyRisks: [
        'Irrigation systems',
        'Livestock care',
        'Food storage',
        'Equipment operation',
      ],
      useCases: [
        'Irrigation backup',
        'Animal care systems',
        'Food preservation',
        'Equipment protection',
      ],
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: 'local_shipping',
      description: 'Logistics and shipping',
      priority: 'tier3',
      averageOutageCost: '$1K-10K',
      keyRisks: [
        'Traffic systems',
        'Fleet management',
        'Cargo handling',
        'Safety systems',
      ],
      useCases: [
        'Route planning',
        'Fleet coordination',
        'Cargo protection',
        'Safety protocols',
      ],
    },
    {
      id: 'other',
      name: 'Other',
      icon: 'business',
      description: 'Custom industry setup',
      priority: 'tier3',
      averageOutageCost: 'Variable',
      keyRisks: [
        'Operational disruption',
        'Safety concerns',
        'Financial impact',
        'Customer service',
      ],
      useCases: [
        'Custom alerts',
        'Risk assessment',
        'Emergency planning',
        'Business continuity',
      ],
    },
  ];

  states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user has already completed onboarding
    const onboardingComplete = localStorage.getItem(
      'gemicast-onboarding-complete',
    );
    if (onboardingComplete === 'true') {
      this.router.navigate(['/dashboard']);
    }
  }

  getTier1Industries(): Industry[] {
    return this.industries.filter((i) => i.priority === 'tier1');
  }

  getTier2Industries(): Industry[] {
    return this.industries.filter((i) => i.priority === 'tier2');
  }

  getTier3Industries(): Industry[] {
    return this.industries.filter(
      (i) => i.priority === 'tier3' && i.id !== 'other',
    );
  }

  selectIndustry(industryId: string): void {
    this.userProfile.industry = industryId;
  }

  getSelectedIndustry(): Industry | undefined {
    return this.industries.find((i) => i.id === this.userProfile.industry);
  }

  getRolesForIndustry(): Array<{ id: string; name: string }> {
    const roleMap: { [key: string]: Array<{ id: string; name: string }> } = {
      construction: [
        { id: 'project-manager', name: 'Project Manager' },
        { id: 'site-supervisor', name: 'Site Supervisor' },
        { id: 'safety-manager', name: 'Safety Manager' },
        { id: 'operations-director', name: 'Operations Director' },
        { id: 'contractor', name: 'General Contractor' },
        { id: 'foreman', name: 'Foreman' },
      ],
      healthcare: [
        { id: 'facility-manager', name: 'Facility Manager' },
        { id: 'operations-director', name: 'Operations Director' },
        { id: 'safety-officer', name: 'Safety Officer' },
        { id: 'it-director', name: 'IT Director' },
        { id: 'administrator', name: 'Administrator' },
        { id: 'maintenance-supervisor', name: 'Maintenance Supervisor' },
      ],
      'data-centers': [
        { id: 'datacenter-manager', name: 'Data Center Manager' },
        { id: 'operations-engineer', name: 'Operations Engineer' },
        { id: 'infrastructure-manager', name: 'Infrastructure Manager' },
        { id: 'reliability-engineer', name: 'Site Reliability Engineer' },
        { id: 'facility-engineer', name: 'Facility Engineer' },
        { id: 'it-director', name: 'IT Director' },
      ],
      manufacturing: [
        { id: 'plant-manager', name: 'Plant Manager' },
        { id: 'production-supervisor', name: 'Production Supervisor' },
        { id: 'maintenance-manager', name: 'Maintenance Manager' },
        { id: 'operations-manager', name: 'Operations Manager' },
        { id: 'safety-coordinator', name: 'Safety Coordinator' },
      ],
    };

    return (
      roleMap[this.userProfile.industry] || [
        { id: 'manager', name: 'Manager' },
        { id: 'supervisor', name: 'Supervisor' },
        { id: 'director', name: 'Director' },
        { id: 'coordinator', name: 'Coordinator' },
        { id: 'executive', name: 'Executive' },
      ]
    );
  }

  getConcernsForIndustry(): Array<{
    id: string;
    name: string;
    description: string;
  }> {
    const concernMap: {
      [key: string]: Array<{ id: string; name: string; description: string }>;
    } = {
      construction: [
        {
          id: 'schedule-delays',
          name: 'Schedule Delays',
          description: 'Preventing project timeline disruptions from outages',
        },
        {
          id: 'equipment-damage',
          name: 'Equipment Protection',
          description: 'Protecting tools and machinery from power fluctuations',
        },
        {
          id: 'site-safety',
          name: 'Site Safety',
          description: 'Maintaining lighting and safety systems during outages',
        },
        {
          id: 'worker-productivity',
          name: 'Worker Productivity',
          description: 'Minimizing idle time and maintaining work efficiency',
        },
      ],
      healthcare: [
        {
          id: 'patient-safety',
          name: 'Patient Safety',
          description: 'Ensuring life support and critical care continuity',
        },
        {
          id: 'medical-equipment',
          name: 'Medical Equipment',
          description: 'Protecting sensitive diagnostic and treatment devices',
        },
        {
          id: 'cold-chain',
          name: 'Cold Chain Storage',
          description: 'Maintaining temperature for medications and vaccines',
        },
        {
          id: 'emergency-response',
          name: 'Emergency Response',
          description: 'Coordinating emergency protocols during outages',
        },
      ],
      'data-centers': [
        {
          id: 'uptime-sla',
          name: 'SLA Compliance',
          description: 'Meeting uptime commitments and service agreements',
        },
        {
          id: 'cooling-systems',
          name: 'Cooling Systems',
          description: 'Preventing server overheating during power events',
        },
        {
          id: 'data-integrity',
          name: 'Data Integrity',
          description: 'Protecting against data loss and corruption',
        },
        {
          id: 'workload-migration',
          name: 'Workload Migration',
          description: 'Planning proactive service redistribution',
        },
      ],
    };

    return (
      concernMap[this.userProfile.industry] || [
        {
          id: 'operational-continuity',
          name: 'Operational Continuity',
          description: 'Maintaining business operations during outages',
        },
        {
          id: 'financial-impact',
          name: 'Financial Impact',
          description: 'Minimizing revenue loss from downtime',
        },
        {
          id: 'safety-compliance',
          name: 'Safety & Compliance',
          description: 'Meeting regulatory and safety requirements',
        },
        {
          id: 'communication',
          name: 'Team Communication',
          description: 'Coordinating response across teams and locations',
        },
      ]
    );
  }

  toggleConcern(concernId: string, event: any): void {
    if (event.target.checked) {
      if (!this.userProfile.primaryConcerns.includes(concernId)) {
        this.userProfile.primaryConcerns.push(concernId);
      }
    } else {
      this.userProfile.primaryConcerns =
        this.userProfile.primaryConcerns.filter((c) => c !== concernId);
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.userProfile.industry;
      case 2:
        return (
          !!this.userProfile.role &&
          !!this.userProfile.organizationSize &&
          !!this.userProfile.location.state &&
          !!this.userProfile.location.county
        );
      default:
        return true;
    }
  }

  nextStep(): void {
    if (this.canProceed()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    this.currentStep--;
  }

  getSelectedRoleName(): string {
    const roles = this.getRolesForIndustry();
    const role = roles.find((r) => r.id === this.userProfile.role);
    return role?.name || '';
  }

  getNotificationSummary(): string {
    const notifications = [];
    if (this.userProfile.notifications.email) notifications.push('Email');
    if (this.userProfile.notifications.sms) notifications.push('SMS');
    if (this.userProfile.notifications.slack) notifications.push('Slack');
    return notifications.join(', ') || 'None';
  }

  completeOnboarding(): void {
    // Save user profile
    localStorage.setItem(
      'gemicast-user-profile',
      JSON.stringify(this.userProfile),
    );
    localStorage.setItem('gemicast-onboarding-complete', 'true');

    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }
}
