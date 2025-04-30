import { NgFor } from '@angular/common';
import { Component, effect, input, viewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { ReportItem } from '@models';

@Component({
  selector: 'app-report',
  imports: [NgFor, MatTableModule, MatPaginatorModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  displayedColumns: (keyof ReportItem)[] = ['UPC', 'Name', 'Total Qty', 'Total Amount'];
  data = input.required({ transform: this.transformData });
  paginator = viewChild.required(MatPaginator);

  constructor() {
    effect(() => {
      if (!this.paginator()) return;

      this.data().paginator = this.paginator();
    });
  }

  private transformData(value: ReportItem[]): MatTableDataSource<ReportItem> {
    return new MatTableDataSource<ReportItem>(value);
  }
}
