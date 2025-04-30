import { NgFor } from '@angular/common';
import { Component, effect, input, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { ReportItem } from '@models';

@Component({
  selector: 'app-report',
  imports: [
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  displayedColumns: (keyof ReportItem)[] = ['UPC', 'Name', 'Total Qty', 'Total Amount'];
  data = input.required({ transform: this.transformData });
  paginator = viewChild.required(MatPaginator);
  sort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.data().paginator = this.paginator();
      this.data().sort = this.sort();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data().filter = filterValue.trim().toLowerCase();
    this.data().paginator?.firstPage();
  }

  private transformData(value: ReportItem[]): MatTableDataSource<ReportItem> {
    return new MatTableDataSource<ReportItem>(value);
  }
}
