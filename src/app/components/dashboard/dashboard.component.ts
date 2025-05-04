import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { FlexContainerModule } from '@directives';
import { Filters } from '@models';
import { FiltersComponent } from '../filters/filters.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgFor,
    NgIf,
    NgTemplateOutlet,
    FiltersComponent,
    ReportComponent,
    MatCardModule,
    MatListModule,
    FlexContainerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public filters?: Filters;
  public additionalInfo = signal<string[]>([]);
  public errors = signal<string[]>([]);
}
