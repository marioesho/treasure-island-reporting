import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { Filters } from '@models';
import { FiltersComponent } from '../filters/filters.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, FiltersComponent, ReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public filters?: Filters;
}
