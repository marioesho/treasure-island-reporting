import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-report',
  imports: [NgFor],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  @Input() data: any[] = [];

  get headers(): string[] {
    return this.data.length ? Object.keys(this.data[0]) : [];
  }
}
