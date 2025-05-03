import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';

import { Filters } from '@models';
import { FiltersComponent } from '../filters/filters.component';
import { ReportComponent } from '../report/report.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgFor,
    NgIf,
    NgTemplateOutlet,
    FiltersComponent,
    ReportComponent,
    MatCardModule,
    MatListModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public filters?: Filters;
  public additionalInfo = signal<string[]>([]);
  public errors = signal<string[]>([]);
}
